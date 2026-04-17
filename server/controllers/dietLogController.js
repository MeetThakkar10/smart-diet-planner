import DietLog from "../models/DietLog.js";
import Food from "../models/Food.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Add a diet log (manual food tracking)
// @route   POST /api/dietlog
// @access  Private
export const addDietLog = async (req, res) => {
    const { foods } = req.body; // Array of Food ObjectId strings

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
        throw new ErrorResponse("Please provide an array of food IDs", 400);
    }

    // Fetch all food documents to calculate total calories
    const foodDocs = await Food.find({ _id: { $in: foods } });

    if (foodDocs.length === 0) {
        throw new ErrorResponse("No valid food items found for the given IDs", 404);
    }

    const totalCalories = foodDocs.reduce((sum, food) => sum + food.calories, 0);

    const dietLog = await DietLog.create({
        user: req.user._id,
        foods,
        totalCalories,
    });

    res.status(201).json({ success: true, data: dietLog });
};

// @desc    Get all diet logs for current user
// @route   GET /api/dietlog
// @access  Private
export const getMyDietLogs = async (req, res) => {
    const logs = await DietLog.find({ user: req.user._id })
        .populate("foods", "name calories type")
        .sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
    });
};

// @desc    Get single diet log
// @route   GET /api/dietlog/:id
// @access  Private
export const getDietLog = async (req, res) => {
    const log = await DietLog.findById(req.params.id).populate(
        "foods",
        "name calories type"
    );

    if (!log) {
        throw new ErrorResponse(`Diet log not found with id ${req.params.id}`, 404);
    }

    // Ensure user owns this log
    if (log.user.toString() !== req.user._id.toString()) {
        throw new ErrorResponse("Not authorized to access this diet log", 403);
    }

    res.status(200).json({ success: true, data: log });
};
// @desc    Get all diet logs (Admin only)
// @route   GET /api/dietlog/admin/all
// @access  Private/Admin
export const getAllDietLogs = async (req, res) => {
    const logs = await DietLog.find()
        .populate("user", "name email")
        .populate("foods", "name calories type")
        .sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
    });
};
