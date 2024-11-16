function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(403).send('Access denied');
    }

    if (req.session.user.role === requiredRole) {
      return next();
    }

    res.status(403).send('Access denied');
  };
}
