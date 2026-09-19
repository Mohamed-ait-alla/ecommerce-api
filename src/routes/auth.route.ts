import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
import * as authControllers from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authControllers.register);
router.post('/login', authLimiter, validate(loginSchema), authControllers.login);
router.post('/refresh', authControllers.refreshToken);
router.post('/logout', authControllers.logout);
router.get('/me', requireAuth, authControllers.me);

export default router;