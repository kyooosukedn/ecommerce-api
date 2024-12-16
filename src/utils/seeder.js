const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/product.model');

const sampleProducts = [
  {
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    imageUrl: "https://picsum.photos/id/1/200",
    category: "Electronics",
    stock: 50
  },
  {
    name: "Classic T-Shirt",
    description: "Comfortable cotton t-shirt in multiple colors",
    price: 24.99,
    imageUrl: "https://picsum.photos/id/2/200",
    category: "Clothing",
    stock: 100
  },
  {
    name: "JavaScript Programming Guide",
    description: "Comprehensive guide to modern JavaScript",
    price: 39.99,
    imageUrl: "https://picsum.photos/id/3/200",
    category: "Books",
    stock: 30
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing products
    await Product.deleteMany();
    console.log('Existing products deleted');

    // Insert new products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted successfully');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedProducts();
