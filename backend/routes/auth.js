import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  auth,
} from "../middleware/auth.js";

const router = Router();

// Build the initials shown on a user's avatar from their name.
function initialsFor(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 5)
    .toUpperCase();
}

// POST /api/auth/signup — hash the password, insert the user, set the cookie.
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email and password are required" });

  try {
    const hash = await bcrypt.hash(password, 10);
    const initials = initialsFor(name);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, initials) VALUES (?, ?, ?, ?)",
      [name, email, hash, initials]
    );

    const user = { id: result.insertId, name, email, initials };
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already in use" });
    res.status(500).json({ error: "Signup failed" });
  }
});

// POST /api/auth/login — check the password, then sign a JWT and set the cookie.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, initials: user.initials },
    token,
  });
});

// POST /api/auth/logout — clear the auth cookie.
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// GET /api/auth/me — the logged-in user and their own reviews. Used both to
// restore the session after a refresh and to power the profile page.
router.get("/me", auth, async (req, res) => {
  const [[user]] = await pool.query(
    "SELECT id, name, email, initials FROM users WHERE id = ?",
    [req.user.id]
  );
  if (!user) return res.status(404).json({ error: "User not found" });

  const [reviews] = await pool.query(
    `SELECT r.id,
            r.apt_id   AS aptId,
            r.user_id  AS userId,
            r.rating,
            r.body,
            r.created  AS date,
            a.name     AS apartment
     FROM reviews r
     JOIN apartments a ON a.id = r.apt_id
     WHERE r.user_id = ?
     ORDER BY r.created DESC, r.id DESC`,
    [req.user.id]
  );

  res.json({ user, reviews });
});

// PUT /api/auth/me — edit the logged-in user's profile. Any of name, email and
// password may be sent; initials are recomputed when the name changes.
router.put("/me", auth, async (req, res) => {
  const { name, email, password } = req.body;

  const [[current]] = await pool.query(
    "SELECT id, name, email, initials FROM users WHERE id = ?",
    [req.user.id]
  );
  if (!current) return res.status(404).json({ error: "User not found" });

  const nextName = name ?? current.name;
  const nextEmail = email ?? current.email;
  const nextInitials = name ? initialsFor(name) : current.initials;
  const nextPassword = password ? await bcrypt.hash(password, 10) : undefined;

  try {
    if (nextPassword !== undefined) {
      await pool.query(
        "UPDATE users SET name = ?, email = ?, initials = ?, password = ? WHERE id = ?",
        [nextName, nextEmail, nextInitials, nextPassword, req.user.id]
      );
    } else {
      await pool.query(
        "UPDATE users SET name = ?, email = ?, initials = ? WHERE id = ?",
        [nextName, nextEmail, nextInitials, req.user.id]
      );
    }
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already in use" });
    return res.status(500).json({ error: "Update failed" });
  }

  res.json({
    user: {
      id: req.user.id,
      name: nextName,
      email: nextEmail,
      initials: nextInitials,
    },
  });
});

export default router;
