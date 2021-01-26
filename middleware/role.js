const { ReE } = require('../services/util.service');

module.exports = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return ReE(res, `This operation is not allowed for ${req.user.role}`);
  }
  next();
  return null;
};
