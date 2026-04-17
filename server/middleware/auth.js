import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ErrorResponse from "../utils/errorResponse.js";

/**
 * Protect routes — user must send a valid JWT in the
 * Authorization header as "Bearer <token>".
 */
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new ErrorResponse("Not authorized, no token provided", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            throw new ErrorResponse("User not found", 401);
        }

        next();
    } catch (error) {
        if (error instanceof ErrorResponse) {
            throw error;
        }
        throw new ErrorResponse("Not authorized, token failed", 401);
    }
};

/**
 * Restrict access to specific roles.
 * Usage: authorize("admin")
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ErrorResponse(
                `Role '${req.user.role}' is not authorized to access this route`,
                403
            );
        }
        next();
    };
};
