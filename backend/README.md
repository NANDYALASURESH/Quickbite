# 🍽️ EatEase Backend API

A comprehensive backend for a food ordering application with role-based authentication and authorization.

## 🚀 Features

### Core Features
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Authorization** - Three roles: `user`, `owner`, `admin`
- **Password Security** - bcrypt hashing for passwords
- **Restaurant Management** - CRUD operations for restaurants
- **Menu Management** - Full menu item management
- **Order Processing** - Complete order lifecycle management

### Extra Features ⭐
- **Loyalty Points System** - Users earn points with every order
- **User Preferences** - Store dietary preferences and favorite cuisines
- **Advanced Ratings** - Separate ratings for food and delivery
- **Order Tracking** - Real-time status updates with history
- **Geolocation Support** - Location-based restaurant discovery
- **Customizations** - Item-level customization options
- **Discounts & Offers** - Item discounts and pricing
- **Operating Hours** - Restaurant schedule management
- **Delivery Settings** - Configurable delivery radius and fees
- **Nutritional Info** - Optional nutritional data for menu items
- **Dashboard Analytics** - Statistics for owners and admins
- **Search & Filters** - Advanced filtering for restaurants and menu

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js           # User schema with roles
│   ├── Restaurant.js     # Restaurant schema
│   ├── MenuItem.js       # Menu item schema
│   └── Order.js          # Order schema
├── routes/
│   ├── auth.routes.js    # Authentication routes
│   ├── user.routes.js    # User-specific routes
│   ├── owner.routes.js   # Restaurant owner routes
│   └── admin.routes.js   # Admin routes
├── middleware/
│   └── authMiddleware.js # JWT & role verification
├── server.js             # Express app setup
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## 🛠️ Installation

1. **Clone and navigate to project**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Update .env with your configuration**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eatease
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
```

5. **Start MongoDB** (if running locally)
```bash
mongod
```

6. **Run the application**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/update-profile` | Update profile | Private |
| PUT | `/change-password` | Change password | Private |

### User Routes (`/api/user`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/restaurants` | Get all restaurants | User |
| GET | `/restaurants/:id` | Get restaurant details | User |
| GET | `/menu/:restaurantId` | Get menu items | User |
| POST | `/orders` | Place new order | User |
| GET | `/orders` | Get order history | User |
| GET | `/orders/:id` | Get order details | User |
| PUT | `/orders/:id/cancel` | Cancel order | User |
| POST | `/orders/:id/rating` | Rate order | User |

### Owner Routes (`/api/owner`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/restaurants` | Create restaurant | Owner |
| GET | `/restaurants/my-restaurant` | Get own restaurant | Owner |
| PUT | `/restaurants/:id` | Update restaurant | Owner |
| POST | `/menu-items` | Add menu item | Owner |
| GET | `/menu-items` | Get menu items | Owner |
| PUT | `/menu-items/:id` | Update menu item | Owner |
| DELETE | `/menu-items/:id` | Delete menu item | Owner |
| GET | `/orders` | Get restaurant orders | Owner |
| PUT | `/orders/:id/status` | Update order status | Owner |
| GET | `/dashboard` | Get dashboard stats | Owner |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user details | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/restaurants` | Get all restaurants | Admin |
| GET | `/restaurants/:id` | Get restaurant details | Admin |
| PUT | `/restaurants/:id` | Update restaurant | Admin |
| DELETE | `/restaurants/:id` | Delete restaurant | Admin |
| GET | `/orders` | Get all orders | Admin |
| GET | `/orders/:id` | Get order details | Admin |
| PUT | `/orders/:id` | Update order | Admin |
| GET | `/dashboard` | Get admin dashboard | Admin |

## 🔐 Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Request Examples

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "phone": "9876543210"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Restaurant (Owner)
```json
POST /api/owner/restaurants
Headers: { "Authorization": "Bearer <token>" }
{
  "name": "Spice Garden",
  "description": "Authentic Indian cuisine",
  "cuisine": ["Indian", "Chinese"],
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  },
  "phone": "9876543210",
  "email": "spicegarden@example.com"
}
```

### Add Menu Item (Owner)
```json
POST /api/owner/menu-items
Headers: { "Authorization": "Bearer <token>" }
{
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry",
  "category": "Main Course",
  "price": 350,
  "discount": 10,
  "dietary": ["non-veg"],
  "spiceLevel": "medium"
}
```

### Place Order (User)
```json
POST /api/user/orders
Headers: { "Authorization": "Bearer <token>" }
{
  "restaurantId": "65abc123...",
  "items": [
    {
      "menuItemId": "65def456...",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "456 Park Ave",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400002"
  },
  "paymentMethod": "upi",
  "contactPhone": "9876543210"
}
```

## 🔒 Security Best Practices

1. **Password Hashing** - All passwords hashed with bcrypt (10 salt rounds)
2. **JWT Tokens** - Secure token generation with expiry
3. **Role Verification** - Middleware checks for proper authorization
4. **Input Validation** - Mongoose schema validation
5. **Error Handling** - Proper error messages without exposing sensitive data

## 🎯 Interview Key Points

### Architecture Decisions
- **Middleware Pattern**: Separates authentication and authorization concerns
- **Schema Design**: Normalized data with proper relationships
- **Async/Await**: Modern promise handling for cleaner code
- **Error Handling**: Centralized error handling middleware

### Advanced Features Explained
- **Pre-save Hooks**: Password hashing, price calculations
- **Virtual Properties**: Related data population
- **Indexing**: Optimized queries with database indexes
- **Aggregation**: Complex queries for analytics

### Scalability Considerations
- **Pagination**: All list endpoints support pagination
- **Filtering**: Query parameters for efficient data retrieval
- **Caching Strategy**: Can implement Redis for frequent queries
- **Database Indexes**: Strategic indexing for performance

## 🧪 Testing

You can test the API using:
- **Postman** - Import endpoints and test
- **Thunder Client** (VS Code extension)
- **cURL** commands

## 📦 Database Models

### User
- Authentication data
- Role management
- Profile information
- Loyalty points

### Restaurant
- Business details
- Location & contact
- Operating hours
- Delivery settings

### MenuItem
- Product details
- Pricing & discounts
- Dietary information
- Customization options

### Order
- Order items
- Pricing breakdown
- Status tracking
- Ratings & reviews

## 🚀 Deployment

### Recommended Platforms
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<strong_random_secret>
PORT=5000
```

## 📧 Support

For any queries or issues, please create an issue in the repository.

## 📄 License

ISC License

---

**Built with ❤️ for learning and interviews**