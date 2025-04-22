import express from "express";

const authRoutes = express.Router();

authRoutes.post("/register");
authRoutes.post("/login");
authRoutes.post("/logout");
authRoutes.post("/me");
export default authRoutes;
