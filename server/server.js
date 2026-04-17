import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import diseaseRoutes from "./routes/diseaseRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import dietLogRoutes from "./routes/dietLogRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Mount Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dietlog", dietLogRoutes);

// Health-check endpoint
app.get("/", (req, res) => {
    res.json({ message: "Smart Diet Planner API is running" });
});

// ---------- Error Handler (must be after routes) ----------
app.use(errorHandler);

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
