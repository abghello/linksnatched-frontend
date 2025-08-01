const { StatusCodes } = require('http-status-codes');
module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  // Custom app error response format
  if (err.code && err.message && err.type) {
    return res.status(err.code).json({ type: err.type, message: err.message });
  }

  if (err.code && err.message && err) {
    return res.status(err.code).json({ message: err.message });
  }

  // Handle 500 with message if no code is provided
  if (err.message) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }

  // default to 404 server error
  return res.status(StatusCodes.NOT_FOUND).json({ message: 'Not Found' });
}
