import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['customer', 'cafeowner'])
    .withMessage('Role must be either customer or cafeowner'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Cafe validation rules
export const validateCafeCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cafe name must be between 2 and 100 characters'),
  body('address.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .notEmpty()
    .withMessage('State is required'),
  body('address.zipCode')
    .notEmpty()
    .withMessage('Zip code is required'),
  body('address.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('contact.phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// Menu validation rules
export const validateMenuCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu item name must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['coffee', 'tea', 'pastries', 'sandwiches', 'salads', 'breakfast', 'lunch', 'dinner', 'desserts', 'beverages', 'snacks'])
    .withMessage('Please provide a valid category'),
  handleValidationErrors
];

// Order validation rules
export const validateOrderCreation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.menuId')
    .isMongoId()
    .withMessage('Valid menu item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('orderType')
    .isIn(['dine-in', 'takeout', 'delivery'])
    .withMessage('Order type must be dine-in, takeout, or delivery'),
  handleValidationErrors
];

// Reservation validation rules
export const validateReservationCreation = [
  body('customerInfo.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('customerInfo.phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('partySize')
    .isInt({ min: 1, max: 20 })
    .withMessage('Party size must be between 1 and 20'),
  body('reservationDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date'),
  body('reservationTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  handleValidationErrors
];

// Promotion validation rules
export const validatePromotionCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Promotion name must be between 2 and 100 characters'),
  body('code')
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric()
    .withMessage('Promotion code must be 3-20 alphanumeric characters'),
  body('discountValue')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('validFrom')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('validUntil')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date'),
  handleValidationErrors
];

// Inventory validation rules
export const validateInventoryUpdate = [
  body('ingredient')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ingredient name must be between 2 and 100 characters'),
  body('currentQuantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('unit')
    .isIn(['kg', 'g', 'lbs', 'oz', 'l', 'ml', 'cups', 'pieces', 'packets', 'bottles', 'cans'])
    .withMessage('Please provide a valid unit'),
  body('minimumThreshold')
    .isFloat({ min: 0 })
    .withMessage('Minimum threshold must be a positive number'),
  handleValidationErrors
];