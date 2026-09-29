import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import Restaurant from '../models/Restaurant.js';
import { authenticateUser } from '../middleware/auth.js';
import { getOrCreateDefaultRestaurant, emitRestaurantOrderEvent } from '../utils/restaurantHelper.js';
import { getOrCreateInvoiceForOrder } from '../utils/invoiceHelper.js';
import { generateInvoicePdfBuffer } from '../utils/invoicePdfGenerator.js';

const router = express.Router();

// All customer order endpoints require authentication
router.use(authenticateUser);

// @route   GET /api/orders/my-orders
// @desc    Get order history for current authenticated customer
router.get('/my-orders', async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { customerId: req.userId },
        { user: req.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Get authoritative invoice data with strict IDOR verification
router.get('/:id/invoice', async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // STRICT IDOR PROTECTION:
    const isOwner = (order.customerId && order.customerId.toString() === req.userId) || 
                    (order.user && order.user.toString() === req.userId);
    const isAdmin = req.user.role === 'admin' || 
      ['RESTAURANT_ADMIN', 'RESTAURANT_OWNER', 'RESTAURANT_MANAGER'].includes(req.user.restaurantRole);
    const isRestaurantStaff = req.user.restaurantId && 
      order.restaurantId && 
      req.user.restaurantId.toString() === order.restaurantId.toString();

    if (!isOwner && !isAdmin && !isRestaurantStaff) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to view this invoice.' });
    }

    const invoice = await getOrCreateInvoiceForOrder(order);
    res.json(invoice);
  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({ message: error.message || 'Failed to retrieve invoice' });
  }
});

// @route   GET /api/orders/:id/invoice/pdf
// @desc    Download or stream authoritative invoice PDF with strict IDOR verification
router.get('/:id/invoice/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // STRICT IDOR PROTECTION:
    const isOwner = (order.customerId && order.customerId.toString() === req.userId) || 
                    (order.user && order.user.toString() === req.userId);
    const isAdmin = req.user.role === 'admin' || 
      ['RESTAURANT_ADMIN', 'RESTAURANT_OWNER', 'RESTAURANT_MANAGER'].includes(req.user.restaurantRole);
    const isRestaurantStaff = req.user.restaurantId && 
      order.restaurantId && 
      req.user.restaurantId.toString() === order.restaurantId.toString();

    if (!isOwner && !isAdmin && !isRestaurantStaff) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to download this invoice.' });
    }

    const invoice = await getOrCreateInvoiceForOrder(order);
    const pdfBuffer = await generateInvoicePdfBuffer(invoice);

    const filename = `Flovera-Invoice-${invoice.orderNumber || order.orderNumber}.pdf`;
    const isInline = req.query.inline === 'true' || req.query.view === 'true';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${isInline ? 'inline' : 'attachment'}; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice PDF generation error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate invoice PDF' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details with strict IDOR authorization
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // STRICT IDOR PROTECTION:
    // Only the order owner or an admin / authorized restaurant worker can access this order
    const isOwner = (order.customerId && order.customerId.toString() === req.userId) || 
                    (order.user && order.user.toString() === req.userId);
    const isAdmin = req.user.role === 'admin' || 
      ['RESTAURANT_ADMIN', 'RESTAURANT_OWNER', 'RESTAURANT_MANAGER'].includes(req.user.restaurantRole);
    const isRestaurantStaff = req.user.restaurantId && 
      order.restaurantId && 
      req.user.restaurantId.toString() === order.restaurantId.toString();

    if (!isOwner && !isAdmin && !isRestaurantStaff) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to view this order.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a new customer order with authoritative server calculations and snapshots
router.post('/', async (req, res) => {
  try {
    const {
      items,
      storeName = 'Floveera Restaurant',
      vertical = 'restaurant',
      deliveryAddress,
      paymentMethod = 'online',
      customerNotes = '',
      idempotencyKey: bodyIdempotencyKey,
      restaurantId: requestedRestaurantId
    } = req.body;

    const idempotencyKey = bodyIdempotencyKey || req.headers['idempotency-key'] || null;

    // 1. Resolve Active Restaurant
    let restaurant = null;
    if (requestedRestaurantId && mongoose.Types.ObjectId.isValid(requestedRestaurantId)) {
      restaurant = await Restaurant.findById(requestedRestaurantId);
    }
    if (!restaurant) {
      restaurant = await getOrCreateDefaultRestaurant();
    }

    if (!restaurant || restaurant.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Selected restaurant is currently not accepting orders.' });
    }

    // 2. Duplicate Order Protection (Idempotency)
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        restaurantId: restaurant._id,
        idempotencyKey: String(idempotencyKey).trim()
      });
      if (existingOrder) {
        return res.status(200).json(existingOrder);
      }
    }

    // 3. Validation: Items Array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required to place an order.' });
    }

    // 4. Validation: Delivery Address
    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.addressLine1 || !deliveryAddress.city) {
      return res.status(400).json({ message: 'Valid delivery address is required (fullName, phone, addressLine1, city).' });
    }

    // 5. Authoritative Server-Side Product Validation & Price Calculations
    const validatedSnapshots = [];
    let calculatedSubtotal = 0;

    for (const rawItem of items) {
      const qty = Math.max(1, parseInt(rawItem.quantity, 10) || 1);
      let authoritativePrice = 0;
      let authoritativeName = rawItem.name;
      let authoritativeSku = '';

      if (rawItem.productId && mongoose.Types.ObjectId.isValid(rawItem.productId)) {
        const dbProduct = await Product.findById(rawItem.productId);
        if (dbProduct) {
          if (dbProduct.stock !== undefined && dbProduct.stock <= 0) {
            return res.status(400).json({ 
              message: `Item "${dbProduct.name}" is currently out of stock.` 
            });
          }
          authoritativePrice = Number(dbProduct.price) || 0;
          authoritativeName = dbProduct.name;
        } else {
          // Fallback if product was removed from active catalog
          authoritativePrice = Math.max(0, Number(rawItem.price) || 0);
        }
      } else {
        // Fallback for custom or direct items
        authoritativePrice = Math.max(0, Number(rawItem.price) || 0);
      }

      // Add-ons calculation
      let addonsSum = 0;
      const safeAddons = [];
      if (rawItem.customization?.addOns && Array.isArray(rawItem.customization.addOns)) {
        for (const addon of rawItem.customization.addOns) {
          const addonPrice = Math.max(0, Number(addon.price) || 0);
          addonsSum += addonPrice;
          safeAddons.push({
            name: String(addon.name || 'Add-on').trim(),
            price: addonPrice
          });
        }
      }

      const itemTotal = (authoritativePrice + addonsSum) * qty;
      calculatedSubtotal += itemTotal;

      validatedSnapshots.push({
        productId: rawItem.productId ? String(rawItem.productId) : undefined,
        nameSnapshot: authoritativeName,
        skuSnapshot: authoritativeSku,
        priceSnapshot: authoritativePrice,
        quantity: qty,
        variant: rawItem.unit || '',
        addons: safeAddons,
        notes: rawItem.customization?.notes || '',
        total: itemTotal,
        // Backward compatibility properties
        name: authoritativeName,
        price: authoritativePrice,
        originalPrice: rawItem.originalPrice ? Number(rawItem.originalPrice) : authoritativePrice,
        unit: rawItem.unit || '',
        image: rawItem.image || '',
        customization: rawItem.customization || {}
      });
    }

    // Authoritative Delivery Fee: FREE above ₹500, else standard ₹25
    const authoritativeDeliveryFee = calculatedSubtotal >= 500 ? 0 : 25;

    // Authoritative Tax Calculation (5% GST if restaurant enabled)
    const taxRate = restaurant.taxConfiguration?.enabled ? (restaurant.taxConfiguration.rate || 5) : 0;
    const authoritativeTax = Math.round(calculatedSubtotal * (taxRate / 100));

    // Authoritative Grand Total
    const authoritativeGrandTotal = calculatedSubtotal + authoritativeDeliveryFee + authoritativeTax;

    // 6. Concurrency-Safe Sequential Order Number (LN-R-XXXXXX)
    const orderNumber = await Counter.getNextOrderNumber(restaurant._id);

    // 7. Initial Lifecycle Timeline
    const initialTimeline = [
      {
        event: 'ORDER_CREATED',
        status: 'PLACED',
        title: 'Order Placed',
        message: 'Your order has been placed and received by Floveera Restaurant.',
        performedBy: {
          userId: req.user._id,
          name: req.user.name || 'Customer',
          role: 'customer'
        },
        timestamp: new Date()
      }
    ];

    // Normalized payment method and status
    const safePaymentMethod = ['online', 'whatsapp', 'cod', 'card', 'upi'].includes(paymentMethod) 
      ? paymentMethod 
      : 'online';
    const safePaymentStatus = safePaymentMethod === 'cod' ? 'PENDING' : 'PAID';

    // 8. Create Order Document
    const newOrder = new Order({
      orderNumber,
      restaurantId: restaurant._id,
      customerId: req.user._id,
      user: req.user._id, // alias
      customer: {
        name: req.user.name || deliveryAddress.fullName.trim(),
        phone: req.user.phone || deliveryAddress.phone.trim(),
        email: req.user.email || 'customer@floveera.in'
      },
      storeName: restaurant.name || storeName,
      vertical,
      items: validatedSnapshots,
      subtotal: calculatedSubtotal,
      deliveryFee: authoritativeDeliveryFee,
      tax: authoritativeTax,
      taxes: authoritativeTax,
      discount: 0,
      total: authoritativeGrandTotal,
      grandTotal: authoritativeGrandTotal,
      deliveryAddress: {
        label: deliveryAddress.label || 'Home',
        fullName: deliveryAddress.fullName.trim(),
        phone: deliveryAddress.phone.trim(),
        addressLine1: deliveryAddress.addressLine1.trim(),
        addressLine2: deliveryAddress.addressLine2 ? deliveryAddress.addressLine2.trim() : '',
        landmark: deliveryAddress.landmark ? deliveryAddress.landmark.trim() : '',
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state ? deliveryAddress.state.trim() : 'Bihar',
        pincode: deliveryAddress.pincode ? deliveryAddress.pincode.trim() : '821102'
      },
      customerNotes: customerNotes ? customerNotes.trim() : '',
      source: 'WEBSITE',
      idempotencyKey: idempotencyKey ? String(idempotencyKey).trim() : undefined,
      orderStatus: 'PLACED',
      status: 'placed',
      paymentMethod: safePaymentMethod,
      paymentStatus: safePaymentStatus,
      estimatedDeliveryTime: '25–35 mins',
      timeline: initialTimeline
    });

    const savedOrder = await newOrder.save();

    // 9. Pre-generate and store official immutable invoice for this order
    try {
      await getOrCreateInvoiceForOrder(savedOrder);
    } catch (invErr) {
      console.warn('Invoice initial creation note:', invErr.message);
    }

    // 10. Real-Time Notification Event Dispatch
    emitRestaurantOrderEvent(restaurant._id.toString(), 'restaurant_order_created', {
      orderId: savedOrder._id,
      orderNumber: savedOrder.orderNumber,
      customerName: savedOrder.customer.name,
      grandTotal: savedOrder.grandTotal,
      orderStatus: savedOrder.orderStatus
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order.' });
  }
});

export default router;
