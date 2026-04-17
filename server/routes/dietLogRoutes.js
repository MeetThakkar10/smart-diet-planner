import express from "express";
import {
    addDietLog,
    getMyDietLogs,
    getDietLog,
    getAllDietLogs,
} from "../controllers/dietLogController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(protect, addDietLog).get(protect, getMyDietLogs);

router.route("/admin/all").get(protect, authorize("admin"), getAllDietLogs);

router.route("/:id").get(protect, getDietLog);


export default router;
