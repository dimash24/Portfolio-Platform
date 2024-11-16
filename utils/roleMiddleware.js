function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (req.session.user && allowedRoles.includes(req.session.user.role)) {
      return next();
    }
    res.status(403).send('Access denied');
  };
}

module.exports = roleMiddleware;
