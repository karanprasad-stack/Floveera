import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from './models/Restaurant.js';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/floveera';

async function seedCrmDummyData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully to database.');

    // 1. Get or create the main restaurant
    let restaurant = await Restaurant.findOne({ $or: [{ slug: 'floveera-restaurant' }, { slug: 'flovera-restaurant' }] });
    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: 'Floveera Restaurant',
        slug: 'floveera-restaurant',
        phone: '+91 91133 42012',
        email: 'contact@floveera.in',
        address: 'Main Road, Near Block Office',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001',
        isAcceptingOrders: true,
        status: 'ACTIVE',
        settings: {
          autoConfirmOrders: false,
          preparationTimeMinutes: 25,
          deliveryFee: 40,
          minimumOrderAmount: 150,
          taxPercentage: 5
        }
      });
      console.log('Created default restaurant:', restaurant.name);
    } else {
      restaurant.name = 'Floveera Restaurant';
      restaurant.slug = 'floveera-restaurant';
      restaurant.email = 'contact@floveera.in';
      restaurant.isAcceptingOrders = true;
      restaurant.status = 'ACTIVE';
      await restaurant.save();
      console.log('Found restaurant:', restaurant.name);
    }

    // 2. Ensure Admin and Worker users exist
    let admin = await User.findOne({ $or: [{ email: 'admin@floveera.in' }, { email: 'admin@flovera.in' }] });
    if (!admin) {
      admin = await User.create({
        name: 'Karan Prasad (Admin)',
        email: 'admin@floveera.in',
        phone: '9113342012',
        password: 'Password123!',
        role: 'admin',
        restaurantRole: 'RESTAURANT_ADMIN',
        restaurantId: restaurant._id
      });
      console.log('Created Admin user: admin@floveera.in');
    } else {
      admin.email = 'admin@floveera.in';
      admin.restaurantRole = 'RESTAURANT_ADMIN';
      admin.restaurantId = restaurant._id;
      admin.password = 'Password123!';
      await admin.save();
      console.log('Updated Admin user: admin@floveera.in');
    }

    let worker = await User.findOne({ $or: [{ email: 'worker@floveera.in' }, { email: 'worker@flovera.in' }] });
    if (!worker) {
      worker = await User.create({
        name: 'Rahul Kumar (Worker)',
        email: 'worker@floveera.in',
        phone: '9876543210',
        password: 'Password123!',
        role: 'user',
        restaurantRole: 'RESTAURANT_WORKER',
        restaurantId: restaurant._id
      });
      console.log('Created Worker user: worker@floveera.in');
    } else {
      worker.email = 'worker@floveera.in';
      worker.restaurantRole = 'RESTAURANT_WORKER';
      worker.restaurantId = restaurant._id;
      worker.password = 'Password123!';
      await worker.save();
      console.log('Updated Worker user: worker@floveera.in');
    }

    const teamStaff = [
      { name: 'Chef Vikram Singh', email: 'chef.vikram@floveera.in', phone: '9835012345', role: 'RESTAURANT_WORKER' },
      { name: 'Pooja Verma', email: 'pooja.pastry@floveera.in', phone: '9835023456', role: 'RESTAURANT_WORKER' },
      { name: 'Manish Tiwary', email: 'manish.dispatch@floveera.in', phone: '9835034567', role: 'RESTAURANT_WORKER' },
      { name: 'Raju Kumar', email: 'raju.delivery@floveera.in', phone: '9835045678', role: 'RESTAURANT_WORKER' },
      { name: 'Sunita Roy', email: 'sunita.billing@floveera.in', phone: '9835056789', role: 'RESTAURANT_ADMIN' }
    ];

    for (const member of teamStaff) {
      let st = await User.findOne({ $or: [{ email: member.email }, { email: member.email.replace('@floveera.in', '@flovera.in') }] });
      if (!st) {
        await User.create({
          name: member.name,
          email: member.email,
          phone: member.phone,
          password: 'Password123!',
          role: member.role === 'RESTAURANT_ADMIN' ? 'admin' : 'user',
          restaurantRole: member.role,
          restaurantId: restaurant._id
        });
        console.log(`Created staff member: ${member.name} (${member.role})`);
      } else {
        st.email = member.email;
        st.restaurantRole = member.role;
        st.restaurantId = restaurant._id;
        await st.save();
      }
    }

    // 3. Customers pool
    const customerProfiles = [
      { name: 'Karan Prasad', email: 'karan.customer@floveera.in', phone: '9113342099', city: 'Patna', address: 'Flat 402, Shanti Vihar, Boring Road' },
      { name: 'Sneha Roy', email: 'sneha.roy@gmail.com', phone: '9834125678', city: 'Patna', address: 'House 12B, Bailey Road, Raja Bazar' },
      { name: 'Amit Sharma', email: 'amit.sharma@yahoo.com', phone: '9745123980', city: 'Patna', address: 'Plot 45, Kankarbagh Main Road' },
      { name: 'Priya Patel', email: 'priya.patel@outlook.com', phone: '9654128790', city: 'Patna', address: 'Apt 204, Ganga View Residency, Danapur' },
      { name: 'Rohit Verma', email: 'rohit.verma@gmail.com', phone: '9823419056', city: 'Patna', address: 'B-18, Fraser Road, Near Dak Bungalow' },
      { name: 'Ananya Sen', email: 'ananya.sen@gmail.com', phone: '9811234567', city: 'Patna', address: '3rd Floor, Lotus Court, SK Puri' },
      { name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', phone: '9876501234', city: 'Patna', address: 'H.No 88, Ashiana Nagar, Phase 2' },
      { name: 'Neha Gupta', email: 'neha.gupta@example.com', phone: '9890123456', city: 'Patna', address: 'Lane 4, Patliputra Colony' }
    ];

    const customerDocs = [];
    for (const c of customerProfiles) {
      let cust = await User.findOne({ $or: [{ email: c.email }, { phone: c.phone }] });
      if (!cust) {
        cust = await User.create({
          name: c.name,
          email: c.email,
          phone: c.phone,
          password: 'Password123!',
          role: 'user'
        });
      }
      customerDocs.push({ ...c, userDoc: cust });
    }

    // 4. Clean up any previous test orders for clean demonstration, or add new ones
    console.log('Seeding realistic restaurant orders for Floveera Restaurant...');
    const now = new Date();

    // Define helper to get dates offset in minutes/hours
    const timeAgo = (minutes) => new Date(now.getTime() - minutes * 60 * 1000);

    const ordersToSeed = [
      {
        orderNumber: '#LN-R-000101',
        customerIndex: 0, // Karan Prasad
        status: 'PLACED',
        minutesAgo: 10,
        items: [
          { nameSnapshot: 'Paneer Butter Masala', priceSnapshot: 280, quantity: 1, total: 280 },
          { nameSnapshot: 'Butter Naan', priceSnapshot: 45, quantity: 2, total: 90 },
          { nameSnapshot: 'Gulab Jamun (2 pcs)', priceSnapshot: 80, quantity: 1, total: 80 }
        ],
        subtotal: 450,
        deliveryFee: 40,
        tax: 22.5,
        total: 512.5,
        paymentStatus: 'PAID',
        paymentMethod: 'upi',
        customerNotes: 'Please deliver hot. Do not ring doorbell, baby is sleeping.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order placed by Karan Prasad via Website', timestamp: timeAgo(10) }
        ]
      },
      {
        orderNumber: '#LN-R-000102',
        customerIndex: 1, // Sneha Roy
        status: 'CONFIRMED',
        minutesAgo: 22,
        items: [
          { nameSnapshot: 'Hyderabadi Chicken Biryani', priceSnapshot: 360, quantity: 2, total: 720 },
          { nameSnapshot: 'Mirchi Ka Salan', priceSnapshot: 60, quantity: 1, total: 60 },
          { nameSnapshot: 'Raita', priceSnapshot: 40, quantity: 2, total: 80 }
        ],
        subtotal: 860,
        deliveryFee: 40,
        tax: 43,
        total: 943,
        paymentStatus: 'PAID',
        paymentMethod: 'online',
        customerNotes: 'Please include extra spoons and tissue papers.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order placed via Website', timestamp: timeAgo(22) },
          { event: 'ORDER_CONFIRMED', status: 'CONFIRMED', title: 'Order Confirmed', message: 'Order accepted by Operations', timestamp: timeAgo(18), performedBy: { userId: worker._id, name: worker.name, role: 'RESTAURANT_WORKER' } }
        ]
      },
      {
        orderNumber: '#LN-R-000103',
        customerIndex: 2, // Amit Sharma
        status: 'PREPARING',
        minutesAgo: 38,
        items: [
          { nameSnapshot: 'Truffle Alfredo Pasta', priceSnapshot: 320, quantity: 1, total: 320 },
          { nameSnapshot: 'Cheesy Garlic Bread', priceSnapshot: 140, quantity: 1, total: 140 },
          { nameSnapshot: 'Mango Alphonso Shake', priceSnapshot: 150, quantity: 2, total: 300 }
        ],
        subtotal: 760,
        deliveryFee: 40,
        tax: 38,
        total: 838,
        paymentStatus: 'PAID',
        paymentMethod: 'upi',
        customerNotes: 'Please make pasta mildly spiced with extra oregano.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Customer placed order online', timestamp: timeAgo(38) },
          { event: 'ORDER_CONFIRMED', status: 'CONFIRMED', title: 'Order Confirmed', message: 'Kitchen manager confirmed order', timestamp: timeAgo(34), performedBy: { userId: admin._id, name: admin.name, role: 'RESTAURANT_ADMIN' } },
          { event: 'ORDER_PREPARING', status: 'PREPARING', title: 'In the Kitchen', message: 'Chef started preparation', timestamp: timeAgo(25), performedBy: { userId: worker._id, name: worker.name, role: 'RESTAURANT_WORKER' } }
        ]
      },
      {
        orderNumber: '#LN-R-000104',
        customerIndex: 3, // Priya Patel
        status: 'READY',
        minutesAgo: 50,
        items: [
          { nameSnapshot: 'Classic Margherita Pizza (12 inch)', priceSnapshot: 310, quantity: 1, total: 310 },
          { nameSnapshot: 'Crispy French Fries', priceSnapshot: 110, quantity: 1, total: 110 },
          { nameSnapshot: 'Cold Coffee Frappe', priceSnapshot: 130, quantity: 1, total: 130 }
        ],
        subtotal: 550,
        deliveryFee: 40,
        tax: 27.5,
        total: 617.5,
        paymentStatus: 'PAID',
        paymentMethod: 'online',
        customerNotes: 'Keep packaging sealed with restaurant tamper tape.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order submitted', timestamp: timeAgo(50) },
          { event: 'ORDER_CONFIRMED', status: 'CONFIRMED', title: 'Order Confirmed', message: 'Confirmed by kitchen', timestamp: timeAgo(46) },
          { event: 'ORDER_PREPARING', status: 'PREPARING', title: 'Preparing', message: 'Pizza in oven', timestamp: timeAgo(35) },
          { event: 'ORDER_READY', status: 'READY', title: 'Ready for Pickup', message: 'Packed and ready on dispatch counter', timestamp: timeAgo(8), performedBy: { userId: worker._id, name: worker.name, role: 'RESTAURANT_WORKER' } }
        ]
      },
      {
        orderNumber: '#LN-R-000105',
        customerIndex: 4, // Rohit Verma
        status: 'OUT_FOR_DELIVERY',
        minutesAgo: 65,
        items: [
          { nameSnapshot: 'Dal Makhani Royal', priceSnapshot: 260, quantity: 1, total: 260 },
          { nameSnapshot: 'Jeera Rice', priceSnapshot: 140, quantity: 1, total: 140 },
          { nameSnapshot: 'Garlic Naan', priceSnapshot: 55, quantity: 3, total: 165 },
          { nameSnapshot: 'Kadhai Paneer', priceSnapshot: 290, quantity: 1, total: 290 }
        ],
        subtotal: 855,
        deliveryFee: 40,
        tax: 42.75,
        total: 937.75,
        paymentStatus: 'PAID',
        paymentMethod: 'upi',
        customerNotes: 'Rider can call on delivery phone upon arrival.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order received', timestamp: timeAgo(65) },
          { event: 'ORDER_CONFIRMED', status: 'CONFIRMED', title: 'Order Confirmed', message: 'Order accepted', timestamp: timeAgo(60) },
          { event: 'ORDER_PREPARING', status: 'PREPARING', title: 'Preparing', message: 'Meal being prepared', timestamp: timeAgo(45) },
          { event: 'ORDER_READY', status: 'READY', title: 'Ready', message: 'Handed over to delivery executive', timestamp: timeAgo(20) },
          { event: 'ORDER_OUT_FOR_DELIVERY', status: 'OUT_FOR_DELIVERY', title: 'Out For Delivery', message: 'Delivery partner Ramesh on the way', timestamp: timeAgo(15), performedBy: { userId: worker._id, name: worker.name, role: 'RESTAURANT_WORKER' } }
        ]
      },
      {
        orderNumber: '#LN-R-000106',
        customerIndex: 5, // Ananya Sen
        status: 'DELIVERED',
        minutesAgo: 110,
        items: [
          { nameSnapshot: 'Veg Manchurian Dry', priceSnapshot: 240, quantity: 1, total: 240 },
          { nameSnapshot: 'Hakka Noodles', priceSnapshot: 190, quantity: 1, total: 190 },
          { nameSnapshot: 'Chilli Paneer Gravy', priceSnapshot: 270, quantity: 1, total: 270 }
        ],
        subtotal: 700,
        deliveryFee: 40,
        tax: 35,
        total: 775,
        paymentStatus: 'PAID',
        paymentMethod: 'online',
        customerNotes: '',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order placed', timestamp: timeAgo(110) },
          { event: 'ORDER_CONFIRMED', status: 'CONFIRMED', title: 'Order Confirmed', message: 'Order confirmed', timestamp: timeAgo(105) },
          { event: 'ORDER_PREPARING', status: 'PREPARING', title: 'Preparing', message: 'Cooking in progress', timestamp: timeAgo(85) },
          { event: 'ORDER_READY', status: 'READY', title: 'Ready', message: 'Packed for delivery', timestamp: timeAgo(60) },
          { event: 'ORDER_OUT_FOR_DELIVERY', status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', message: 'On delivery route', timestamp: timeAgo(45) },
          { event: 'ORDER_DELIVERED', status: 'DELIVERED', title: 'Delivered', message: 'Order delivered safely to customer', timestamp: timeAgo(20), performedBy: { userId: worker._id, name: worker.name, role: 'RESTAURANT_WORKER' } }
        ]
      },
      {
        orderNumber: '#LN-R-000107',
        customerIndex: 6, // Vikram Malhotra
        status: 'DELIVERED',
        minutesAgo: 180,
        items: [
          { nameSnapshot: 'Butter Chicken Masala', priceSnapshot: 380, quantity: 1, total: 380 },
          { nameSnapshot: 'Butter Roti', priceSnapshot: 25, quantity: 4, total: 100 },
          { nameSnapshot: 'Chocolate Lava Cake', priceSnapshot: 180, quantity: 2, total: 360 }
        ],
        subtotal: 840,
        deliveryFee: 40,
        tax: 42,
        total: 922,
        paymentStatus: 'PAID',
        paymentMethod: 'online',
        customerNotes: 'Please send fork and knife for lava cake.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order placed', timestamp: timeAgo(180) },
          { event: 'ORDER_CONFIRMED', status: 'CONFIRMED', title: 'Order Confirmed', message: 'Order accepted', timestamp: timeAgo(175) },
          { event: 'ORDER_PREPARING', status: 'PREPARING', title: 'Preparing', message: 'In kitchen', timestamp: timeAgo(150) },
          { event: 'ORDER_READY', status: 'READY', title: 'Ready', message: 'Packed', timestamp: timeAgo(120) },
          { event: 'ORDER_OUT_FOR_DELIVERY', status: 'OUT_FOR_DELIVERY', title: 'Out for delivery', message: 'Dispatched', timestamp: timeAgo(90) },
          { event: 'ORDER_DELIVERED', status: 'DELIVERED', title: 'Delivered', message: 'Delivered to customer', timestamp: timeAgo(60) }
        ]
      },
      {
        orderNumber: '#LN-R-000108',
        customerIndex: 7, // Neha Gupta
        status: 'CANCELLED',
        minutesAgo: 210,
        items: [
          { nameSnapshot: 'Paneer Tikka Roll', priceSnapshot: 160, quantity: 2, total: 320 },
          { nameSnapshot: 'Lemon Ice Tea', priceSnapshot: 90, quantity: 2, total: 180 }
        ],
        subtotal: 500,
        deliveryFee: 40,
        tax: 25,
        total: 565,
        paymentStatus: 'REFUNDED',
        paymentMethod: 'online',
        customerNotes: 'Cancelled by customer before preparation started.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order placed', timestamp: timeAgo(210) },
          { event: 'ORDER_CANCELLED', status: 'CANCELLED', title: 'Order Cancelled', message: 'Customer requested cancellation: wrong address selected. Refund processed.', timestamp: timeAgo(200), performedBy: { userId: admin._id, name: admin.name, role: 'RESTAURANT_ADMIN' } }
        ]
      },
      {
        orderNumber: '#LN-R-000109',
        customerIndex: 1, // Sneha Roy
        status: 'PLACED',
        minutesAgo: 5,
        items: [
          { nameSnapshot: 'Crispy Chilli Babycorn', priceSnapshot: 220, quantity: 1, total: 220 },
          { nameSnapshot: 'Veg Fried Rice', priceSnapshot: 180, quantity: 1, total: 180 },
          { nameSnapshot: 'Virgin Mojito', priceSnapshot: 120, quantity: 1, total: 120 }
        ],
        subtotal: 520,
        deliveryFee: 40,
        tax: 26,
        total: 586,
        paymentStatus: 'PENDING',
        paymentMethod: 'cod',
        customerNotes: 'Cash on delivery. Please bring change for ₹1000 note.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order placed via Website (Cash on Delivery)', timestamp: timeAgo(5) }
        ]
      },
      {
        orderNumber: '#LN-R-000110',
        customerIndex: 2, // Amit Sharma
        status: 'CONFIRMED',
        minutesAgo: 14,
        items: [
          { nameSnapshot: 'Chicken Tikka Butter Masala', priceSnapshot: 350, quantity: 1, total: 350 },
          { nameSnapshot: 'Lachha Paratha', priceSnapshot: 40, quantity: 3, total: 120 },
          { nameSnapshot: 'Sweet Lassi', priceSnapshot: 80, quantity: 1, total: 80 }
        ],
        subtotal: 550,
        deliveryFee: 40,
        tax: 27.5,
        total: 617.5,
        paymentStatus: 'PAID',
        paymentMethod: 'upi',
        customerNotes: 'Extra onions and lemons please.',
        timeline: [
          { event: 'ORDER_CREATED', status: 'PLACED', title: 'Order Placed', message: 'Order submitted', timestamp: timeAgo(14) },
          { event: 'ORDER_CONFIRMED', status: 'CONFIRMED', title: 'Order Confirmed', message: 'Operations accepted the order', timestamp: timeAgo(11), performedBy: { userId: worker._id, name: worker.name, role: 'RESTAURANT_WORKER' } }
        ]
      }
    ];

    let createdCount = 0;
    for (const ordData of ordersToSeed) {
      const cust = customerDocs[ordData.customerIndex];
      const existing = await Order.findOne({ orderNumber: ordData.orderNumber });
      
      const payload = {
        orderNumber: ordData.orderNumber,
        restaurantId: restaurant._id,
        customerId: cust.userDoc._id,
        user: cust.userDoc._id,
        customer: {
          name: cust.name,
          phone: cust.phone,
          email: cust.email
        },
        storeName: restaurant.name,
        vertical: 'restaurant',
        items: ordData.items.map(it => ({
          nameSnapshot: it.nameSnapshot,
          name: it.nameSnapshot,
          priceSnapshot: it.priceSnapshot,
          price: it.priceSnapshot,
          quantity: it.quantity,
          total: it.total
        })),
        subtotal: ordData.subtotal,
        deliveryFee: ordData.deliveryFee,
        tax: ordData.tax,
        taxes: ordData.tax,
        discount: 0,
        total: ordData.total,
        grandTotal: ordData.total,
        deliveryAddress: {
          label: 'Home',
          fullName: cust.name,
          phone: cust.phone,
          addressLine1: cust.address,
          city: cust.city,
          state: 'Bihar',
          pincode: '800001'
        },
        customerNotes: ordData.customerNotes,
        source: 'WEBSITE',
        orderStatus: ordData.status,
        status: ordData.status.toLowerCase(),
        paymentMethod: ordData.paymentMethod,
        paymentStatus: ordData.paymentStatus,
        timeline: ordData.timeline,
        createdAt: timeAgo(ordData.minutesAgo),
        updatedAt: timeAgo(ordData.minutesAgo - 2)
      };

      if (!existing) {
        await Order.create(payload);
        createdCount++;
        console.log(`Created order: ${ordData.orderNumber} (${ordData.status}) - ${cust.name}`);
      } else {
        Object.assign(existing, payload);
        await existing.save();
        console.log(`Updated order: ${ordData.orderNumber} (${ordData.status}) - ${cust.name}`);
      }
    }

    console.log(`\n====================================================`);
    console.log(`DUMMY DATA SEEDING COMPLETE:`);
    console.log(`- Restaurant: ${restaurant.name} (${restaurant._id})`);
    console.log(`- Admin: admin@floveera.in / Password123!`);
    console.log(`- Worker: worker@floveera.in / Password123!`);
    console.log(`- Seeded/Updated ${ordersToSeed.length} realistic orders across all lifecycle states.`);
    console.log(`====================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedCrmDummyData();
