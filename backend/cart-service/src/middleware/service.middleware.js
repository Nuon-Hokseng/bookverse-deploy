const serviceAuthMiddleware = (req, res, next) => {
  const token = req.header("X-Service-Token");

  if (!token || token !== process.env.CART_SERVICE_TOKEN) {
    return res.status(403).json({ message: "Forbidden: invalid service token" });
  }

  next();
};

export default serviceAuthMiddleware;