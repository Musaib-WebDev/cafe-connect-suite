import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Cafe from '../models/Cafe.js';
import Menu from '../models/Menu.js';
import Order from '../models/Order.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Cafe.deleteMany({});
    await Menu.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data...');

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@cafeflow.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567890'
    });
    console.log('Created Super Admin:', superAdmin.email);

    // Create Cafe Owner
    const cafeOwner = await User.create({
      name: 'John Doe',
      email: 'owner@brewbytes.com',
      password: 'owner123',
      role: 'cafeowner',
      phone: '+1234567891'
    });
    console.log('Created Cafe Owner:', cafeOwner.email);

    // Create Customer
    const customer = await User.create({
      name: 'Alice Johnson',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1234567892'
    });
    console.log('Created Customer:', customer.email);

    // Create Demo Cafe
    const demoCafe = await Cafe.create({
      name: 'Brew & Bytes',
      description: 'A modern cafe with great coffee and digital ordering',
      ownerId: cafeOwner._id,
      address: {
        street: '123 Coffee Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      contact: {
        phone: '+1-555-COFFEE',
        email: 'hello@brewbytes.com',
        website: 'https://brewbytes.com'
      },
      operatingHours: {
        monday: { open: '07:00', close: '20:00', isOpen: true },
        tuesday: { open: '07:00', close: '20:00', isOpen: true },
        wednesday: { open: '07:00', close: '20:00', isOpen: true },
        thursday: { open: '07:00', close: '20:00', isOpen: true },
        friday: { open: '07:00', close: '21:00', isOpen: true },
        saturday: { open: '08:00', close: '21:00', isOpen: true },
        sunday: { open: '08:00', close: '19:00', isOpen: true }
      },
      tables: [
        { number: 1, seatingCapacity: 2, location: 'Window side' },
        { number: 2, seatingCapacity: 4, location: 'Center' },
        { number: 3, seatingCapacity: 2, location: 'Corner' },
        { number: 4, seatingCapacity: 6, location: 'Private section' },
        { number: 5, seatingCapacity: 2, location: 'Patio' }
      ],
      cuisine: ['Coffee', 'Pastries', 'Light Meals'],
      features: ['wifi', 'outdoor_seating', 'takeaway', 'wheelchair_accessible'],
      paymentMethods: ['cash', 'card', 'upi', 'wallet'],
      isActive: true,
      settings: {
        acceptsOnlineOrders: true,
        requiresTableSelection: true,
        allowsAdvanceOrdering: true,
        maxAdvanceOrderDays: 3,
        minimumOrderAmount: 5.00,
        taxRate: 8.5,
        serviceChargeRate: 10.0,
        allowsCancellation: true,
        cancellationTimeLimit: 15,
        enableNotifications: true,
        autoAcceptOrders: false
      }
    });
    console.log('Created Demo Cafe:', demoCafe.name);

    // Create Menu Items
    const menuItems = [
      // Coffee
      {
        cafeId: demoCafe._id,
        name: 'Espresso',
        description: 'Rich and bold single shot espresso',
        price: 3.50,
        category: 'Coffee',
        subcategory: 'Hot Coffee',
        margin: 70,
        isAvailable: true,
        preparationTime: 3,
        isPopular: true,
        dietaryTags: ['vegan'],
        nutritionalInfo: {
          calories: 9,
          protein: 0.6,
          carbohydrates: 1.7,
          fat: 0.2
        }
      },
      {
        cafeId: demoCafe._id,
        name: 'Cappuccino',
        description: 'Perfect balance of espresso, steamed milk, and foam',
        price: 4.75,
        category: 'Coffee',
        subcategory: 'Hot Coffee',
        margin: 65,
        isAvailable: true,
        preparationTime: 5,
        isPopular: true,
        customizations: [
          { name: 'Size', options: ['Small', 'Medium', 'Large'], prices: [0, 0.5, 1.0] },
          { name: 'Milk', options: ['Regular', 'Almond', 'Oat', 'Soy'], prices: [0, 0.5, 0.6, 0.4] }
        ]
      },
      {
        cafeId: demoCafe._id,
        name: 'Iced Latte',
        description: 'Smooth espresso with cold milk over ice',
        price: 5.25,
        category: 'Coffee',
        subcategory: 'Cold Coffee',
        margin: 60,
        isAvailable: true,
        preparationTime: 4,
        customizations: [
          { name: 'Sweetener', options: ['None', 'Sugar', 'Honey', 'Stevia'], prices: [0, 0, 0.3, 0.2] }
        ]
      },
      
      // Pastries
      {
        cafeId: demoCafe._id,
        name: 'Croissant',
        description: 'Buttery, flaky French pastry',
        price: 3.25,
        category: 'Pastries',
        margin: 55,
        isAvailable: true,
        preparationTime: 2,
        isPopular: true
      },
      {
        cafeId: demoCafe._id,
        name: 'Blueberry Muffin',
        description: 'Fresh baked muffin with juicy blueberries',
        price: 4.50,
        category: 'Pastries',
        margin: 60,
        isAvailable: true,
        preparationTime: 1
      },
      
      // Sandwiches
      {
        cafeId: demoCafe._id,
        name: 'Avocado Toast',
        description: 'Smashed avocado on sourdough with lime and seasoning',
        price: 8.95,
        category: 'Food',
        subcategory: 'Light Meals',
        margin: 50,
        isAvailable: true,
        preparationTime: 8,
        dietaryTags: ['vegetarian', 'healthy'],
        customizations: [
          { name: 'Add-ons', options: ['Poached Egg', 'Tomato', 'Feta'], prices: [2.0, 1.0, 1.5] }
        ]
      },
      {
        cafeId: demoCafe._id,
        name: 'Club Sandwich',
        description: 'Triple-decker with turkey, bacon, lettuce, and tomato',
        price: 12.50,
        category: 'Food',
        subcategory: 'Sandwiches',
        margin: 45,
        isAvailable: true,
        preparationTime: 12
      }
    ];

    const createdMenuItems = await Menu.insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);

    // Create Sample Orders
    const sampleOrders = [
      {
        cafeId: demoCafe._id,
        customerId: customer._id,
        orderNumber: 'ORD-20241201-0001',
        items: [
          {
            menuItemId: createdMenuItems[1]._id, // Cappuccino
            name: 'Cappuccino',
            price: 4.75,
            quantity: 1,
            customizations: [{ name: 'Size', option: 'Medium', price: 0.5 }],
            profit: 4.75 * 0.65
          },
          {
            menuItemId: createdMenuItems[3]._id, // Croissant
            name: 'Croissant',
            price: 3.25,
            quantity: 1,
            profit: 3.25 * 0.55
          }
        ],
        pricing: {
          subtotal: 8.50,
          taxAmount: 0.72,
          serviceCharge: 0.85,
          totalAmount: 10.07,
          profit: (4.75 * 0.65) + (3.25 * 0.55)
        },
        orderType: 'dine-in',
        tableNumber: 3,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMode: 'card',
        notes: 'Extra foam on cappuccino',
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 60000) },
          { status: 'confirmed', timestamp: new Date(Date.now() - 45000) },
          { status: 'in-progress', timestamp: new Date(Date.now() - 30000) },
          { status: 'ready', timestamp: new Date(Date.now() - 15000) },
          { status: 'completed', timestamp: new Date() }
        ]
      },
      {
        cafeId: demoCafe._id,
        customerId: customer._id,
        orderNumber: 'ORD-20241201-0002',
        items: [
          {
            menuItemId: createdMenuItems[5]._id, // Avocado Toast
            name: 'Avocado Toast',
            price: 8.95,
            quantity: 1,
            customizations: [{ name: 'Add-ons', option: 'Poached Egg', price: 2.0 }],
            profit: 8.95 * 0.50
          },
          {
            menuItemId: createdMenuItems[2]._id, // Iced Latte
            name: 'Iced Latte',
            price: 5.25,
            quantity: 1,
            profit: 5.25 * 0.60
          }
        ],
        pricing: {
          subtotal: 16.20,
          taxAmount: 1.38,
          serviceCharge: 1.62,
          totalAmount: 19.20,
          profit: (8.95 * 0.50) + (5.25 * 0.60)
        },
        orderType: 'dine-in',
        tableNumber: 1,
        status: 'in-progress',
        paymentStatus: 'pending',
        paymentMode: 'cash',
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 10000) },
          { status: 'confirmed', timestamp: new Date(Date.now() - 5000) },
          { status: 'in-progress', timestamp: new Date() }
        ]
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`Created ${createdOrders.length} sample orders`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Super Admin: admin@cafeflow.com / admin123');
    console.log('Cafe Owner: owner@brewbytes.com / owner123');
    console.log('Customer: customer@example.com / customer123');
    console.log('\n🏪 Demo Cafe: Brew & Bytes');
    console.log('📱 Access customer menu: /menu/' + demoCafe._id + '?table=1');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;