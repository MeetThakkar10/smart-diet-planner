import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Disease from "./models/Disease.js";
import Food from "./models/Food.js";

dotenv.config();
await connectDB();

// 1. Promote admin user
const admin = await User.findOneAndUpdate(
    { email: "admin@dietplanner.com" },
    { role: "admin" },
    { new: true }
);
console.log("✅ Admin user promoted:", admin.email);

// 2. Seed Diseases
const diseases = await Disease.insertMany([
    { name: "Diabetes", description: "A metabolic disease causing high blood sugar levels" },
    { name: "Hypertension", description: "A condition with persistently elevated blood pressure" },
    { name: "Heart Disease", description: "A range of conditions affecting the heart and blood vessels" },
    { name: "Obesity", description: "Excessive body fat that increases the risk of health problems" },
    { name: "PCOD", description: "Polycystic Ovarian Disease affecting hormonal balance" },
    { name: "Thyroid", description: "Conditions affecting the thyroid gland and metabolism" },
]);
console.log(`✅ Seeded ${diseases.length} diseases`);

// 3. Seed Foods (link to diseases)
const diabetesId = diseases.find((d) => d.name === "Diabetes")._id;
const hypertenId = diseases.find((d) => d.name === "Hypertension")._id;
const heartId = diseases.find((d) => d.name === "Heart Disease")._id;
const obesityId = diseases.find((d) => d.name === "Obesity")._id;

const foods = await Food.insertMany([
    // Diabetes
    { name: "Oats Porridge", calories: 150, disease: diabetesId, type: "recommended" },
    { name: "Brown Rice", calories: 215, disease: diabetesId, type: "recommended" },
    { name: "Bitter Gourd Sabzi", calories: 45, disease: diabetesId, type: "recommended" },
    { name: "White Sugar", calories: 400, disease: diabetesId, type: "avoid" },
    { name: "Gulab Jamun", calories: 380, disease: diabetesId, type: "avoid" },

    // Hypertension
    { name: "Banana", calories: 105, disease: hypertenId, type: "recommended" },
    { name: "Spinach Salad", calories: 40, disease: hypertenId, type: "recommended" },
    { name: "Pickles (Achar)", calories: 50, disease: hypertenId, type: "avoid" },
    { name: "Papad", calories: 60, disease: hypertenId, type: "avoid" },

    // Heart Disease
    { name: "Almonds", calories: 160, disease: heartId, type: "recommended" },
    { name: "Olive Oil Roti", calories: 120, disease: heartId, type: "recommended" },
    { name: "Deep Fried Samosa", calories: 310, disease: heartId, type: "avoid" },

    // Obesity
    { name: "Moong Dal Chilla", calories: 120, disease: obesityId, type: "recommended" },
    { name: "Grilled Chicken Tikka", calories: 195, disease: obesityId, type: "recommended" },
    { name: "Butter Naan", calories: 320, disease: obesityId, type: "avoid" },
]);
console.log(`✅ Seeded ${foods.length} food items`);

console.log("\n🎉 All collections seeded successfully!");
await mongoose.disconnect();
process.exit(0);
