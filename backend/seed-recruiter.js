const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const DeliveryPerson = require('./models/DeliveryPerson');
require('dotenv').config();

const sampleAccounts = [
    {
        name: 'QuickBite Admin',
        email: 'admin@quickbite.com',
        password: 'password123',
        role: 'admin',
        phone: '1234567890'
    },
    {
        name: 'Sample Restaurant Owner',
        email: 'owner@quickbite.com',
        password: 'password123',
        role: 'owner',
        phone: '0987654321'
    },
    {
        name: 'Sample Delivery Partner',
        email: 'delivery@quickbite.com',
        password: 'password123',
        role: 'delivery',
        phone: '1122334455'
    },
    {
        name: 'Sample Customer',
        email: 'customer@quickbite.com',
        password: 'password123',
        role: 'user',
        phone: '5544332211'
    }
];

async function seedRecruiters() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        for (const account of sampleAccounts) {
            // Check if user already exists
            let user = await User.findOne({ email: account.email });

            if (user) {
                console.log(`Updating existing user: ${account.email}`);
                user.name = account.name;
                user.role = account.role;
                user.phone = account.phone;
                user.password = account.password; // Will be hashed by pre-save hook
                user.emailVerified = true;
                await user.save();
            } else {
                console.log(`Creating new user: ${account.email}`);
                user = await User.create({
                    ...account,
                    emailVerified: true
                });
            }

            // Role specific setup
            if (account.role === 'delivery') {
                let deliveryProfile = await DeliveryPerson.findOne({ user: user._id });
                if (!deliveryProfile) {
                    console.log(`Creating DeliveryPerson profile for: ${account.email}`);
                    await DeliveryPerson.create({
                        user: user._id,
                        vehicleType: 'bike',
                        vehicleNumber: 'SAMPLE-123',
                        drivingLicense: 'DL-SAMPLE-123',
                        isAvailable: true,
                        isOnline: true,
                        currentLocation: {
                            type: 'Point',
                            coordinates: [72.8777, 19.0760] // Mumbai
                        }
                    });
                }
            }

            if (account.role === 'owner') {
                let restaurant = await Restaurant.findOne({ owner: user._id });
                if (!restaurant) {
                    console.log(`Creating sample restaurant for owner: ${account.email}`);
                    await Restaurant.create({
                        name: "Recruiter's Bistro",
                        description: "A specialty sample restaurant for demo purposes.",
                        cuisine: ["Continental", "Italian"],
                        address: {
                            street: "Demo Street 1",
                            city: "Mumbai",
                            state: "Maharashtra",
                            zipCode: "400001",
                            country: "India"
                        },
                        location: {
                            type: "Point",
                            coordinates: [72.8777, 19.0760]
                        },
                        phone: account.phone,
                        email: account.email,
                        owner: user._id,
                        isActive: true,
                        images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"]
                    });
                }
            }
        }

        console.log('🎉 Recruiter credentials seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding recruiter data:', error);
        process.exit(1);
    }
}

seedRecruiters();
