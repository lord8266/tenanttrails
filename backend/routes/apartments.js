import { Router } from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { setAttachments, getAttachments } from "../attachments.js";

const router = Router();

// GET /api/apartments — the dashboard list, each card with its rating,
// review count, and its attachments (photos/documents).
router.get("/", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.id, a.name, a.address, a.neighbourhood, a.landlord, a.units,
           a.verified,
           a.built                 AS yearBuilt,
           ROUND(AVG(r.rating), 1) AS rating,
           COUNT(r.id)            AS reviews
    FROM apartments a
    LEFT JOIN reviews r ON r.apt_id = a.id
    GROUP BY a.id
  `);

  // Fetch every apartment attachment, then group them onto their apartment.
  const [attachments] = await pool.query(
    "SELECT id, apartment_id, url, type, created FROM attachment WHERE apartment_id IS NOT NULL"
  );
  const byApt = {};
  for (const att of attachments) (byApt[att.apartment_id] ??= []).push(att);

  res.json(rows.map((a) => ({ ...a, attachments: byApt[a.id] ?? [] })));
});

// GET /api/apartments/:id — one apartment, its attachments, and its reviews
// (each review carries its own attachments and author).
router.get("/:id", async (req, res) => {
  const [[apartment]] = await pool.query(
    `SELECT id, name, address, neighbourhood, landlord, units, verified,
            built AS yearBuilt
     FROM apartments WHERE id = ?`,
    [req.params.id]
  );
  if (!apartment)
    return res.status(404).json({ error: "Apartment not found" });

  const aptAttachments = await getAttachments("apartment_id", apartment.id);

  const [reviews] = await pool.query(
    `SELECT r.id,
            r.apt_id   AS aptId,
            r.user_id  AS userId,
            r.rating,
            r.body,
            r.created  AS date,
            u.name     AS author,
            u.initials
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.apt_id = ?
     ORDER BY r.created DESC, r.id DESC`,
    [req.params.id]
  );

  const [revAttachments] = await pool.query(
    `SELECT ra.id, ra.review_id, ra.url, ra.type, ra.created
     FROM attachment ra
     JOIN reviews r ON r.id = ra.review_id
     WHERE r.apt_id = ?`,
    [req.params.id]
  );
  const byReview = {};
  for (const att of revAttachments) (byReview[att.review_id] ??= []).push(att);

  res.json({
    ...apartment,
    attachments: aptAttachments,
    reviews: reviews.map((rv) => ({
      ...rv,
      attachments: byReview[rv.id] ?? [],
    })),
  });
});

// POST /api/apartments — create an apartment with an optional attachments
// list ([{ url, type }]) in one request. Protected.
router.post("/", auth, async (req, res) => {
  const { name, address, neighbourhood, landlord, units, built, attachments } =
    req.body;
  if (!name || !address || !neighbourhood)
    return res
      .status(400)
      .json({ error: "name, address and neighbourhood are required" });

  const [result] = await pool.query(
    `INSERT INTO apartments (name, address, neighbourhood, landlord, units, built)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, address, neighbourhood, landlord ?? null, units ?? null, built ?? null]
  );

  await setAttachments("apartment_id", result.insertId, attachments);

  const [[apartment]] = await pool.query(
    `SELECT id, name, address, neighbourhood, landlord, units, verified,
            built AS yearBuilt
     FROM apartments WHERE id = ?`,
    [result.insertId]
  );
  const saved = await getAttachments("apartment_id", result.insertId);
  res.status(201).json({ ...apartment, attachments: saved });
});

// PUT /api/apartments/:id — update an apartment. The attachments list is
// fully replaced (deleted, then re-added) to keep it in sync. Protected.
router.put("/:id", auth, async (req, res) => {
  const { name, address, neighbourhood, landlord, units, built, attachments } =
    req.body;

  const [[apartment]] = await pool.query(
    "SELECT * FROM apartments WHERE id = ?",
    [req.params.id]
  );
  if (!apartment)
    return res.status(404).json({ error: "Apartment not found" });

  await pool.query(
    `UPDATE apartments
     SET name = ?, address = ?, neighbourhood = ?, landlord = ?, units = ?, built = ?
     WHERE id = ?`,
    [
      name ?? apartment.name,
      address ?? apartment.address,
      neighbourhood ?? apartment.neighbourhood,
      landlord ?? apartment.landlord,
      units ?? apartment.units,
      built ?? apartment.built,
      req.params.id,
    ]
  );

  // Replace the whole attachments set when the caller sends one.
  if (attachments !== undefined)
    await setAttachments("apartment_id", req.params.id, attachments);

  const [[updated]] = await pool.query(
    `SELECT id, name, address, neighbourhood, landlord, units, verified,
            built AS yearBuilt
     FROM apartments WHERE id = ?`,
    [req.params.id]
  );
  const saved = await getAttachments("apartment_id", req.params.id);
  res.json({ ...updated, attachments: saved });
});

// POST /api/apartments/:id/reviews — add a review with an optional attachments
// list ([{ url, type }]) in one request. Protected.
router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, body, attachments } = req.body;
  if (!rating || !body)
    return res.status(400).json({ error: "rating and body are required" });

  const [[apartment]] = await pool.query(
    "SELECT id FROM apartments WHERE id = ?",
    [req.params.id]
  );
  if (!apartment)
    return res.status(404).json({ error: "Apartment not found" });

  const [result] = await pool.query(
    `INSERT INTO reviews (apt_id, user_id, rating, body, created)
     VALUES (?, ?, ?, ?, CURDATE())`,
    [req.params.id, req.user.id, rating, body]
  );

  await setAttachments("review_id", result.insertId, attachments);

  const [[review]] = await pool.query(
    `SELECT r.id,
            r.apt_id   AS aptId,
            r.user_id  AS userId,
            r.rating,
            r.body,
            r.created  AS date,
            u.name     AS author,
            u.initials
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = ?`,
    [result.insertId]
  );
  const saved = await getAttachments("review_id", result.insertId);
  res.status(201).json({ ...review, attachments: saved });
});

export default router;
