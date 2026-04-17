import express from "express";
import {
    getFoods,
    getFood,
    createFood,
    updateFood,
    deleteFood,
} from "../controllers/foodController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router
    .route("/")
    .get(getFoods)
    .post(protect, authorize("admin"), createFood);

router
    .route("/:id")
    .get(getFood)
    .put(protect, authorize("admin"), updateFood)
    .delete(protect, authorize("admin"), deleteFood);

export default router;
