function roleMiddleware(role) {
    return (req, res, next) => {
      if (req.session.user && req.session.user.role === role) {
        return next();
      }
      res.redirect('/auth/login'); 

    };
  }
  
  module.exports = { roleMiddleware };
  