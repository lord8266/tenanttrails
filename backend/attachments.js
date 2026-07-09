import { pool } from "./db.js";

// A single `attachment` table holds both apartment and review attachments,
// discriminated by which foreign key is set: apartment_id or review_id.
//
// fkCol: "apartment_id" | "review_id"

// Replace the full set of attachments for a parent row: delete every existing
// attachment, then insert the provided list. Keeps the list in sync on every
// create/update. `attachments` is an array of { url, type }.
export async function setAttachments(fkCol, parentId, attachments = []) {
  await pool.query(`DELETE FROM attachment WHERE ${fkCol} = ?`, [parentId]);

  for (const att of attachments) {
    if (!att || !att.url) continue; // skip malformed entries
    await pool.query(
      `INSERT INTO attachment (${fkCol}, url, type, created) VALUES (?, ?, ?, CURDATE())`,
      [parentId, att.url, att.type || "file"]
    );
  }
}

export async function getAttachments(fkCol, parentId) {
  const [rows] = await pool.query(
    `SELECT id, ${fkCol}, url, type, created FROM attachment WHERE ${fkCol} = ?`,
    [parentId]
  );
  return rows;
}
