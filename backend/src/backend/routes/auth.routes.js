import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m"; // 30 minutos por defecto
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

const sign = (p) => jwt.sign(p, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Generar refresh token seguro
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "USER",
    });

    const token = sign({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken();

    // Guardar refresh token en DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN
    );
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo registrar" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = sign({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken();

    // Guardar refresh token en DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN
    );
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

router.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token requerido" });
    }

    // Buscar usuario con este refresh token
    const user = await User.findOne({
      refreshToken,
      refreshTokenExpiresAt: { $gt: new Date() },
    }).select("+refreshToken +refreshTokenExpiresAt");

    if (!user) {
      return res
        .status(401)
        .json({ error: "Refresh token inválido o expirado" });
    }

    // Generar nuevo access token y refresh token
    const newToken = sign({ id: user._id.toString(), role: user.role });
    const newRefreshToken = generateRefreshToken();

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN
    );
    await user.save();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo renovar el token" });
  }
});

export default router;
