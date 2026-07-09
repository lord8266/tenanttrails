import jwt from "jsonwebtoken";
import "dotenv/config";

const COOKIE_NAME = "token";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days, matches token expiry

// Sign a JWT carrying the user's id. Used by signup and login.
export function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Set the auth token as an httpOnly cookie. JavaScript on the page cannot read
// it, so a cross-site script cannot steal it.
export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
  });
}

// Clear the auth cookie (logout).
export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

// Middleware: verify the token and attach the user to the request. Reads the
// httpOnly cookie first, then falls back to an "Authorization: Bearer <token>"
// header so tooling that sends the header (Postman, tests) keeps working.
export function auth(req, res, next) {
  const header = req.headers.authorization; // "Bearer <token>"
  const token = req.cookies?.[COOKIE_NAME] || (header && header.split(" ")[1]);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // token is valid
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
