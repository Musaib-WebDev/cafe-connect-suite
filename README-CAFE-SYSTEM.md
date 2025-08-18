# Cafe Management SaaS System

A comprehensive, full-stack cafe management system built with modern technologies. This system provides a complete solution for cafe owners to manage their business and for customers to discover, order from, and make reservations at cafes.

## 🚀 Features

### For Customers
- **Cafe Discovery**: Browse and search cafes by location, cuisine, ratings
- **Menu Browsing**: View detailed menus with images, descriptions, and customizations
- **Online Ordering**: Place orders with customizations and special instructions
- **Table Reservations**: Book tables in advance with availability checking
- **Promotions**: Apply discount codes and promotional offers
- **Order Tracking**: Real-time order status updates
- **Multi-language Support**: English and Spanish interfaces
- **Rating & Reviews**: Rate orders and leave feedback

### For Cafe Owners
- **Cafe Management**: Complete cafe profile with images, hours, and amenities
- **Menu Management**: CRUD operations for menu items with multi-language support
- **Order Management**: Real-time order processing and status updates
- **Reservation Management**: Handle table bookings and availability
- **Inventory Tracking**: Track ingredients with low-stock alerts
- **Promotions Management**: Create and manage discount campaigns
- **Analytics Dashboard**: Sales, orders, and reservation analytics
- **Table Management**: Configure tables with QR codes for ordering

### System Features
- **Multi-tenant Architecture**: Support for multiple cafes
- **Real-time Notifications**: Push notifications for orders and updates
- **Role-based Access Control**: Customer, Cafe Owner, and Admin roles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **RESTful API**: Well-documented API for integrations
- **Security**: JWT authentication, rate limiting, input validation

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **OneSignal** - Push notifications (optional)

### Frontend
- **React 18** with **TypeScript** - UI framework
- **React Router** - Client-side routing
- **React Hook Form** with **Zod** - Form handling and validation
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling framework
- **i18next** - Internationalization
- **Sonner** - Toast notifications
- **Lucide React** - Icons

## 📁 Project Structure

```
cafe-management-system/
├── backend/                 # Node.js/Express backend
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   ├── package.json      # Backend dependencies
│   ├── server.js         # Main server file
│   └── .env             # Environment variables
├── src/                  # React frontend
│   ├── components/      # Reusable components
│   │   ├── ui/         # shadcn/ui components
│   │   └── layout/     # Layout components
│   ├── contexts/       # React contexts
│   ├── pages/          # Page components
│   ├── lib/           # Utilities and configurations
│   ├── hooks/         # Custom hooks
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── package.json      # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cafe-management-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   # In a new terminal, from project root
   npm install
   npm run dev
   ```

4. **Environment Variables**
   
   Update `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cafe-management
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   ONESIGNAL_APP_ID=your-onesignal-app-id
   ONESIGNAL_API_KEY=your-onesignal-api-key
   FRONTEND_URL=http://localhost:3000
   ```

### Default Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## 📊 Database Models

### Core Models
- **User** - Authentication and user profiles
- **Cafe** - Cafe information, settings, and tables
- **Menu** - Menu items with customizations and translations
- **Order** - Customer orders with items and status tracking
- **Reservation** - Table reservations with availability
- **Promotion** - Discount codes and promotional campaigns
- **Inventory** - Ingredient tracking with alerts

## 🔐 API Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login**: POST to `/api/auth/register` or `/api/auth/login`
2. **Include Token**: Add `Authorization: Bearer <token>` header to protected routes
3. **Role-based Access**: Different endpoints require different user roles

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update profile
- `PUT /api/auth/updatepassword` - Change password

### Cafes
- `GET /api/cafes` - List cafes (with search/filter)
- `GET /api/cafes/:id` - Get cafe details
- `POST /api/cafes` - Create cafe (owner only)
- `PUT /api/cafes/:id` - Update cafe (owner only)
- `GET /api/cafes/owner/me` - Get my cafe (owner only)

### Menu
- `GET /api/cafes/:cafeId/menu` - Get menu items
- `POST /api/menu` - Create menu item (owner only)
- `PUT /api/menu/:id` - Update menu item (owner only)
- `DELETE /api/menu/:id` - Delete menu item (owner only)
- `GET /api/cafes/:cafeId/menu/categories` - Get categories

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get customer orders
- `GET /api/cafes/:cafeId/orders` - Get cafe orders (owner only)
- `PUT /api/orders/:id/status` - Update order status (owner only)
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/rating` - Rate order (customer only)

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/my` - Get customer reservations
- `GET /api/cafes/:cafeId/reservations` - Get cafe reservations (owner only)
- `PUT /api/reservations/:id/status` - Update reservation status (owner only)
- `GET /api/cafes/:cafeId/reservations/availability` - Check availability

### Promotions
- `GET /api/cafes/:cafeId/promotions` - Get promotions
- `POST /api/promotions` - Create promotion (owner only)
- `POST /api/promotions/validate` - Validate promo code
- `PUT /api/promotions/:id` - Update promotion (owner only)
- `GET /api/promotions/my` - Get my promotions (owner only)

### Inventory
- `GET /api/inventory` - Get inventory (owner only)
- `POST /api/inventory` - Create/update inventory item (owner only)
- `GET /api/inventory/alerts` - Get low stock alerts (owner only)
- `GET /api/inventory/analytics` - Get inventory analytics (owner only)

## 🎨 UI Components

The system uses shadcn/ui components with Tailwind CSS:

- **Forms**: Input, Label, Button, Select, Checkbox, etc.
- **Navigation**: Header, Sidebar, Breadcrumbs
- **Data Display**: Table, Card, Badge, Avatar
- **Feedback**: Toast, Alert, Dialog, Loading states
- **Layout**: Container, Grid, Flex utilities

## 🌍 Internationalization

- **Languages**: English (default), Spanish
- **Menu Translations**: Support for multi-language menu items
- **Dynamic Language Switching**: Users can change language on the fly
- **Localized Content**: Dates, numbers, and currency formatting

## 🔔 Push Notifications (Optional)

Integration with OneSignal for real-time notifications:

- **Order Updates**: Customers receive order status updates
- **New Orders**: Cafe owners get notified of new orders
- **Reservation Confirmations**: Automated reservation confirmations
- **Promotional Notifications**: Marketing campaigns

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Great experience on tablets
- **Desktop**: Full-featured desktop interface
- **PWA Ready**: Can be installed as a Progressive Web App

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation
- **Security Headers**: Helmet.js for security headers
- **CORS**: Properly configured cross-origin requests
- **Password Hashing**: bcrypt for secure password storage

## 📈 Performance

- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Caching**: React Query for client-side caching
- **Code Splitting**: Lazy loading of routes
- **Image Optimization**: Responsive images
- **Bundle Optimization**: Tree shaking and minification

## 🧪 Testing (Recommended Setup)

```bash
# Backend testing
cd backend
npm install --save-dev jest supertest
npm run test

# Frontend testing
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
npm run test
```

## 🚀 Deployment

### Backend Deployment
1. **Environment**: Set production environment variables
2. **Database**: Use MongoDB Atlas or similar cloud database
3. **Hosting**: Deploy to Heroku, Railway, or similar platform
4. **Domain**: Configure custom domain and SSL

### Frontend Deployment
1. **Build**: Run `npm run build`
2. **Static Hosting**: Deploy to Vercel, Netlify, or similar
3. **Environment**: Set `VITE_API_URL` to backend URL
4. **CDN**: Configure CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints
- Test with the provided examples

## 🎯 Future Enhancements

- **Payment Integration**: Stripe/PayPal integration
- **Loyalty Program**: Customer rewards system
- **Advanced Analytics**: Detailed business insights
- **Mobile Apps**: Native iOS/Android apps
- **Third-party Integrations**: POS systems, delivery services
- **AI Features**: Recommendation engine, demand forecasting
- **Multi-location**: Support for cafe chains
- **Staff Management**: Employee roles and permissions

---

**Built with ❤️ for the coffee community**