import Disease from "../models/Disease.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Get all diseases
// @route   GET /api/diseases
// @access  Public
export const getDiseases = async (req, res) => {
    const diseases = await Disease.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: diseases.length,
        data: diseases,
    });
};

// @desc    Get single disease
// @route   GET /api/diseases/:id
// @access  Public
export const getDisease = async (req, res) => {
    const disease = await Disease.findById(req.params.id);

    if (!disease) {
        throw new ErrorResponse(`Disease not found with id ${req.params.id}`, 404);
    }

    res.status(200).json({ success: true, data: disease });
};

// @desc    Create disease
// @route   POST /api/diseases
// @access  Admin
export const createDisease = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ErrorResponse("Please provide a disease name", 400);
    }

    const disease = await Disease.create({ name, description });

    res.status(201).json({ success: true, data: disease });
};

// @desc    Update disease
// @route   PUT /api/diseases/:id
// @access  Admin
export const updateDisease = async (req, res) => {
    let disease = await Disease.findById(req.params.id);

    if (!disease) {
        throw new ErrorResponse(`Disease not found with id ${req.params.id}`, 404);
    }

    disease = await Disease.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, data: disease });
};

// @desc    Delete disease
// @route   DELETE /api/diseases/:id
// @access  Admin
export const deleteDisease = async (req, res) => {
    const disease = await Disease.findById(req.params.id);

    if (!disease) {
        throw new ErrorResponse(`Disease not found with id ${req.params.id}`, 404);
    }

    await disease.deleteOne();

    res.status(200).json({ success: true, data: {} });
};
