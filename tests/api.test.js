const request = require("supertest");
const app = require("../src/app");

describe("EVE Healthcare API", () => {
  test("GET /health should return database connected", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(response.body.database).toBe("connected");
  });

  test("GET /api/bookings without token should return 401", async () => {
    const response = await request(app).get("/api/bookings");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("GET invalid booking ID should return 400", async () => {
    const response = await request(app)
      .get("/api/bookings/abc")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
  });
});

afterAll(async () => {
  const prisma = require("../src/config/database");
  await prisma.$disconnect();
});