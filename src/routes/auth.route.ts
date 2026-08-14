import express from "express";
import * as authControllers from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema } from "../validators/auth.validator";

const router = express.Router();

router.post('/register', validate(registerSchema), authControllers.register);
router.post('/login', authControllers.login);
router.post('/refresh', authControllers.refreshToken);
router.post('logout', authControllers.logout);
router.get('/me', authControllers.me);

export default router;