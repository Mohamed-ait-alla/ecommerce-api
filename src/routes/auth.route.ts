import express from "express";
import {
    register,
    login,
    refreshToken,
    logout,
    me,
} from "../controllers/auth.controller";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('logout', logout);
router.get('/me', me);

export default router;