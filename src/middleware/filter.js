// Simple middleware to pass through requests
module.exports = (req, res, next) => {
  next();
};