import Restaurant from '../models/Restaurant.js';

let defaultRestaurantCache = null;

/**
 * Ensures an active Restaurant exists in the database.
 * Never hardcodes IDs; resolves or creates the active Floveera Restaurant.
 */
export async function getOrCreateDefaultRestaurant() {
  if (defaultRestaurantCache) {
    const verified = await Restaurant.findById(defaultRestaurantCache._id);
    if (verified && verified.status === 'ACTIVE') {
      return verified;
    }
  }

  let restaurant = await Restaurant.findOne({ status: 'ACTIVE' });
  if (!restaurant) {
    restaurant = await Restaurant.create({
      name: 'Floveera Restaurant',
      slug: 'floveera-restaurant',
      logo: '/images/floveera_logo_clean.png',
      phone: '+91 91133 42012',
      email: 'contact@floveera.in',
      address: 'Main Road, Near Block Office',
      city: 'Bhagwanpur',
      state: 'Bihar',
      pincode: '821102',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      taxConfiguration: {
        enabled: true,
        rate: 5,
        gstNumber: ''
      },
      status: 'ACTIVE'
    });
    console.log(`[Restaurant System] Initialized active Floveera Restaurant (${restaurant._id})`);
  } else if (restaurant.name === 'Flovera Restaurant') {
    restaurant.name = 'Floveera Restaurant';
    restaurant.slug = 'floveera-restaurant';
    restaurant.email = 'contact@floveera.in';
    await restaurant.save();
  }

  defaultRestaurantCache = restaurant;

  // Ensure active employee registration invitation exists for testing/initial use
  try {
    const EmployeeInvitation = (await import('../models/EmployeeInvitation.js')).default;
    const existingActiveInvitation = await EmployeeInvitation.findOne({
      restaurantId: restaurant._id,
      status: 'ACTIVE',
      expiresAt: { $gt: new Date() }
    });

    if (!existingActiveInvitation) {
      const defaultInvitation = await EmployeeInvitation.create({
        code: 'FLOV-2026-WORK',
        restaurantId: restaurant._id,
        role: 'RESTAURANT_WORKER',
        autoApprove: true,
        status: 'ACTIVE',
        maxUses: 100,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      console.log(`[Restaurant System] Active employee registration code initialized: ${defaultInvitation.code}`);
    }
  } catch (err) {
    console.warn('[Restaurant System] Could not seed default employee invitation:', err.message);
  }

  return restaurant;
}

/**
 * Emits restaurant order lifecycle events
 * Extensible for WebSocket/Socket.IO/Push notifications in future phases.
 */
export function emitRestaurantOrderEvent(restaurantId, event, data) {
  // Scoped to specific restaurantId
  console.log(`[Realtime Event: ${event}] Scoped to Restaurant ${restaurantId}: Order #${data?.orderNumber || data?._id}`);
}
