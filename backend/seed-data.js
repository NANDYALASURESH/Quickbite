// Script to add sample restaurant data to QuickBite
// Run this with: node seed-data.js

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

// Sample restaurant data
const sampleRestaurants = [
    {
        name: "Pizza Paradise",
        description: "Authentic Italian pizzas with fresh ingredients and traditional recipes",
        cuisine: ["Italian"],
        address: {
            street: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [72.8777, 19.0760] // [longitude, latitude] for Mumbai
        },
        phone: "+91 98765 43210",
        email: "contact@pizzaparadise.com",
        rating: { average: 4.5, count: 150 },
        isActive: true,
        deliverySettings: {
            estimatedDeliveryTime: 30,
            minimumOrderAmount: 200,
            deliveryFee: 40
        }
    },
    {
        name: "Spice Junction",
        description: "Traditional Indian cuisine with authentic spices and flavors",
        cuisine: ["Indian"],
        address: {
            street: "456 Park Avenue",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400002",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [72.8800, 19.0800]
        },
        phone: "+91 98765 43211",
        email: "info@spicejunction.com",
        rating: { average: 4.7, count: 200 },
        isActive: true,
        deliverySettings: {
            estimatedDeliveryTime: 25,
            minimumOrderAmount: 150,
            deliveryFee: 30
        }
    },
    {
        name: "Burger Hub",
        description: "Juicy burgers and crispy fries - American fast food at its best",
        cuisine: ["American", "Fast Food"],
        address: {
            street: "789 Food Street",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400003",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [72.8750, 19.0750]
        },
        phone: "+91 98765 43212",
        email: "hello@burgerhub.com",
        rating: { average: 4.3, count: 180 },
        isActive: true,
        deliverySettings: {
            estimatedDeliveryTime: 20,
            minimumOrderAmount: 180,
            deliveryFee: 35
        }
    },
    {
        name: "Wok & Roll",
        description: "Fresh Chinese cuisine with authentic flavors and quick service",
        cuisine: ["Chinese"],
        address: {
            street: "321 Dragon Lane",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400004",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [72.8820, 19.0820]
        },
        phone: "+91 98765 43213",
        email: "orders@wokandroll.com",
        rating: { average: 4.6, count: 175 },
        isActive: true,
        deliverySettings: {
            estimatedDeliveryTime: 28,
            minimumOrderAmount: 160,
            deliveryFee: 38
        }
    },
    {
        name: "Taco Fiesta",
        description: "Authentic Mexican tacos, burritos, and nachos",
        cuisine: ["Mexican"],
        address: {
            street: "555 Spice Road",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400005",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [72.8700, 19.0700]
        },
        phone: "+91 98765 43214",
        email: "fiesta@tacofiesta.com",
        rating: { average: 4.4, count: 120 },
        isActive: true,
        deliverySettings: {
            estimatedDeliveryTime: 22,
            minimumOrderAmount: 170,
            deliveryFee: 32
        }
    },
    {
        name: "Sushi Express",
        description: "Fresh sushi and Japanese delicacies prepared by expert chefs",
        cuisine: ["Japanese"],
        address: {
            street: "888 Ocean Drive",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400006",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [72.8850, 19.0850]
        },
        phone: "+91 98765 43215",
        email: "sushi@sushiexpress.com",
        rating: { average: 4.8, count: 95 },
        isActive: true,
        deliverySettings: {
            estimatedDeliveryTime: 35,
            minimumOrderAmount: 250,
            deliveryFee: 50
        }
    }
];

// Sample menu items for each restaurant
const menuItemsData = {
    "Pizza Paradise": [
        { name: "Margherita Pizza", description: "Classic tomato, mozzarella, and basil", price: 299, category: "Main Course", dietary: ["vegetarian"], isAvailable: true },
        { name: "Pepperoni Pizza", description: "Loaded with pepperoni and cheese", price: 399, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "Veggie Supreme", description: "Mixed vegetables with cheese", price: 349, category: "Main Course", dietary: ["vegetarian"], isAvailable: true },
        { name: "Garlic Bread", description: "Crispy bread with garlic butter", price: 129, category: "Appetizer", dietary: ["vegetarian"], isAvailable: true }
    ],
    "Spice Junction": [
        { name: "Butter Chicken", description: "Creamy tomato-based chicken curry", price: 320, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "Paneer Tikka Masala", description: "Cottage cheese in rich gravy", price: 280, category: "Main Course", dietary: ["vegetarian"], isAvailable: true },
        { name: "Dal Makhani", description: "Black lentils in creamy sauce", price: 220, category: "Main Course", dietary: ["vegetarian"], isAvailable: true },
        { name: "Garlic Naan", description: "Soft bread with garlic", price: 60, category: "Appetizer", dietary: ["vegetarian"], isAvailable: true }
    ],
    "Burger Hub": [
        { name: "Classic Beef Burger", description: "Juicy beef patty with cheese", price: 249, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "Veggie Burger", description: "Grilled veggie patty", price: 199, category: "Main Course", dietary: ["vegetarian"], isAvailable: true },
        { name: "Chicken Burger", description: "Crispy chicken with mayo", price: 229, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "French Fries", description: "Crispy golden fries", price: 99, category: "Snacks", dietary: ["vegetarian"], isAvailable: true }
    ],
    "Wok & Roll": [
        { name: "Hakka Noodles", description: "Stir-fried noodles with vegetables", price: 180, category: "Main Course", dietary: ["vegetarian"], isAvailable: true },
        { name: "Chicken Fried Rice", description: "Fried rice with chicken", price: 220, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "Manchurian", description: "Vegetable balls in spicy sauce", price: 200, category: "Appetizer", dietary: ["vegetarian"], isAvailable: true },
        { name: "Spring Rolls", description: "Crispy vegetable rolls", price: 150, category: "Appetizer", dietary: ["vegetarian"], isAvailable: true }
    ],
    "Taco Fiesta": [
        { name: "Chicken Tacos", description: "3 soft tacos with chicken", price: 249, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "Veggie Burrito", description: "Large burrito with beans and rice", price: 229, category: "Main Course", dietary: ["vegetarian"], isAvailable: true },
        { name: "Nachos Supreme", description: "Loaded nachos with cheese", price: 199, category: "Appetizer", dietary: ["vegetarian"], isAvailable: true },
        { name: "Quesadilla", description: "Cheese quesadilla", price: 189, category: "Main Course", dietary: ["vegetarian"], isAvailable: true }
    ],
    "Sushi Express": [
        { name: "California Roll", description: "Crab, avocado, cucumber", price: 350, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "Vegetable Tempura", description: "Crispy fried vegetables", price: 280, category: "Appetizer", dietary: ["vegetarian"], isAvailable: true },
        { name: "Salmon Nigiri", description: "Fresh salmon on rice", price: 420, category: "Main Course", dietary: ["non-veg"], isAvailable: true },
        { name: "Miso Soup", description: "Traditional Japanese soup", price: 120, category: "Soup", dietary: ["vegetarian"], isAvailable: true }
    ]
};

async function seedData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find an owner user (or create one)
        let owner = await User.findOne({ role: 'owner' });

        if (!owner) {
            console.log('Creating sample owner account...');
            owner = await User.create({
                name: 'Restaurant Owner',
                email: 'owner@test.com',
                password: 'password',
                role: 'owner',
                phone: '+91 98765 00000'
            });
            console.log('✅ Owner account created');
        }

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await Restaurant.deleteMany({});
        // await MenuItem.deleteMany({});
        // console.log('🗑️  Cleared existing data');

        // Add restaurants and menu items
        for (const restaurantData of sampleRestaurants) {
            // Check if restaurant already exists
            const existingRestaurant = await Restaurant.findOne({ name: restaurantData.name });

            if (existingRestaurant) {
                console.log(`⏭️  Restaurant "${restaurantData.name}" already exists, skipping...`);
                continue;
            }

            // Create restaurant
            const restaurant = await Restaurant.create({
                ...restaurantData,
                owner: owner._id
            });
            console.log(`✅ Created restaurant: ${restaurant.name}`);

            // Add menu items for this restaurant
            const menuItems = menuItemsData[restaurant.name];
            if (menuItems) {
                for (const itemData of menuItems) {
                    await MenuItem.create({
                        ...itemData,
                        restaurant: restaurant._id
                    });
                }
                console.log(`   ✅ Added ${menuItems.length} menu items`);
            }
        }

        console.log('\n🎉 Sample data seeded successfully!');
        console.log('\n📊 Summary:');
        const restaurantCount = await Restaurant.countDocuments();
        const menuItemCount = await MenuItem.countDocuments();
        console.log(`   - Restaurants: ${restaurantCount}`);
        console.log(`   - Menu Items: ${menuItemCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seed function
seedData();
