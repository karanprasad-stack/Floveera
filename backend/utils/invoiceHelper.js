import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import Counter from '../models/Counter.js';
import { getOrCreateDefaultRestaurant } from './restaurantHelper.js';

/**
 * Idempotently retrieves or creates an official, immutable Invoice for an Order.
 * Ensures data consistency across Customer Website, Restaurant CRM, and PDF downloads.
 */
export async function getOrCreateInvoiceForOrder(orderOrId) {
  let order = orderOrId;

  // Resolve Order if only ID or orderNumber is supplied
  if (!order || typeof order === 'string' || mongoose.Types.ObjectId.isValid(order)) {
    const query = typeof order === 'string' && !mongoose.Types.ObjectId.isValid(order)
      ? { orderNumber: String(order).toUpperCase() }
      : { _id: order };
    order = await Order.findOne(query);
  }

  if (!order) {
    throw new Error('Order not found for invoice generation');
  }

  // 1. Check for existing invoice (Idempotency guarantee)
  const existingInvoice = await Invoice.findOne({ orderId: order._id });
  if (existingInvoice) {
    // Keep live operational payment / order status synchronized without modifying immutable snapshot totals
    const currentOrderStatus = order.orderStatus || order.status?.toUpperCase() || 'PLACED';
    const currentPaymentStatus = order.paymentStatus || 'PENDING';
    let needsSave = false;

    if (existingInvoice.orderStatus !== currentOrderStatus) {
      existingInvoice.orderStatus = currentOrderStatus;
      needsSave = true;
    }
    if (existingInvoice.paymentStatus !== currentPaymentStatus) {
      existingInvoice.paymentStatus = currentPaymentStatus;
      needsSave = true;
    }

    if (needsSave) {
      await existingInvoice.save();
    }
    return existingInvoice;
  }

  // 2. Fetch Restaurant for historical billing snapshot
  let restaurant = null;
  if (order.restaurantId && mongoose.Types.ObjectId.isValid(order.restaurantId)) {
    restaurant = await Restaurant.findById(order.restaurantId);
  }
  if (!restaurant) {
    restaurant = await getOrCreateDefaultRestaurant();
  }

  // 3. Generate Unique, Persistent Invoice Number
  // Format: INV-LN-XXXXXX matching order format LN-R-XXXXXX or atomic sequential
  let invoiceNumber = '';
  const orderNumMatch = order.orderNumber ? String(order.orderNumber).match(/LN-R-(\d+)/i) : null;
  if (orderNumMatch && orderNumMatch[1]) {
    const candidateNumber = `INV-LN-${orderNumMatch[1]}`;
    const collisionCheck = await Invoice.findOne({ invoiceNumber: candidateNumber });
    if (!collisionCheck) {
      invoiceNumber = candidateNumber;
    }
  }

  if (!invoiceNumber) {
    invoiceNumber = await Counter.getNextInvoiceNumber(restaurant?._id || order.restaurantId);
  }

  // 4. Build Historical Snapshots
  const customerSnapshot = {
    name: order.customer?.name || order.deliveryAddress?.fullName || 'Customer',
    phone: order.customer?.phone || order.deliveryAddress?.phone || 'N/A',
    email: order.customer?.email || 'customer@floveera.in',
    deliveryAddress: {
      label: order.deliveryAddress?.label || 'Home',
      fullName: order.deliveryAddress?.fullName || order.customer?.name || 'Customer',
      phone: order.deliveryAddress?.phone || order.customer?.phone || 'N/A',
      addressLine1: order.deliveryAddress?.addressLine1 || 'Delivery Address',
      addressLine2: order.deliveryAddress?.addressLine2 || '',
      landmark: order.deliveryAddress?.landmark || '',
      city: order.deliveryAddress?.city || 'Bhagwanpur',
      state: order.deliveryAddress?.state || 'Bihar',
      pincode: order.deliveryAddress?.pincode || '821102'
    }
  };

  const restaurantSnapshot = {
    name: restaurant?.name || order.storeName || 'Floveera Restaurant',
    address: restaurant?.address || 'Main Road, Near Block Office',
    city: restaurant?.city || 'Bhagwanpur',
    state: restaurant?.state || 'Bihar',
    pincode: restaurant?.pincode || '821102',
    phone: restaurant?.phone || '+91 91133 42012',
    email: restaurant?.email || 'contact@floveera.in',
    gstin: restaurant?.taxConfiguration?.gstNumber || '10AAAAA0000A1Z5'
  };

  const itemsSnapshot = (order.items || []).map(item => ({
    productId: item.productId ? String(item.productId) : '',
    nameSnapshot: item.nameSnapshot || item.name || 'Item',
    skuSnapshot: item.skuSnapshot || '',
    priceSnapshot: item.priceSnapshot !== undefined ? Number(item.priceSnapshot) : (Number(item.price) || 0),
    quantity: Math.max(1, Number(item.quantity) || 1),
    variant: item.variant || item.unit || '',
    addons: Array.isArray(item.addons) ? item.addons : [],
    notes: item.notes || item.customization?.notes || '',
    total: item.total !== undefined ? Number(item.total) : (Number(item.price || 0) * (Number(item.quantity) || 1))
  }));

  const authoritativeTax = order.tax !== undefined ? Number(order.tax) : (Number(order.taxes) || 0);
  const halfTax = Math.round((authoritativeTax / 2) * 100) / 100;
  const otherHalf = Math.round((authoritativeTax - halfTax) * 100) / 100;
  const taxRate = restaurant?.taxConfiguration?.rate || 5;

  const newInvoice = new Invoice({
    invoiceNumber,
    orderId: order._id,
    orderNumber: order.orderNumber,
    restaurantId: order.restaurantId || restaurant._id,
    customerId: order.customerId || order.user,
    customerSnapshot,
    restaurantSnapshot,
    itemsSnapshot,
    subtotal: Number(order.subtotal) || 0,
    discount: Number(order.discount) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    tax: authoritativeTax,
    taxes: authoritativeTax,
    taxDetails: {
      rate: taxRate,
      cgst: halfTax,
      sgst: otherHalf,
      igst: 0
    },
    total: order.grandTotal !== undefined ? Number(order.grandTotal) : Number(order.total),
    grandTotal: order.grandTotal !== undefined ? Number(order.grandTotal) : Number(order.total),
    paymentMethod: order.paymentMethod || 'online',
    paymentStatus: order.paymentStatus || 'PENDING',
    orderStatus: order.orderStatus || order.status?.toUpperCase() || 'PLACED',
    orderDate: order.createdAt || new Date(),
    issuedAt: new Date()
  });

  try {
    const saved = await newInvoice.save();
    return saved;
  } catch (err) {
    if (err.code === 11000) {
      // Race condition safeguard: return existing invoice created in parallel
      const raceInvoice = await Invoice.findOne({ orderId: order._id });
      if (raceInvoice) return raceInvoice;
    }
    throw err;
  }
}
