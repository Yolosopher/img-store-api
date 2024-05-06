import { server, setup, teardown } from "@/__tests__/global";
import { loginResponseSchema } from "@/lib/zod/user";
import generateUID from "@/utils/generateUID";
import supertest from "supertest";

beforeAll(setup);
afterAll(teardown);

describe("Auth POST /login", () => {
  const random = generateUID();
  const payload = {
    email: `nika${random}@gmail.com`,
    full_name: "nika nishnianidze",
    password: "nikanika2",
    auth_token: "",
  };

  // create user and save login info
  beforeAll(async () => {
    await supertest(server).post("/auth/create").send(payload);
  });

  describe("login with valid credentials", () => {
    it("should return 200 success and res.body should satisfy loginResponseSchema", async () => {
      const res = await supertest(server)
        .post("/auth/login")
        .send({ email: payload.email, password: payload.password });

      expect(res.status).toBe(200);

      const zodResult = loginResponseSchema.safeParse(res.body); // if this
      if (zodResult.success) {
        payload.auth_token = res.body.current_user.auth_token;
      }
      expect(zodResult.success).toBeTruthy();
    });
  });

  describe("login with invalid email", () => {
    it("should return 401 unauthorized", async () => {
      await supertest(server)
        .post("/auth/login")
        .send({ email: "invalid@gmail.com", password: payload.password })
        .expect(401);
    });
  });

  describe("login with invalid password", () => {
    it("should return 401 unauthorized", async () => {
      await supertest(server)
        .post("/auth/login")
        .send({ email: payload.email, password: "invalid" })
        .expect(401);
    });
  });

  describe("login with missing email", () => {
    it("should return 400 bad request", async () => {
      await supertest(server)
        .post("/auth/login")
        .send({ password: payload.password })
        .expect(400);
    });
  });

  describe("login with missing password", () => {
    it("should return 400 bad request", async () => {
      await supertest(server)
        .post("/auth/login")
        .send({ email: payload.email })
        .expect(400);
    });
  });

  describe("login with missing email and password", () => {
    it("should return 400 bad request", async () => {
      await supertest(server).post("/auth/login").send({}).expect(400);
    });
  });

  describe("login with stupid email", () => {
    it("should return 400 bad request", async () => {
      await supertest(server)
        .post("/auth/login")
        .send({ email: "invalid", password: payload.password })
        .expect(400);
    });
  });
});
