import { server, setup, teardown } from "@/__tests__/global";
import CONFIG from "@/config";
import { loginResponseSchema, registerResponseSchema } from "@/lib/zod/user";
import userService from "@/services/user";
import delayer from "@/utils/delayer";
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
const random2 = generateUID();
const email2 = `nika${random2}@gmail.com`;
const payload2 = {
  _id: "",
  email: email2,
  full_name: "nika nishnianidze",
  password: "nikanika2",
  auth_token: "",
};

describe("Super and super Admin routes", () => {
  // create user and save login info
  beforeAll(async () => {
    try {
      const createUser = async (pl: any) => {
        // create user
        const res = await supertest(server).post("/auth/create").send(pl);

        // save auth_token
        const zodResult = registerResponseSchema.safeParse(res.body); // if this
        if (zodResult.success) {
          pl.auth_token = res.body.current_user.auth_token;
          pl._id = res.body.current_user._id;
        } else {
          throw new Error("registerResponseSchema failed");
        }
      };
      await createUser(payload);
      await createUser(payload2);
    } catch (error) {
      console.log(error);
    }
  });

  it("auth_token should be accessible", () => {
    expect(payload.auth_token.length).toBeGreaterThan(0);
  });

  let super_admin_auth_token = "";
  let admin_auth_token = "";

  const admin_payload = {
    email: "just-admin@gmail.com",
    password: "justadmin",
  };
  describe("Super Admin GET /grant-admin/:target_id", () => {
    beforeAll(async () => {
      await userService.initializeSuperAdmin();
      await userService.initializeAdmin(admin_payload);
      const super_admin_login_payload = {
        email: CONFIG.default_super_admin.email,
        password: CONFIG.default_super_admin.password,
      };
      const res = await supertest(server)
        .post("/auth/login")
        .send(super_admin_login_payload);

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

    describe("if user_id is not preset", () => {
      it("should return 404", async () => {
        const res = await supertest(server)
          .get(`/admin/grant-admin`)
          .set("Authorization", `Bearer ${super_admin_auth_token}`);
        expect(res.status).toBe(404);
      });
    });
    describe("if user_id is incorrect", () => {
      it("should return 400", async () => {
        const res = await supertest(server)
          .get(`/admin/grant-admin/fasdfasdf`)
          .set("Authorization", `Bearer ${super_admin_auth_token}`);
        expect(res.status).toBe(400);
      });
    });
    describe("if user which is not admin yet", () => {
      it("should return 200", async () => {
        const res = await supertest(server)
          .get(`/admin/grant-admin/${payload._id}`)
          .set("Authorization", `Bearer ${super_admin_auth_token}`);
        expect(res.status).toBe(200);
      });
    });
    describe("if user which is not admin yet and user_id: emailType", () => {
      it("should return 200", async () => {
        const res = await supertest(server)
          .get(`/admin/grant-admin/${payload2.email}`)
          .set("Authorization", `Bearer ${super_admin_auth_token}`);
        expect(res.status).toBe(200);
      });
    });
    describe("if user which is not admin yet && initiator is just admin", () => {
      it("should return 403", async () => {
        const res = await supertest(server)
          .get(`/admin/grant-admin/${payload._id}`)
          .set("Authorization", `Bearer ${admin_auth_token}`);
        expect(res.status).toBe(403);
      });
    });
    describe("if user which is not admin yet and user_id: emailType && initiator is just admin", () => {
      it("should return 403", async () => {
        const res = await supertest(server)
          .get(`/admin/grant-admin/${payload2.email}`)
          .set("Authorization", `Bearer ${admin_auth_token}`);
        expect(res.status).toBe(403);
      });
    });
    describe("if user which is already admin", () => {
      it("should return 400", async () => {
        await delayer(1000, async () => {
          const res = await supertest(server)
            .get(`/admin/grant-admin/${payload._id}`)
            .set("Authorization", `Bearer ${super_admin_auth_token}`);
          expect(res.status).toBe(400);
        });
      });
    });
    describe("if user is super admin", () => {
      it("should return 400", async () => {
        const res = await supertest(server)
          .get(`/admin/grant-admin/${payload._id}`)
          .set("Authorization", `Bearer ${super_admin_auth_token}`);
        expect(res.status).toBe(400);
      });
    });
  });
  describe("Admin GET /", () => {
    it("should return 403 if no auth_token", async () => {
      const res = await supertest(server).get("/admin");
      expect(res.status).toBe(403);
    });
    it("should return 401 if invalid auth_token", async () => {
      const res = await supertest(server)
        .get("/admin")
        .set("Authorization", "Bearer invalid_token");
      expect(res.status).toBe(401);
    });
    it("should return 403 if not admin", async () => {
      const res = await supertest(server)
        .get("/admin")
        .set("Authorization", `Bearer ${payload.auth_token}`);
      expect(res.status).toBe(403);
    });

    it("should return 200 if valid super admin auth_token", async () => {
      const res = await supertest(server)
        .get("/admin")
        .set("Authorization", `Bearer ${super_admin_auth_token}`);
      expect(res.status).toBe(200);
    });

    it("should return 200 if valid admin auth_token", async () => {
      const res = await supertest(server)
        .get("/admin")
        .set("Authorization", `Bearer ${admin_auth_token}`);
      expect(res.status).toBe(200);
    });
  });
});
