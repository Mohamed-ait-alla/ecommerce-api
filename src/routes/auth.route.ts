import express from "express";
import * as authControllers from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post('/register', validate(registerSchema), authControllers.register);
router.post('/login', validate(loginSchema), authControllers.login);
router.post('/refresh', authControllers.refreshToken);
router.post('/logout', authControllers.logout);
router.get('/me', requireAuth, authControllers.me);

export default router;