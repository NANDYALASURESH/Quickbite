// Script to UPDATE existing restaurants and menu items with images
// Run this with: node update-images.js

const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

// Restaurant images mapping
const restaurantImages = {
    "Pizza Paradise": ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"],
    "Spice Junction": ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800"],
    "Burger Hub": ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"],
    "Wok & Roll": ["https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800"],
    "Taco Fiesta": ["https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800"],
    "Sushi Express": ["https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800"]
};

// Menu item images mapping
const menuItemImages = {
    // Pizza Paradise
    "Margherita Pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    "Pepperoni Pizza": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
    "Veggie Supreme": "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400",
    "Garlic Bread": "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400",

    // Spice Junction
    "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
    "Paneer Tikka Masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
    "Dal Makhani": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
    "Garlic Naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",

    // Burger Hub
    "Classic Beef Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    "Veggie Burger": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
    "Chicken Burger": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400",
    "French Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",

    // Wok & Roll
    "Hakka Noodles": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
    "Chicken Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    "Manchurian": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400",
    "Spring Rolls": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400",

    // Taco Fiesta
    "Chicken Tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
    "Veggie Burrito": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
    "Nachos Supreme": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400",
    "Quesadilla": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400",

    // Sushi Express
    "California Roll": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    "Vegetable Tempura": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    "Salmon Nigiri": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400",
    "Miso Soup": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400"
};

async function updateImages() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        let restaurantCount = 0;
        let menuItemCount = 0;

        // Update restaurants
        console.log('\n📸 Updating restaurant images...');
        for (const [name, images] of Object.entries(restaurantImages)) {
            const result = await Restaurant.updateOne(
                { name: name },
                { $set: { images: images } }
            );

            if (result.modifiedCount > 0) {
                console.log(`   ✅ Updated: ${name}`);
                restaurantCount++;
            } else {
                console.log(`   ⏭️  Skipped: ${name} (not found or already has images)`);
            }
        }

        // Update menu items
        console.log('\n🍽️  Updating menu item images...');
        for (const [name, image] of Object.entries(menuItemImages)) {
            const result = await MenuItem.updateOne(
                { name: name },
                { $set: { image: image } }
            );

            if (result.modifiedCount > 0) {
                console.log(`   ✅ Updated: ${name}`);
                menuItemCount++;
            } else {
                console.log(`   ⏭️  Skipped: ${name} (not found or already has image)`);
            }
        }

        console.log('\n🎉 Images updated successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Restaurants updated: ${restaurantCount}`);
        console.log(`   - Menu items updated: ${menuItemCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating images:', error);
        process.exit(1);
    }
}

// Run the update function
updateImages();
