import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    console.log("[Refresh Token] Request received, cookie present:", !!token);
    console.log("[Refresh Token] Cookies:", req.cookies);
    if (!token)
      return res.status(401).json({ message: "No refresh token provided" });

    // Verify token
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        console.log("[Refresh Token] Token verification failed:", err.message);
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      console.log("[Refresh Token] Token decoded, user ID:", decoded.id);
      const user = await User.findById(decoded.id);
      console.log("[Refresh Token] User found:", !!user);
      console.log(
        "[Refresh Token] Token from cookie:",
        token.substring(0, 50) + "..."
      );
      console.log(
        "[Refresh Token] Token from DB:",
        user?.refreshToken?.substring(0, 50) + "..."
      );
      console.log(
        "[Refresh Token] Tokens match:",
        user?.refreshToken === token
      );

      if (!user || user.refreshToken !== token) {
        return res.status(403).json({ message: "Refresh token mismatch" });
      }

      // Issue new access token
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set access token in HTTP-only cookie
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
