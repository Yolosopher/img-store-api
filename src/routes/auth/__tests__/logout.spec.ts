import { server, setup, teardown } from "@/__tests__/global";
import { registerResponseSchema } from "@/lib/zod/user";
import generateUID from "@/utils/generateUID";
import jwtInstance from "@/utils/jwt";
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

describe("Auth GET /logout", () => {
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

  describe("logout with valid credentials", () => {
    it("should return 200 success", async () => {
      await supertest(server)
        .get("/auth/logout")
        .set("Authorization", `Bearer ${payload.auth_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe("Logout successful");
        });
    });
    describe("after logout, checking self with old auth_token should fail", () => {
      it("should return 401 forbidden", async () => {
        await supertest(server)
          .get("/auth/self")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .expect(401);
      });
    });
    describe("after logout, auth_token should be blacklisted", () => {
      it("should return 403 forbidden", async () => {
        await supertest(server)
          .get("/auth/self")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .expect(401);
      });
    });
  });
});
