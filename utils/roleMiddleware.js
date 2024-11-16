function roleMiddleware(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      return next();
    }
    res.status(403).send('Access denied');
  };
}

module.exports = { roleMiddleware };
