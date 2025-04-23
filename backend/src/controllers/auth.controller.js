import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    res.status(201, { message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "User Registeration Failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401, { message: "User not found" });
    }

    const isMatched = bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401, { message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
  } catch (error) {
    return res.status(500).json({ message: "Login Failed" });
  }
};

export const logout = async (req, res) => {
 try {
   res.cookie("jwt", "", {
     httpOnly: true,
     sameSite: "strict",
     secure: process.env.NODE_ENV !== "development",
     maxAge: 0,
   });
   res.status(200).json({ message: "Logout successful" });
 } catch (error) {
  console.error(error)
 }
};

export const me = async (req, res) => {
  const {user} = req;
  return user
};
