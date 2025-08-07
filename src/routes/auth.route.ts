import express from "express";
import { validateReq } from "../middlewares";
import { authValidation } from "../validation/auth.validation";
import { authController } from "../controller/auth.controller";

const router = express.Router({ mergeParams: true });

router.post("/register", validateReq(authValidation.register), authController.register);

export const authRoutes = router;
