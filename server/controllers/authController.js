import User from "../models/User.js";
import ErrorResponse from "../utils/errorResponse.js";

// Helper — create token, set response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ErrorResponse("Please provide name, email, and password", 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ErrorResponse("User already exists with this email", 400);
    }

    const user = await User.create({ name, email, password });

    sendTokenResponse(user, 201, res);
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ErrorResponse("Please provide email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ErrorResponse("Invalid credentials", 401);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        throw new ErrorResponse("Invalid credentials", 401);
    }

    sendTokenResponse(user, 200, res);
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
};
