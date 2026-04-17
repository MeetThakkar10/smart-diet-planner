/**
 * Wraps an async route handler so that any rejected promise
 * is automatically forwarded to Express error middleware.
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
