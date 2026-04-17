/**
 * Custom error class that carries an HTTP status code.
 * Throw this in controllers to produce clean JSON error responses.
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export default ErrorResponse;
