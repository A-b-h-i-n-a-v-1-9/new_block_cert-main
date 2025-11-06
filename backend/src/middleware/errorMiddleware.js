// // backend/src/middleware/errorMiddleware.js
// export const errorHandler = (err, req, res, next) => {
//   console.error("❌ Error:", err.stack);
//   const status = err.statusCode || 500;
//   res.status(status).json({
//     message: err.message || "Internal Server Error",
//     stack: process.env.NODE_ENV === "development" ? err.stack : undefined
//   });
// };

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.log(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        return res.status(404).json({ error: message });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        return res.status(400).json({ error: message });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ error: message });
    }

    res.status(error.statusCode || 500).json({
        error: error.message || 'Server Error'
    });
};