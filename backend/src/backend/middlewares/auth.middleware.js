import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export const requireAuth = (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const p = jwt.verify(token, JWT_SECRET);
    req.user = { id: p.id, role: p.role };
    next();
  } catch {
    return res.status(401).json({ error: "No autorizado" });
  }
};
