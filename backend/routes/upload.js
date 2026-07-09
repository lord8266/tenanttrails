import { Router } from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import cloudinary from "../cloudinary.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload — the frontend uploads a single file here first. The file
// is streamed to the CDN and we return the URL + type. The frontend then
// includes that { url, type } in the attachments array when creating or
// updating an apartment or review.
router.post("/", auth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const result = await new Promise((ok, no) =>
      cloudinary.uploader
        .upload_stream(
          { folder: "tenanttrails", resource_type: "auto" },
          (e, r) => (e ? no(e) : ok(r))
        )
        .end(req.file.buffer)
    );

    res.json({
      url: result.secure_url,
      type: req.file.mimetype, // e.g. "image/jpeg", "application/pdf"
    });
  } catch {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
