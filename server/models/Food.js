import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a food name"],
            trim: true,
        },
        calories: {
            type: Number,
            required: [true, "Please add calorie count"],
        },
        disease: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Disease",
        },
        type: {
            type: String,
            enum: ["recommended", "avoid"],
            required: [true, "Please specify food type (recommended / avoid)"],
        },
    },
    { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);
export default Food;
