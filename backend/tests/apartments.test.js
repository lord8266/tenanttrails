import request from "supertest";
import { describe, it, expect, afterAll } from "vitest";
import app from "../app.js";
import { pool } from "../db.js";

describe("TenantTrails API", () => {
  const email = `test_${Date.now()}@example.com`;
  const password = "secret123";

  let token;
  let aptId;
  let reviewId;

  // A valid 1x1 PNG for the upload test.
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
    "base64"
  );

  it("Signup", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Vishwa Pravin", email, password });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("Login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("ListApartments", async () => {
    const res = await request(app).get("/api/apartments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("CreateApartment", async () => {
    const res = await request(app)
      .post("/api/apartments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Apt",
        address: "123 Main St",
        neighbourhood: "Downtown",
        landlord: "ACME Properties",
        units: 24,
        built: 2018,
        attachments: [
          { url: "https://res.cloudinary.com/dcueyjhlz/image/upload/sample.jpg", type: "image/jpeg" },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.attachments).toHaveLength(1);
    aptId = res.body.id;
  });

  it("GetSingleApartment", async () => {
    const res = await request(app).get(`/api/apartments/${aptId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(aptId);
    expect(Array.isArray(res.body.reviews)).toBe(true);
  });

  it("CreateReview", async () => {
    const res = await request(app)
      .post(`/api/apartments/${aptId}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 5,
        body: "Great place, responsive landlord.",
        attachments: [
          { url: "https://res.cloudinary.com/dcueyjhlz/image/upload/sample.jpg", type: "image/jpeg" },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.attachments).toHaveLength(1);
    reviewId = res.body.id;
  });

  it.skipIf(!process.env.CLOUDINARY_CLOUD_NAME)("upload", async () => {
    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", pngBuffer, "test.png");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("url");
  });

  afterAll(async () => {
    if (reviewId) {
      await pool.query("DELETE FROM attachment WHERE review_id = ?", [reviewId]);
      await pool.query("DELETE FROM reviews WHERE id = ?", [reviewId]);
    }
    // Deleting the apartment cascades its attachment rows.
    if (aptId) await pool.query("DELETE FROM apartments WHERE id = ?", [aptId]);
    await pool.query("DELETE FROM users WHERE email = ?", [email]);
    await pool.end();
  });
});
