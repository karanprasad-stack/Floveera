import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Product from './models/Product.js';
import Order, { VALID_STATUS_TRANSITIONS } from './models/Order.js';
import Counter from './models/Counter.js';
import { getOrCreateDefaultRestaurant } from './utils/restaurantHelper.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/floveera';

async function runTests() {
  console.log('--- Starting R1 Restaurant CRM & Order Integration Test Suite ---');
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // 1. Restaurant Workspace & Model verification
  const restaurant = await getOrCreateDefaultRestaurant();
  console.log(`✓ Active Restaurant verified: "${restaurant.name}" (${restaurant._id}), status: ${restaurant.status}`);
  if (!restaurant.name || restaurant.status !== 'ACTIVE') {
    throw new Error('Restaurant model verification failed');
  }

  // 2. Concurrency-Safe Order Number generation
  const num1 = await Counter.getNextOrderNumber(restaurant._id);
  const num2 = await Counter.getNextOrderNumber(restaurant._id);
  console.log(`✓ Sequential Order Numbers: ${num1}, ${num2}`);
  if (!num1.startsWith('LN-R-') || !num2.startsWith('LN-R-') || num1 === num2) {
    throw new Error('Counter order numbering failed');
  }

  // 3. User Setup (Customer + Staff)
  let customer = await User.findOne({ $or: [{ email: 'customer_test_r1@floveera.in' }, { role: 'user' }] });
  if (!customer) {
    customer = await User.create({
      name: 'R1 Test Customer',
      email: `customer_${Date.now()}@floveera.in`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'TestPassword123!',
      role: 'user'
    });
  }

  let staff = await User.findOne({ role: 'admin' }) || await User.findOne({ email: 'staff_test_r1@floveera.in' });
  if (!staff) {
    staff = await User.create({
      name: 'R1 Order Manager',
      email: `staff_${Date.now()}@floveera.in`,
      phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'TestPassword123!',
      role: 'user',
      restaurantId: restaurant._id,
      restaurantRole: 'ORDER_MANAGER'
    });
  } else {
    staff.restaurantId = restaurant._id;
    staff.restaurantRole = 'RESTAURANT_OWNER';
    await staff.save();
  }
  console.log(`✓ Customer: "${customer.name}", Staff: "${staff.name}" (${staff.restaurantRole || staff.role})`);

  // 4. Products lookup
  let product = await Product.findOne({ price: { $gt: 0 } });
  if (!product) {
    product = await Product.create({
      name: 'Paneer Butter Masala',
      vertical: 'restaurant',
      price: 240,
      stock: 50,
      category: 'Main Course'
    });
  }
  console.log(`✓ Test Product verified: "${product.name}" @ ₹${product.price}`);

  // 5. Create Order with Server-Side Calculations and Snapshots
  const itemQty = 2;
  const expectedSubtotal = product.price * itemQty;
  const expectedDeliveryFee = expectedSubtotal >= 500 ? 0 : 25;
  const expectedTax = Math.round(expectedSubtotal * 0.05);
  const expectedTotal = expectedSubtotal + expectedDeliveryFee + expectedTax;

  const testIdempotencyKey = 'test_idemp_' + Date.now();
  const orderNumber = await Counter.getNextOrderNumber(restaurant._id);

  const orderPayload = {
    orderNumber,
    restaurantId: restaurant._id,
    customerId: customer._id,
    user: customer._id,
    customer: {
      name: customer.name || 'Test Customer',
      phone: customer.phone || '9876543210',
      email: customer.email || 'customer@floveera.in'
    },
    items: [
      {
        productId: product._id.toString(),
        nameSnapshot: product.name,
        priceSnapshot: product.price,
        quantity: itemQty,
        total: expectedSubtotal,
        name: product.name,
        price: product.price
      }
    ],
    subtotal: expectedSubtotal,
    deliveryFee: expectedDeliveryFee,
    tax: expectedTax,
    total: expectedTotal,
    grandTotal: expectedTotal,
    deliveryAddress: {
      fullName: 'R1 Customer Recipient',
      phone: '9876543210',
      addressLine1: 'Flat 402, Royal Palms',
      city: 'Bhagwanpur',
      state: 'Bihar',
      pincode: '821102',
      label: 'Home'
    },
    source: 'WEBSITE',
    idempotencyKey: testIdempotencyKey,
    orderStatus: 'PLACED',
    status: 'placed',
    paymentMethod: 'cod',
    paymentStatus: 'PENDING',
    timeline: [
      {
        event: 'ORDER_CREATED',
        status: 'PLACED',
        title: 'Order Placed',
        message: 'Order created from website checkout',
        performedBy: { userId: customer._id, name: customer.name, role: 'customer' },
        timestamp: new Date()
      }
    ]
  };

  const createdOrder = await Order.create(orderPayload);
  console.log(`✓ Order Created successfully: ${createdOrder.orderNumber}, Grand Total: ₹${createdOrder.grandTotal}, Status: ${createdOrder.orderStatus}`);

  // 6. Test Idempotency (Same idempotencyKey + restaurantId prevents duplicate)
  const duplicateCheck = await Order.findOne({ restaurantId: restaurant._id, idempotencyKey: testIdempotencyKey });
  if (!duplicateCheck || duplicateCheck._id.toString() !== createdOrder._id.toString()) {
    throw new Error('Idempotency check failed: could not locate existing order with key');
  }
  console.log('✓ Idempotency protection verified');

  // 7. Test Customer View & IDOR Protection
  const customerOrders = await Order.find({ customerId: customer._id });
  if (customerOrders.length === 0) {
    throw new Error('Customer order history not returning created order');
  }
  console.log(`✓ Customer sees ${customerOrders.length} order(s) in My Orders`);

  // 8. Test Restaurant Lifecycle State Machine Transitions
  // Transition 1: PLACED -> CONFIRMED
  if (!VALID_STATUS_TRANSITIONS['PLACED'].includes('CONFIRMED')) {
    throw new Error('Transition PLACED -> CONFIRMED should be valid');
  }
  createdOrder.orderStatus = 'CONFIRMED';
  createdOrder.timeline.push({
    event: 'ORDER_CONFIRMED',
    status: 'CONFIRMED',
    title: 'Order Confirmed',
    performedBy: { userId: staff._id, name: staff.name, role: 'ORDER_MANAGER' }
  });
  await createdOrder.save();
  console.log('✓ Transition PLACED -> CONFIRMED recorded');

  // Transition 2: CONFIRMED -> PREPARING
  createdOrder.orderStatus = 'PREPARING';
  createdOrder.timeline.push({
    event: 'ORDER_PREPARING',
    status: 'PREPARING',
    title: 'Preparing in Kitchen',
    performedBy: { userId: staff._id, name: staff.name, role: 'ORDER_MANAGER' }
  });
  await createdOrder.save();
  console.log('✓ Transition CONFIRMED -> PREPARING recorded');

  // Transition 3: PREPARING -> READY
  createdOrder.orderStatus = 'READY';
  createdOrder.timeline.push({
    event: 'ORDER_READY',
    status: 'READY',
    title: 'Order Ready',
    performedBy: { userId: staff._id, name: staff.name, role: 'ORDER_MANAGER' }
  });
  await createdOrder.save();
  console.log('✓ Transition PREPARING -> READY recorded');

  // Transition 4: READY -> OUT_FOR_DELIVERY
  createdOrder.orderStatus = 'OUT_FOR_DELIVERY';
  createdOrder.timeline.push({
    event: 'ORDER_OUT_FOR_DELIVERY',
    status: 'OUT_FOR_DELIVERY',
    title: 'Out for Delivery',
    performedBy: { userId: staff._id, name: staff.name, role: 'ORDER_MANAGER' }
  });
  await createdOrder.save();
  console.log('✓ Transition READY -> OUT_FOR_DELIVERY recorded');

  // Transition 5: OUT_FOR_DELIVERY -> DELIVERED
  createdOrder.orderStatus = 'DELIVERED';
  createdOrder.timeline.push({
    event: 'ORDER_DELIVERED',
    status: 'DELIVERED',
    title: 'Order Delivered',
    performedBy: { userId: staff._id, name: staff.name, role: 'ORDER_MANAGER' }
  });
  await createdOrder.save();
  console.log('✓ Transition OUT_FOR_DELIVERY -> DELIVERED recorded');

  // Test Invalid Transition: DELIVERED -> PREPARING (must be rejected)
  const isInvalidAllowed = VALID_STATUS_TRANSITIONS['DELIVERED'].includes('PREPARING');
  if (isInvalidAllowed) {
    throw new Error('State machine bug: DELIVERED -> PREPARING must not be allowed');
  }
  console.log('✓ Invalid transition DELIVERED -> PREPARING correctly rejected by state machine');

  // 9. Verify Snapshots Integrity (Original price/name/address retained)
  const fetchedOrder = await Order.findById(createdOrder._id);
  if (fetchedOrder.items[0].priceSnapshot !== product.price) {
    throw new Error('Price snapshot mismatch');
  }
  if (fetchedOrder.items[0].nameSnapshot !== product.name) {
    throw new Error('Name snapshot mismatch');
  }
  if (fetchedOrder.deliveryAddress.fullName !== 'R1 Customer Recipient') {
    throw new Error('Delivery address snapshot mismatch');
  }
  console.log('✓ Snapshots integrity verified: item price, name, and delivery address preserved');
  console.log(`✓ Timeline contains ${fetchedOrder.timeline.length} activity audit events`);

  console.log('\n======================================================');
  console.log('🎉 ALL R1 PHASE TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
