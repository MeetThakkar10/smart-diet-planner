import express from "express";
import {
    getDiseases,
    getDisease,
    createDisease,
    updateDisease,
    deleteDisease,
} from "../controllers/diseaseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router
    .route("/")
    .get(getDiseases)
    .post(protect, authorize("admin"), createDisease);

router
    .route("/:id")
    .get(getDisease)
    .put(protect, authorize("admin"), updateDisease)
    .delete(protect, authorize("admin"), deleteDisease);

export default router;
