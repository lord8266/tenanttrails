import { Router } from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { setAttachments, getAttachments } from "../attachments.js";

const router = Router();

// GET /api/reviews/:id — one review with its author and attachments.
router.get("/:id", async (req, res) => {
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
    [req.params.id]
  );
  if (!review) return res.status(404).json({ error: "Review not found" });

  const attachments = await getAttachments("review_id", req.params.id);
  res.json({ ...review, attachments });
});

// PUT /api/reviews/:id — update a review. The attachments list is fully
// replaced (deleted, then re-added) to keep it in sync. Protected, and only
// the review's own author may edit it (otherwise 403).
router.put("/:id", auth, async (req, res) => {
  const { rating, body, attachments } = req.body;

  const [[review]] = await pool.query(
    "SELECT * FROM reviews WHERE id = ?",
    [req.params.id]
  );
  if (!review) return res.status(404).json({ error: "Review not found" });
  if (review.user_id !== req.user.id)
    return res.status(403).json({ error: "Not your review" });

  await pool.query(
    "UPDATE reviews SET rating = ?, body = ? WHERE id = ?",
    [rating ?? review.rating, body ?? review.body, req.params.id]
  );

  if (attachments !== undefined)
    await setAttachments("review_id", req.params.id, attachments);

  const [[updated]] = await pool.query(
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
    [req.params.id]
  );
  const saved = await getAttachments("review_id", req.params.id);
  res.json({ ...updated, attachments: saved });
});

// DELETE /api/reviews/:id — remove a review (and its attachments). Protected,
// and only the review's own author may delete it.
router.delete("/:id", auth, async (req, res) => {
  const [[review]] = await pool.query(
    "SELECT user_id FROM reviews WHERE id = ?",
    [req.params.id]
  );
  if (!review) return res.status(404).json({ error: "Review not found" });
  if (review.user_id !== req.user.id)
    return res.status(403).json({ error: "Not your review" });

  await pool.query("DELETE FROM attachment WHERE review_id = ?", [
    req.params.id,
  ]);
  await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.id]);

  res.json({ ok: true });
});

export default router;
