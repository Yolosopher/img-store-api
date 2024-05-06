import { server, setup, teardown } from "@/__tests__/global";
import CONFIG from "@/config";
import { loginResponseSchema, registerResponseSchema } from "@/lib/zod/user";
import userService from "@/services/user";
import generateUID from "@/utils/generateUID";
import supertest from "supertest";

beforeAll(setup);
afterAll(teardown);

const random = generateUID();
const email = `nika${random}@gmail.com`;
const payload = {
  _id: "",
  email,
  full_name: "nika nishnianidze",
  password: "nikanika2",
  auth_token: "",
};

describe("Middlewares", () => {
  // create user and save login info
  beforeAll(async () => {
    try {
      // create user
      const res = await supertest(server).post("/auth/create").send(payload);

      // save auth_token
      const zodResult = registerResponseSchema.safeParse(res.body); // if this
      if (zodResult.success) {
        payload.auth_token = res.body.current_user.auth_token;
        payload._id = res.body.current_user._id;
      } else {
        throw new Error("registerResponseSchema failed");
      }
    } catch (error) {
      console.log(error);
    }
  });

  it("auth_token should be accessible", () => {
    expect(payload.auth_token.length).toBeGreaterThan(0);
  });

  describe("auth middleware", () => {
    it("should return 403 if no auth_token", async () => {
      const res = await supertest(server).get("/auth/self");
      expect(res.status).toBe(403);
    });

    it("should return 401 if invalid auth_token", async () => {
      const res = await supertest(server)
        .get("/auth/self")
        .set("Authorization", "Bearer invalid_token");
      expect(res.status).toBe(401);
    });

    it("should return 200 if valid auth_token", async () => {
      const res = await supertest(server)
        .get("/auth/self")
        .set("Authorization", `Bearer ${payload.auth_token}`);
      expect(res.status).toBe(200);
    });
  });

  describe("admin middleware", () => {
    let super_admin_auth_token = "";
    let admin_auth_token = "";

    const admin_payload = {
      email: "just-admin@gmail.com",
      password: "justadmin",
    };

    beforeAll(async () => {
      await userService.initializeSuperAdmin();
      await userService.initializeAdmin(admin_payload);
      const admin_login_payload = {
        email: CONFIG.default_super_admin.email,
        password: CONFIG.default_super_admin.password,
      };
      const res = await supertest(server)
        .post("/auth/login")
        .send(admin_login_payload);

      const zodResult = loginResponseSchema.safeParse(res.body);
      if (zodResult.success) {
        super_admin_auth_token = res.body.current_user.auth_token;
      } else {
        throw new Error("loginResponseSchema failed in superadmin");
      }

      const admin_res = await supertest(server)
        .post("/auth/login")
        .send(admin_payload);
      const admin_zodResult = loginResponseSchema.safeParse(admin_res.body);

      if (admin_zodResult.success) {
        admin_auth_token = admin_res.body.current_user.auth_token;
      } else {
        throw new Error("loginResponseSchema failed");
      }
    });

    it("should return 403 if no auth_token", async () => {
      const res = await supertest(server).get("/admin/test");
      expect(res.status).toBe(403);
    });
    it("should return 401 if invalid auth_token", async () => {
      const res = await supertest(server)
        .get("/admin/test")
        .set("Authorization", "Bearer invalid_token");
      expect(res.status).toBe(401);
    });
    it("should return 403 if not admin", async () => {
      const res = await supertest(server)
        .get("/admin/test")
        .set("Authorization", `Bearer ${payload.auth_token}`);
      expect(res.status).toBe(403);
    });

    it("should return 200 if valid admin auth_token", async () => {
      const res = await supertest(server)
        .get("/admin/test")
        .set("Authorization", `Bearer ${admin_auth_token}`);
      expect(res.status).toBe(200);
    });
    it("should return 200 if valid super admin auth_token", async () => {
      const res = await supertest(server)
        .get("/admin/test")
        .set("Authorization", `Bearer ${super_admin_auth_token}`);
      expect(res.status).toBe(200);
    });

    describe("super admin middleware", () => {
      it("should return 403 if no auth_token", async () => {
        const res = await supertest(server).get("/admin/super/test");
        expect(res.status).toBe(403);
      });
    });
  });
});
