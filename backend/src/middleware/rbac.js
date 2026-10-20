const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user.role}'. Required: [${roles.join(', ')}]`
      });
    }

    // If role is recruiter, verify they are verified and active
    if (req.user.role === 'recruiter') {
      if (req.user.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your recruiter account is currently pending administrator verification.'
        });
      }
      if (req.user.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your recruiter access request was rejected by the administrator.'
        });
      }
    }

    next();
  };
};

module.exports = { authorize };
