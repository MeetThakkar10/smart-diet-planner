import Food from "../models/Food.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Get all foods (optionally filter by disease or type)
// @route   GET /api/foods
// @access  Public
export const getFoods = async (req, res) => {
    const filter = {};
    if (req.query.disease) filter.disease = req.query.disease;
    if (req.query.type) filter.type = req.query.type;

    const foods = await Food.find(filter)
        .populate("disease", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: foods.length,
        data: foods,
    });
};

// @desc    Get single food item
// @route   GET /api/foods/:id
// @access  Public
export const getFood = async (req, res) => {
    const food = await Food.findById(req.params.id).populate("disease", "name");

    if (!food) {
        throw new ErrorResponse(`Food not found with id ${req.params.id}`, 404);
    }

    res.status(200).json({ success: true, data: food });
};

// @desc    Create food item
// @route   POST /api/foods
// @access  Admin
export const createFood = async (req, res) => {
    const { name, calories, disease, type } = req.body;

    if (!name || calories === undefined || !type) {
        throw new ErrorResponse("Please provide name, calories, and type", 400);
    }

    const food = await Food.create({ name, calories, disease, type });

    res.status(201).json({ success: true, data: food });
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Admin
export const updateFood = async (req, res) => {
    let food = await Food.findById(req.params.id);

    if (!food) {
        throw new ErrorResponse(`Food not found with id ${req.params.id}`, 404);
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, data: food });
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Admin
export const deleteFood = async (req, res) => {
    const food = await Food.findById(req.params.id);

    if (!food) {
        throw new ErrorResponse(`Food not found with id ${req.params.id}`, 404);
    }

    await food.deleteOne();

    res.status(200).json({ success: true, data: {} });
};
