import request from "supertest";
import app from "../src/backend/server.js";

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: `test-${Date.now()}@example.com`,
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.name).toBe("Test User");
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 409 for duplicate email", async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // Registrar primera vez
      await request(app).post("/api/auth/register").send({
        name: "User 1",
        email,
        password: "password123",
      });

      // Intentar registrar de nuevo
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "User 2",
          email,
          password: "password456",
        })
        .expect(409);

      expect(response.body.error).toContain("ya está registrado");
    });
  });

  describe("POST /api/auth/login", () => {
    let testUser;

    beforeAll(async () => {
      const email = `login-test-${Date.now()}@example.com`;
      const response = await request(app).post("/api/auth/register").send({
        name: "Login Test",
        email,
        password: "password123",
      });
      testUser = { email, password: "password123", ...response.body.user };
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("should return 400 for invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(400);

      expect(response.body.error).toContain("inválidas");
    });
  });

  describe("POST /api/auth/refresh", () => {
    let refreshToken;

    beforeAll(async () => {
      const email = `refresh-test-${Date.now()}@example.com`;
      const response = await request(app).post("/api/auth/register").send({
        name: "Refresh Test",
        email,
        password: "password123",
      });
      refreshToken = response.body.refreshToken;
    });

    it("should refresh token with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.refreshToken).not.toBe(refreshToken); // Debe ser nuevo
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401);

      expect(response.body.error).toContain("inválido");
    });
  });
});
