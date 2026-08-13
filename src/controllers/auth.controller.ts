import type { Request, Response } from "express";
import { prisma } from "../config/db";

const register = async (req: Request, res: Response) => {};

const login = async (req: Request, res: Response) => {};

const refreshToken = async (req: Request, res: Response) => {};

const logout = async (req: Request, res: Response) => {};

const me = async (req: Request, res: Response) => {};

export { register, login, refreshToken, logout, me };
