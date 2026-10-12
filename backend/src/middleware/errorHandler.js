import { ApiError } from '../utils/apiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Resource not found on Dhanvikk server: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `An account or record with this ${field} already exists.`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error = new ApiError(422, errors[0]?.message || 'Database validation failed', errors);
  }

  // Handle JWT Malformed / Expired
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Session has expired. Please log in again.');
  }

  const statusCode = error.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = error.message || 'Something went wrong on our side. Please try again.';

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error('💥 [Server Error]:', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};
