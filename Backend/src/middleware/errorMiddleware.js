// Central error handler — attach to app AFTER all routes
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Please log in again.";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Your session has expired. Please log in again.";
    statusCode = 401;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("❌", err);
  }

  if (process.env.NODE_ENV !== "development") {
    console.error("API error:", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode,
      message,
      code: err.errorCode,
      userId: req.user?._id?.toString(),
      timestamp: new Date().toISOString(),
    });
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(err.errorCode && { code: err.errorCode }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Async wrapper — no try/catch needed in controllers
const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Quick error creator
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, catchAsync, createError };
