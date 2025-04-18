// Custom error class for API errors
export class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    // Default error values
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const isOperational = err.isOperational !== false;
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            statusCode,
            isOperational
        });
    }
    // Send response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};
// Not found handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Not Found - ${req.originalUrl}`
        }
    });
};
