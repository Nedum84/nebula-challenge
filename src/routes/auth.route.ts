import express from "express";
import { validateReq, authMiddleware } from "../middlewares";
import { authValidation } from "../validation/auth.validation";
import { authController } from "../controller/auth.controller";

const router = express.Router({ mergeParams: true });

// Public routes
router.post("/register", validateReq(authValidation.register), authController.register);
router.post("/login", validateReq(authValidation.login), authController.login);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/me", authMiddleware, authController.getProfile);

export const authRoutes = router;
