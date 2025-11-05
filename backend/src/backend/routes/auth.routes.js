import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m"; // 30 minutos por defecto
const sign = (p) => jwt.sign(p, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

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

    res.json({
      token,
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

    res.json({
      token,
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

export default router;
