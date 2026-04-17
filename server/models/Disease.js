import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a disease name"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Disease = mongoose.model("Disease", diseaseSchema);
export default Disease;
