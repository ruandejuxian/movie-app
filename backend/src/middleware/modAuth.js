const auth = require('./auth');

module.exports = function(req, res, next) {
  auth(req, res, () => {
    if (req.user.role === 'admin' || req.user.role === 'mod') {
      next();
    } else {
      res.status(403).json({ message: 'Quyền truy cập bị từ chối, yêu cầu quyền Moderator hoặc Admin' });
    }
  });
};
