import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

async function seedTestUsers() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/floveera';
  await mongoose.connect(MONGO_URI);
  const User = (await import('../models/User.js')).default;
  const { getOrCreateDefaultRestaurant } = await import('../utils/restaurantHelper.js');
  const restaurant = await getOrCreateDefaultRestaurant();

  // Ensure Admin
  let admin = await User.findOne({ email: 'admin@floveera.com' });
  if (!admin) {
    admin = new User({
      name: 'Restaurant Admin',
      email: 'admin@floveera.com',
      password: 'adminpassword123',
      phone: '9876500001',
      role: 'admin',
      restaurantRole: 'RESTAURANT_ADMIN',
      restaurantId: restaurant._id,
      status: 'ACTIVE'
    });
    await admin.save();
    console.log('🌱 Seeded admin@floveera.com');
  }

  // Ensure Worker
  let worker = await User.findOne({ email: 'worker@floveera.com' });
  if (!worker) {
    worker = new User({
      name: 'Restaurant Worker',
      email: 'worker@floveera.com',
      password: 'workerpassword123',
      phone: '9876500002',
      role: 'user',
      restaurantRole: 'RESTAURANT_WORKER',
      restaurantId: restaurant._id,
      status: 'ACTIVE'
    });
    await worker.save();
    console.log('🌱 Seeded worker@floveera.com');
  }
}

async function runTests() {
  await seedTestUsers();
  console.log('🚀 Starting Floveera Menu Photo Upload & Website Sync Tests...\n');

  // 1. Authenticate as Restaurant Admin
  console.log('1. Authenticating as Restaurant Admin...');
  const adminLoginRes = await fetch(`${API_BASE}/auth/crm-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@floveera.com', password: 'adminpassword123' })
  });
  const adminLoginCookies = adminLoginRes.headers.get('set-cookie');
  const adminData = await adminLoginRes.json();
  if (!adminLoginRes.ok) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
  }
  console.log(`✅ Admin authenticated: ${adminData.user?.name} (${adminData.user?.restaurantRole || adminData.user?.role})`);

  // 2. Resolve Active Restaurant
  console.log('\n2. Resolving active restaurant...');
  const myRestRes = await fetch(`${API_BASE}/restaurants/my-restaurant`, {
    headers: { cookie: adminLoginCookies }
  });
  const myRestData = await myRestRes.json();
  const restaurantId = myRestData.restaurant?._id;
  if (!restaurantId) {
    throw new Error(`Failed to resolve restaurant: ${JSON.stringify(myRestData)}`);
  }
  console.log(`✅ Active Restaurant ID: ${restaurantId} (${myRestData.restaurant?.name})`);

  // 3. Test Validation: Invalid Mime Type
  console.log('\n3. Testing invalid image format rejection...');
  const invalidMimeRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/upload-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminLoginCookies },
    body: JSON.stringify({
      dataUrl: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
      filename: 'test.txt'
    })
  });
  const invalidMimeData = await invalidMimeRes.json();
  if (invalidMimeRes.status === 400) {
    console.log(`✅ Invalid mime rejected correctly: "${invalidMimeData.message}"`);
  } else {
    throw new Error(`Expected 400 for invalid mime type, got ${invalidMimeRes.status}`);
  }

  // 4. Test Validation: Oversized File (> 5 MB)
  console.log('\n4. Testing oversized image rejection (> 5 MB)...');
  // Create a dummy base64 string larger than 5 MB (6MB of bytes)
  const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0);
  const largeDataUrl = `data:image/png;base64,${largeBuffer.toString('base64')}`;
  const largeRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/upload-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminLoginCookies },
    body: JSON.stringify({
      dataUrl: largeDataUrl,
      filename: 'large.png'
    })
  });
  const largeData = await largeRes.json();
  if (largeRes.status === 400) {
    console.log(`✅ Oversized image rejected correctly: "${largeData.message}"`);
  } else {
    throw new Error(`Expected 400 for oversized image, got ${largeRes.status}`);
  }

  // 5. Test Valid Food Photo Upload
  console.log('\n5. Testing valid food photo upload (PNG / JPEG)...');
  // Small 1x1 transparent PNG in base64
  const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const validDataUrl = `data:image/png;base64,${samplePngBase64}`;
  const uploadRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/upload-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminLoginCookies },
    body: JSON.stringify({
      dataUrl: validDataUrl,
      filename: 'truffle_pasta.png'
    })
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.imageUrl) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
  }
  console.log(`✅ Persistent image uploaded: ${uploadData.imageUrl}`);
  console.log(`   Local file saved as: ${uploadData.filename} (${uploadData.size} bytes)`);

  // Verify static serving of uploaded image
  const staticCheck = await fetch(uploadData.imageUrl);
  if (staticCheck.status === 200) {
    console.log(`✅ Uploaded image successfully accessible via static HTTP URL: ${uploadData.imageUrl}`);
  } else {
    throw new Error(`Static image URL returned HTTP ${staticCheck.status}`);
  }

  // 6. Test Worker Permission Enforcement: Worker CANNOT upload or add dishes
  console.log('\n6. Testing role permissions (Worker cannot upload or add dish)...');
  const workerLoginRes = await fetch(`${API_BASE}/auth/crm-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'worker@floveera.com', password: 'workerpassword123' })
  });
  const workerCookies = workerLoginRes.headers.get('set-cookie');
  
  const workerUploadRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/upload-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: workerCookies },
    body: JSON.stringify({ dataUrl: validDataUrl, filename: 'forbidden.png' })
  });
  if (workerUploadRes.status === 403) {
    console.log('✅ Worker forbidden from uploading photos (403 Access Denied)');
  } else {
    throw new Error(`Worker should have been rejected with 403, got ${workerUploadRes.status}`);
  }

  const workerAddDishRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: workerCookies },
    body: JSON.stringify({ name: 'Unauthorized Dish', price: 200 })
  });
  if (workerAddDishRes.status === 403) {
    console.log('✅ Worker forbidden from adding menu items (403 Access Denied)');
  } else {
    throw new Error(`Worker should have been rejected with 403 from adding dish, got ${workerAddDishRes.status}`);
  }

  // 7. Add Menu Item with Uploaded Photo (Admin Only)
  console.log('\n7. Adding new menu item with uploaded photo (Admin)...');
  const addDishRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminLoginCookies },
    body: JSON.stringify({
      name: 'Artisan Woodfired Truffle Pizza',
      category: 'Italian',
      price: 499,
      dietary: 'veg',
      prepTime: '20 mins',
      isSpecial: true,
      description: 'Hand-stretched dough topped with black summer truffles and fior di latte.',
      imageUrl: uploadData.imageUrl
    })
  });
  const addDishData = await addDishRes.json();
  if (!addDishRes.ok || !addDishData.item?._id) {
    throw new Error(`Failed to add dish: ${JSON.stringify(addDishData)}`);
  }
  const createdItemId = addDishData.item._id;
  console.log(`✅ Menu item created with photo: ID ${createdItemId}, Name: "${addDishData.item.name}"`);

  // 8. Verify Synchronization with Customer Website API
  console.log('\n8. Verifying synchronization on customer website API (/api/products)...');
  const customerProductsRes = await fetch(`${API_BASE}/products?vertical=restaurant`);
  const customerProducts = await customerProductsRes.json();
  const foundOnWebsite = customerProducts.find(p => p._id === createdItemId || p.name === 'Artisan Woodfired Truffle Pizza');
  if (!foundOnWebsite) {
    throw new Error('Newly created dish with photo not found on customer website API!');
  }
  console.log(`✅ Dish found on Customer Website catalog!`);
  console.log(`   Image URL: ${foundOnWebsite.imageUrl}`);
  console.log(`   Category: ${foundOnWebsite.category}`);
  console.log(`   Special: ${foundOnWebsite.isSpecial}`);
  console.log(`   Stock Available: ${foundOnWebsite.isAvailable}`);

  // 9. Update Dish Photo and Price
  console.log('\n9. Editing dish photo and details...');
  const editDishRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/${createdItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie: adminLoginCookies },
    body: JSON.stringify({
      price: 549,
      isSpecial: true,
      description: 'Updated artisan recipe with imported buffalo mozzarella.'
    })
  });
  const editDishData = await editDishRes.json();
  if (!editDishRes.ok) {
    throw new Error(`Failed to update dish: ${JSON.stringify(editDishData)}`);
  }
  // Verify image was preserved!
  if (editDishData.item.imageUrl !== uploadData.imageUrl) {
    throw new Error(`Image URL was lost during edit! Expected ${uploadData.imageUrl}, got ${editDishData.item.imageUrl}`);
  }
  console.log(`✅ Dish updated, existing image preserved: ${editDishData.item.imageUrl}, Price: ₹${editDishData.item.price}`);

  // 10. Toggle Stock Availability (Accessible to Worker/Manager/Admin)
  console.log('\n10. Testing stock availability toggle (Worker marking Out of Stock)...');
  const toggleRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/${createdItemId}/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie: workerCookies },
    body: JSON.stringify({ isAvailable: false })
  });
  const toggleData = await toggleRes.json();
  if (!toggleRes.ok || toggleData.item?.isAvailable !== false) {
    throw new Error(`Stock toggle failed: ${JSON.stringify(toggleData)}`);
  }
  console.log(`✅ Worker toggled stock to Out of Stock: ${toggleData.message}`);

  // Verify stock status immediately on customer website API
  const customerCheckAfterStock = await fetch(`${API_BASE}/products?vertical=restaurant`);
  const productsAfterStock = await customerCheckAfterStock.json();
  const productAfterStock = productsAfterStock.find(p => p._id === createdItemId);
  if (!productAfterStock || productAfterStock.isAvailable !== false) {
    throw new Error('Stock change not reflected on customer website API!');
  }
  console.log(`✅ Out-of-stock status verified on customer website: isAvailable=${productAfterStock.isAvailable}`);

  // 11. Customer Checkout Guard: Attempting to order out-of-stock item is blocked
  console.log('\n11. Verifying order guard blocks out-of-stock dish...');
  const customerOrderRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminLoginCookies },
    body: JSON.stringify({
      items: [{ productId: createdItemId, name: 'Artisan Woodfired Truffle Pizza', price: 549, quantity: 1 }],
      deliveryAddress: { fullName: 'Customer Tester', phone: '9876543210', addressLine1: 'Test St', city: 'Mumbai' }
    })
  });
  const orderErrData = await customerOrderRes.json();
  if (customerOrderRes.status === 400 && orderErrData.message.includes('out of stock')) {
    console.log(`✅ Order correctly blocked by backend: "${orderErrData.message}"`);
  } else {
    throw new Error(`Expected 400 Out of Stock, got HTTP ${customerOrderRes.status}: ${JSON.stringify(orderErrData)}`);
  }

  // 12. Cleanup: Delete Test Dish (Admin Only)
  console.log('\n12. Cleaning up test dish (Admin Only)...');
  const deleteRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/${createdItemId}`, {
    method: 'DELETE',
    headers: { cookie: adminLoginCookies }
  });
  const deleteData = await deleteRes.json();
  if (!deleteRes.ok) {
    throw new Error(`Failed to delete dish: ${JSON.stringify(deleteData)}`);
  }
  console.log(`✅ Test dish successfully deleted: ${deleteData.message}`);

  console.log('\n🎉 ALL 12 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
