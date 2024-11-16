function roleMiddleware(role) {
  return (req, res, next) => {
    console.log('User role:', req.session.user); // Debugging log
    if (req.session.user && req.session.user.role === role) {
      return next();
    }
    res.status(403).send('Access denied');
  };
}
