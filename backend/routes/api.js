import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Cake from '../models/Cake.js';
import CakeOrder from '../models/CakeOrder.js';
import GalleryImage from '../models/GalleryImage.js';

const router = express.Router();

// --- Categories ---
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Products ---
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Cakes ---
router.get('/cakes', async (req, res) => {
  try {
    const cakes = await Cake.find();
    res.json(cakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/cakes', async (req, res) => {
  try {
    const cake = new Cake(req.body);
    const savedCake = await cake.save();
    res.status(201).json(savedCake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Cake Orders ---
router.get('/cake-orders', async (req, res) => {
  try {
    const orders = await CakeOrder.find().populate('cakeId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/cake-orders', async (req, res) => {
  try {
    const order = new CakeOrder(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Gallery Images ---
router.get('/gallery', async (req, res) => {
  try {
    const images = await GalleryImage.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/gallery', async (req, res) => {
  try {
    const image = new GalleryImage(req.body);
    const savedImage = await image.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
