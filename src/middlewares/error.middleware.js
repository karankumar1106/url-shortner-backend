const errorHandler = (err, req, res, next) => {
  return res.status(err?.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export { errorHandler };
  