import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/floveera';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing products to ensure clean seed
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const products = [
      // ==========================================
      // RESTAURANT: SWEETS
      // ==========================================
      {
        name: 'Gulab Jamun',
        vertical: 'restaurant',
        category: 'sweets',
        price: 120,
        originalPrice: 150,
        stock: 40,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 128,
        description: 'Melt-in-your-mouth khoya spheres simmered in rose and green cardamom infused sugar syrup.',
        imageUrl: '/images/gulab_jamun.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: '500g (Approx 8 pcs)', price: 120, stock: 40 },
          { label: '1 kg (Approx 16 pcs)', price: 230, originalPrice: 250, stock: 30 },
        ],
        customizationOptions: {
          addOns: [
            { name: 'Extra Rose Sugar Syrup (100ml)', price: 20 },
            { name: 'Warm Delivery Packaging', price: 10 },
          ]
        },
      },
      {
        name: 'Kaju Katli',
        vertical: 'restaurant',
        category: 'sweets',
        price: 250,
        originalPrice: 280,
        stock: 35,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 95,
        description: 'Silky smooth diamond-shaped cashew fudge finished with pure silver leaf (varak).',
        imageUrl: '/images/kaju_katli.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: '250g Box', price: 250, stock: 35 },
          { label: '500g Box', price: 480, originalPrice: 520, stock: 25 },
          { label: '1 kg Gift Tin', price: 950, originalPrice: 1050, stock: 15 },
        ],
      },
      {
        name: 'Motichoor Laddu',
        vertical: 'restaurant',
        category: 'sweets',
        price: 110,
        originalPrice: 130,
        stock: 50,
        dietary: 'veg',
        isBestseller: false,
        rating: 4.7,
        ratingCount: 64,
        description: 'Fragrant micro gram-flour pearls fried in pure desi ghee and pressed into melt-in-mouth laddus.',
        imageUrl: '/images/motichoor_laddu.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: '500g Box', price: 110, stock: 50 },
          { label: '1 kg Box', price: 210, stock: 30 },
        ],
      },
      {
        name: 'Rasgulla',
        vertical: 'restaurant',
        category: 'sweets',
        price: 100,
        stock: 30,
        dietary: 'veg',
        isBestseller: false,
        rating: 4.8,
        ratingCount: 52,
        description: 'Spongy chhena dumplings floating in a clean, delicate cardamom sugar syrup.',
        imageUrl: '/images/rasgulla.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: '500g (Approx 6 pcs)', price: 100, stock: 30 },
          { label: '1 kg (Approx 12 pcs)', price: 190, stock: 20 },
        ],
      },
      {
        name: 'Rasmalai',
        vertical: 'restaurant',
        category: 'sweets',
        price: 140,
        originalPrice: 160,
        stock: 25,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 110,
        description: 'Velvety cottage cheese medallions steeped in saffron-scented clotted milk and pistachio flakes.',
        imageUrl: '/images/rasmalai.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: '2 Pieces', price: 70, stock: 25 },
          { label: '4 Pieces', price: 140, stock: 20 },
        ],
      },

      // ==========================================
      // RESTAURANT: HOT SNACKS
      // ==========================================
      {
        name: 'Samosa',
        vertical: 'restaurant',
        category: 'snacks',
        price: 30,
        stock: 60,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.8,
        ratingCount: 180,
        description: 'Golden, flaky triangular pastry loaded with spiced potatoes, green peas, and whole roasted coriander.',
        imageUrl: '/images/samosa.jpg',
        estimatedDeliveryMins: '15-25 mins',
        units: [
          { label: '2 pcs with Chutney', price: 30, stock: 60 },
          { label: '4 pcs with Chutney', price: 55, stock: 40 },
        ],
        customizationOptions: {
          spiceLevels: ['Mild', 'Medium Spicy', 'Extra Spicy'],
          addOns: [
            { name: 'Extra Mint Green Chutney', price: 10 },
            { name: 'Extra Sweet Tamarind Chutney', price: 10 },
          ]
        },
      },
      {
        name: 'Kachori',
        vertical: 'restaurant',
        category: 'snacks',
        price: 25,
        stock: 45,
        dietary: 'veg',
        isBestseller: false,
        rating: 4.7,
        ratingCount: 78,
        description: 'Crisp, puffed Rajasthani pastry stuffed with spiced yellow moong dal and hing aromas.',
        imageUrl: '/images/kachori.jpg',
        estimatedDeliveryMins: '15-25 mins',
        units: [
          { label: '2 pcs', price: 25, stock: 45 },
          { label: '4 pcs', price: 48, stock: 30 },
        ],
      },
      {
        name: 'Paneer Pakoda',
        vertical: 'restaurant',
        category: 'snacks',
        price: 60,
        stock: 35,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 88,
        description: 'Soft malai paneer sandwiched with tangy mint paste and fried in spiced chickpea batter.',
        imageUrl: '/images/paneer_pakoda.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: 'Plate (4 pcs)', price: 60, stock: 35 },
          { label: 'Full Plate (8 pcs)', price: 110, stock: 25 },
        ],
      },

      // ==========================================
      // RESTAURANT: FAST FOOD
      // ==========================================
      {
        name: 'Stone-Baked Farmhouse Pizza',
        vertical: 'restaurant',
        category: 'fastfood',
        price: 199,
        originalPrice: 249,
        stock: 30,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.8,
        ratingCount: 145,
        description: 'Hand-stretched crust topped with signature herbed marinara, 100% mozzarella, bell peppers, sweet corn, and olives.',
        imageUrl: '/images/pizza.jpg',
        estimatedDeliveryMins: '25-35 mins',
        units: [
          { label: 'Regular (7")', price: 199, stock: 30 },
          { label: 'Medium (9")', price: 349, originalPrice: 399, stock: 20 },
          { label: 'Large (12")', price: 549, originalPrice: 629, stock: 15 },
        ],
        customizationOptions: {
          spiceLevels: ['Standard Italian Herbs', 'Spicy Peri Peri', 'Ghost Pepper Fiery'],
          addOns: [
            { name: 'Extra Mozzarella Cheese Burst', price: 50 },
            { name: 'Jalapenos & Green Olives', price: 30 },
            { name: 'Crispy Garlic Dip', price: 25 },
          ]
        },
      },
      {
        name: 'Crispy Veg Burger',
        vertical: 'restaurant',
        category: 'fastfood',
        price: 99,
        originalPrice: 120,
        stock: 40,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.7,
        ratingCount: 112,
        description: 'Crispy spiced vegetable patty nestled in toasted sesame buns with iceberg lettuce and secret sauce.',
        imageUrl: '/images/burger.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: 'Single Burger', price: 99, stock: 40 },
          { label: 'Meal with Fries & Coke', price: 179, originalPrice: 210, stock: 30 },
        ],
        customizationOptions: {
          spiceLevels: ['Mild', 'Spicy'],
          addOns: [
            { name: 'Extra Cheddar Cheese Slice', price: 25 },
            { name: 'French Fries (Salted)', price: 60 },
          ]
        },
      },
      {
        name: 'Steamed Veg Momos',
        vertical: 'restaurant',
        category: 'fastfood',
        price: 70,
        stock: 50,
        dietary: 'veg',
        isBestseller: false,
        rating: 4.8,
        ratingCount: 94,
        description: 'Thin-skinned dumplings stuffed with finely minced wok vegetables and served with fiery red chili garlic dip.',
        imageUrl: '/images/momo.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: 'Steamed (6 pcs)', price: 70, stock: 50 },
          { label: 'Fried (6 pcs)', price: 85, stock: 40 },
          { label: 'Kurkure Crunchy (6 pcs)', price: 110, stock: 30 },
        ],
        customizationOptions: {
          spiceLevels: ['Medium', 'Extra Hot Fiery Dip'],
          addOns: [
            { name: 'Extra Momo Garlic Dip', price: 15 },
            { name: 'Creamy Mayo Dip', price: 15 },
          ]
        },
      },
      {
        name: 'Paneer Tikka Roll',
        vertical: 'restaurant',
        category: 'fastfood',
        price: 90,
        stock: 35,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 76,
        description: 'Smoky tandoori paneer cubes wrapped in layered flaky paratha with sliced onions and mint yogurt dressing.',
        imageUrl: '/images/paneer_roll.jpg',
        estimatedDeliveryMins: '20-30 mins',
        units: [
          { label: 'Single Roll', price: 90, stock: 35 },
          { label: 'Double Paneer Roll', price: 130, stock: 25 },
        ],
        customizationOptions: {
          spiceLevels: ['Chatpata Medium', 'Spicy Tandoori'],
          addOns: [
            { name: 'Extra Cheese Spread', price: 25 },
            { name: 'Lachha Onions & Lemon', price: 10 },
          ]
        },
      },

      // ==========================================
      // SUPERMART: FMCG & GROCERIES
      // ==========================================
      {
        name: 'Daawat Rozana Basmati Rice',
        vertical: 'supermart',
        category: 'fmcg',
        price: 120,
        originalPrice: 145,
        stock: 80,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.8,
        ratingCount: 65,
        description: 'Aromatic aged long-grain basmati rice ideal for daily meals, fragrant pulao, and festive biryanis.',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
        units: [
          { label: '1 kg', price: 120, originalPrice: 145, stock: 80 },
          { label: '5 kg Bag', price: 560, originalPrice: 650, stock: 40 },
          { label: '10 kg Pack', price: 1050, originalPrice: 1250, stock: 25 },
        ],
        frequentlyBoughtTogether: [
          { name: 'Fortune Refined Sunflower Oil 1L', price: 180, unit: '1 Litre' },
          { name: 'Tata Salt Vaccum Evaporated 1kg', price: 28, unit: '1 kg' },
        ],
      },
      {
        name: 'Fortune Sunlite Refined Cooking Oil',
        vertical: 'supermart',
        category: 'fmcg',
        price: 180,
        originalPrice: 210,
        stock: 70,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.7,
        ratingCount: 88,
        description: 'Light, healthy refined sunflower oil enriched with vitamins A & D for daily cooking and frying.',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80',
        units: [
          { label: '1 Litre Pouch', price: 180, originalPrice: 210, stock: 70 },
          { label: '5 Litre Can', price: 840, originalPrice: 950, stock: 30 },
        ],
      },
      {
        name: 'Dark Fantasy Choco Fills Biscuits',
        vertical: 'supermart',
        category: 'fmcg',
        price: 30,
        originalPrice: 40,
        stock: 120,
        dietary: 'veg',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 140,
        description: 'Crispy baked cookies with a molten, luxurious dark chocolate cream center.',
        imageUrl: 'https://images.unsplash.com/photo-1616075905085-78e063bb79a7?w=500&q=80',
        units: [
          { label: '75g Pack', price: 30, stock: 120 },
          { label: 'Buy 3 Get 1 Free (300g)', price: 90, originalPrice: 120, stock: 50 },
        ],
      },

      // ==========================================
      // SUPERMART: HOUSEHOLD & KITCHEN
      // ==========================================
      {
        name: 'Lizol Floral Floor Cleaner Disinfectant',
        vertical: 'supermart',
        category: 'household',
        price: 99,
        originalPrice: 115,
        stock: 65,
        dietary: 'none',
        isBestseller: true,
        rating: 4.8,
        ratingCount: 75,
        description: 'Kills 99.9% of germs and leaves a long-lasting pleasant floral fragrance across tiles and marble.',
        imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe2c1c8f1e?w=500&q=80',
        units: [
          { label: '500ml Bottle', price: 99, stock: 65 },
          { label: '1 Litre Bottle', price: 185, originalPrice: 210, stock: 40 },
          { label: '2 Litre Family Pack', price: 340, originalPrice: 390, stock: 20 },
        ],
      },
      {
        name: 'Prestige Non-Stick Induction Fry Pan',
        vertical: 'supermart',
        category: 'kitchenware',
        price: 599,
        originalPrice: 850,
        stock: 25,
        dietary: 'none',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 48,
        description: 'Hard anodized 3-layer granite finish frying pan with cool-touch ergonomic handle.',
        imageUrl: 'https://images.unsplash.com/photo-1585238258359-99e7abf268b3?w=500&q=80',
        units: [
          { label: '20cm Pan', price: 599, originalPrice: 850, stock: 25 },
          { label: '24cm Deep Pan with Lid', price: 899, originalPrice: 1200, stock: 15 },
        ],
      },
      {
        name: 'Ceramic Glazed Coffee Mug Set',
        vertical: 'supermart',
        category: 'kitchenware',
        price: 150,
        originalPrice: 199,
        stock: 35,
        dietary: 'none',
        isBestseller: false,
        rating: 4.7,
        ratingCount: 32,
        description: 'Handcrafted stoneware ceramic mugs safe for microwave and dishwasher. 350ml capacity.',
        imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
        units: [
          { label: 'Set of 2 Mugs', price: 150, stock: 35 },
          { label: 'Set of 4 Mugs', price: 280, originalPrice: 360, stock: 20 },
        ],
      },

      // ==========================================
      // CAKES & BAKERY
      // ==========================================
      {
        name: 'Dutch Chocolate Truffle Cake',
        vertical: 'cakes',
        category: 'cakes',
        price: 450,
        originalPrice: 550,
        stock: 20,
        dietary: 'eggless',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 165,
        description: 'Moist Belgian cocoa sponge enveloped in dark chocolate truffle ganache and gold dust finish.',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
        units: [
          { label: '500g (Serves 4-5)', price: 450, stock: 20 },
          { label: '1 kg (Serves 8-10)', price: 850, originalPrice: 950, stock: 15 },
          { label: '2 kg Celebration Tier', price: 1600, originalPrice: 1800, stock: 8 },
        ],
        customizationOptions: {
          flavors: ['Classic Truffle', 'Dark Hazelnut', 'Choco Orange'],
        },
      },
      {
        name: 'Royal Red Velvet Cream Cheese Cake',
        vertical: 'cakes',
        category: 'cakes',
        price: 550,
        originalPrice: 650,
        stock: 18,
        dietary: 'eggless',
        isBestseller: true,
        rating: 4.9,
        ratingCount: 132,
        description: 'Crimson cocoa velvet sponge layered with silky imported Philadelphia cream cheese frosting.',
        imageUrl: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500&q=80',
        units: [
          { label: '500g (Serves 4-5)', price: 550, stock: 18 },
          { label: '1 kg (Serves 8-10)', price: 999, originalPrice: 1150, stock: 12 },
          { label: '2 kg (Serves 16-20)', price: 1899, stock: 6 },
        ],
      },
      {
        name: 'Butterscotch Crunch Caramel Cake',
        vertical: 'cakes',
        category: 'cakes',
        price: 420,
        originalPrice: 490,
        stock: 22,
        dietary: 'eggless',
        isBestseller: false,
        rating: 4.8,
        ratingCount: 84,
        description: 'Fluffy vanilla sponge filled with salted butterscotch crunch and handmade brown sugar praline.',
        imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&q=80',
        units: [
          { label: '500g', price: 420, stock: 22 },
          { label: '1 kg', price: 790, originalPrice: 890, stock: 15 },
        ],
      },
      {
        name: 'Black Forest Fresh Cream Cake',
        vertical: 'cakes',
        category: 'cakes',
        price: 400,
        originalPrice: 460,
        stock: 25,
        dietary: 'eggless',
        isBestseller: true,
        rating: 4.8,
        ratingCount: 140,
        description: 'German chocolate sponge loaded with tart sour cherries, whipped cream rosettes, and dark chocolate flakes.',
        imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&q=80',
        units: [
          { label: '500g', price: 400, stock: 25 },
          { label: '1 kg', price: 750, originalPrice: 850, stock: 18 },
        ],
      },
      {
        name: 'Exotic Fresh Fruit Glaze Cake',
        vertical: 'cakes',
        category: 'cakes',
        price: 500,
        originalPrice: 580,
        stock: 15,
        dietary: 'eggless',
        isBestseller: false,
        rating: 4.9,
        ratingCount: 92,
        description: 'Vanilla chiffon sponge crown with kiwi, dragonfruit, strawberries, pineapple, and apricot glaze.',
        imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&q=80',
        units: [
          { label: '500g', price: 500, stock: 15 },
          { label: '1 kg', price: 950, stock: 10 },
        ],
      },
    ];

    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products across Restaurant, Supermart, and Bakery!`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
