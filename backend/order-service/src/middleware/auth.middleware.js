import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // First, check if user context is forwarded from API Gateway
  const userId = req.header("x-user-id");
  const userRole = req.header("x-user-role");
  const userEmail = req.header("x-user-email");

  if (userId) {
    // User context forwarded from API Gateway
    req.user = {
      id: userId,
      role: userRole || "user",
      email: userEmail || "",
    };
    console.log("User authenticated via API Gateway headers:", req.user);
    return next();
  }

  // Fallback: Check for JWT token in Authorization header or cookies
  let token = null;

  const authHeader = req.header("Authorization");
  console.log("Authorization header:", authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Check cookies if no Authorization header
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token)
    return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    req.user = {
      id: decoded.id || decoded.userId,
      role: decoded.role || "user",
      email: decoded.email || "",
    };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ error: "Token is not valid" });
  }
};

export default authMiddleware;
