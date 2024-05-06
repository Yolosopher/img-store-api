import { server, setup, teardown } from "@/__tests__/global";
import { loginResponseSchema, registerResponseSchema } from "@/lib/zod/user";
import userService from "@/services/user";
import generateUID from "@/utils/generateUID";
import delayer from "@/utils/delayer";
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

describe("User DELETE /delete", () => {
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

  describe("delete with valid credentials", () => {
    it("should return 200 success", async () => {
      await supertest(server)
        .delete("/user/delete")
        .set("Authorization", `Bearer ${payload.auth_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe("User deleted successfully");
        });
    });
    describe("after deletion, checking user from db should return deleted=true", () => {
      it("foundUser.deleted should be true", async () => {
        const foundUser = await userService.getOne(payload._id.toString());

        expect(foundUser).toBeTruthy();
        expect(foundUser!.deleted).toBe(true);
      });
    });
    describe("after deletion, checking self with old auth_token should fail", () => {
      it("should return 401 forbidden", async () => {
        await supertest(server)
          .get("/auth/self")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .expect(401);
      });
    });
  });

  describe("delete with invalid auth_token", () => {
    it("should return 401 forbidden", async () => {
      await supertest(server)
        .delete("/user/delete")
        .set("Authorization", `Bearer invalid_token`)
        .expect(401);
    });
  });

  describe("delete with missing auth_token", () => {
    it("should return 403 forbidden", async () => {
      await supertest(server).delete("/user/delete").expect(403);
    });
  });

  describe("after deletion, login should be success and should restore the account", () => {
    let inner_auth_token = "";
    it("login should return 200 success", async () => {
      await delayer(1000, async () => {
        const res = await supertest(server)
          .post("/auth/login")
          .send({ email, password: payload.password });

        const zodResult = loginResponseSchema.safeParse(res.body); // if this
        // expect(zodResult.success).toBe(true);
        if (zodResult.success) {
          inner_auth_token = res.body.current_user.auth_token;
        }
      });
    });
    it("checking self after login should return deleted=false", async () => {
      const res = await supertest(server)
        .get("/auth/self")
        .set("Authorization", `Bearer ${inner_auth_token}`);

      expect(res.status).toBe(200);

      expect(res.body.user.deleted).toBe(false);
    });
  });
});
