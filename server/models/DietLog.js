import mongoose from "mongoose";

const dietLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        aiGeneratedPlan: {
            type: String,
            default: "",
        },
        foods: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Food",
            },
        ],
        totalCalories: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const DietLog = mongoose.model("DietLog", dietLogSchema);
export default DietLog;
