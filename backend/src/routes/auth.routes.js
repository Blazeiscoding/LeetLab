import express from "express";
import { register, login, logout, me } from "../controllers/auth.controller";
const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/me", me);
export default authRoutes;
