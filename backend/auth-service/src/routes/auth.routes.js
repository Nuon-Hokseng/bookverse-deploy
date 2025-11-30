import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { refreshToken } from "../controllers/refreshToken.controller.js";
import {
  registerValidator,
  loginValidator,
} from "../middleware/validators/auth.validator.js";
import { validate } from "../middleware/validators/validator.js";

const router = express.Router();
router.post("/register", registerValidator, validate, signup);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/refresh", refreshToken);
export default router;
