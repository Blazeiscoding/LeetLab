/**
 * Standard error response handler
 */
export const errorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV !== "production") {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Async error handler wrapper for route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return errorResponse(res, 409, "Record already exists");
  }
  if (err.code === "P2025") {
    return errorResponse(res, 404, "Record not found");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, 401, "Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    return errorResponse(res, 401, "Token expired");
  }

  // Default error
  return errorResponse(
    res,
    err.statusCode || 500,
    err.message || "Internal server error",
    err
  );
};
