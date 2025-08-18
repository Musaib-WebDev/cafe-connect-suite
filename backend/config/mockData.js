// Mock data for development when MongoDB is not available
export const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2b$10$rQZ9QmjotgJr7ZODhxz0KeOKBvK8zVJ8zVJ8zVJ8zVJ8zVJ8zVJ8z', // 'password123'
    role: 'customer',
    phone: '+1234567890',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Cafe Owner',
    email: 'owner@cafe.com',
    password: '$2b$10$rQZ9QmjotgJr7ZODhxz0KeOKBvK8zVJ8zVJ8zVJ8zVJ8zVJ8zVJ8z', // 'password123'
    role: 'cafeowner',
    phone: '+1234567891',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockCafes = [
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'The Coffee Corner',
    description: 'A cozy neighborhood cafe with the best coffee in town',
    owner: '507f1f77bcf86cd799439012',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    contact: {
      phone: '+1234567892',
      email: 'info@coffecorner.com'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
      caption: 'Our cozy interior'
    }],
    rating: {
      average: 4.5,
      count: 128
    },
    cuisine: ['Coffee', 'Pastries', 'Light Meals'],
    amenities: ['WiFi', 'Parking', 'Outdoor Seating'],
    operatingHours: {
      monday: { open: '07:00', close: '19:00', closed: false },
      tuesday: { open: '07:00', close: '19:00', closed: false },
      wednesday: { open: '07:00', close: '19:00', closed: false },
      thursday: { open: '07:00', close: '19:00', closed: false },
      friday: { open: '07:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: false }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockMenuItems = [
  {
    _id: '507f1f77bcf86cd799439014',
    cafe: '507f1f77bcf86cd799439013',
    name: 'Espresso',
    description: 'Rich and bold espresso shot',
    price: 2.50,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300',
    available: true,
    preparationTime: 5,
    allergens: [],
    nutritionalInfo: {
      calories: 5,
      caffeine: 63
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439015',
    cafe: '507f1f77bcf86cd799439013',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    price: 4.50,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300',
    available: true,
    preparationTime: 8,
    allergens: ['dairy'],
    nutritionalInfo: {
      calories: 150,
      caffeine: 63
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockOrders = [];
export const mockReservations = [];
export const mockPromotions = [];
export const mockInventory = [];

// Simple in-memory storage
let storage = {
  users: [...mockUsers],
  cafes: [...mockCafes],
  menuItems: [...mockMenuItems],
  orders: [...mockOrders],
  reservations: [...mockReservations],
  promotions: [...mockPromotions],
  inventory: [...mockInventory]
};

export const mockDB = {
  // Generic CRUD operations
  find: (collection, query = {}) => {
    return storage[collection] || [];
  },
  
  findById: (collection, id) => {
    return storage[collection]?.find(item => item._id === id);
  },
  
  findOne: (collection, query) => {
    const items = storage[collection] || [];
    return items.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  },
  
  create: (collection, data) => {
    const newItem = {
      _id: new Date().getTime().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!storage[collection]) {
      storage[collection] = [];
    }
    
    storage[collection].push(newItem);
    return newItem;
  },
  
  updateById: (collection, id, updates) => {
    const items = storage[collection] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date()
      };
      return items[index];
    }
    
    return null;
  },
  
  deleteById: (collection, id) => {
    const items = storage[collection] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index !== -1) {
      return items.splice(index, 1)[0];
    }
    
    return null;
  },
  
  // Reset storage (useful for testing)
  reset: () => {
    storage = {
      users: [...mockUsers],
      cafes: [...mockCafes],
      menuItems: [...mockMenuItems],
      orders: [],
      reservations: [],
      promotions: [],
      inventory: []
    };
  }
};

export default mockDB;