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

describe("User change info", () => {
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

  describe("change username PUT /update/full_name", () => {
    describe("with valid credentials and valid payload", () => {
      it("should return 204 success", async () => {
        const res = await supertest(server)
          .put("/user/update/full_name")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .send({ full_name: "nika nishnianidze" });

        expect(res.status).toBe(204);
      });
    });
    describe("with invalid credentials and valid payload", () => {
      it("should return 401 unauthorized", async () => {
        await supertest(server)
          .put("/user/update/full_name")
          .set("Authorization", `Bearer ${payload.auth_token}1`)
          .send({ full_name: "nika nishnianidze" })
          .expect(401);
      });
    });
    describe("with empty credentials and valid payload", () => {
      it("should return 403 unauthorized", async () => {
        await supertest(server)
          .put("/user/update/full_name")
          .send({ full_name: "nika nishnianidze" })
          .expect(403);
      });
    });
    describe("with valid credentials and empty payload", () => {
      it("should return 400 bad request", async () => {
        await supertest(server)
          .put("/user/update/full_name")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .send({ full_name: "" })
          .expect(400);
      });
    });
    describe("with valid credentials and no payload", () => {
      it("should return 400 bad request", async () => {
        await supertest(server)
          .put("/user/update/full_name")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .expect(400);
      });
    });
  });

  describe("change password PUT /update-password", () => {
    const new_password = "nikanika3";

    describe("with invalid credentials and valid payload", () => {
      it("should return 401 unauthorized", async () => {
        await supertest(server)
          .put("/user/update/password")
          .set("Authorization", `Bearer ${payload.auth_token}1`)
          .send({
            password: payload.password,
            new_password,
          })
          .expect(401);
      });
    });
    describe("with empty credentials and valid payload", () => {
      it("should return 403 unauthorized", async () => {
        await supertest(server)
          .put("/user/update/password")
          .send({
            password: payload.password,
            new_password,
          })
          .expect(403);
      });
    });
    describe("with valid credentials and empty payload", () => {
      it("should return 400 bad request", async () => {
        await supertest(server)
          .put("/user/update/password")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .expect(400);
      });
    });
    describe("with valid credentials and no payload", () => {
      it("should return 400 bad request", async () => {
        await supertest(server)
          .put("/user/update/password")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .expect(400);
      });
    });
    describe("with valid credentials and no old_password", () => {
      it("should return 400 Bad Request", async () => {
        await supertest(server)
          .put("/user/update/password")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .send({
            new_password,
          })
          .expect(400);
      });
    });
    describe("with valid credentials and no new password", () => {
      it("should return 400 unathorized", async () => {
        await supertest(server)
          .put("/user/update/password")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .send({
            password: payload.password,
          })
          .expect(400);
      });
    });
    describe("with valid credentials and invalid old password", () => {
      it("should return 401 unathorized", async () => {
        await supertest(server)
          .put("/user/update/password")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .send({
            password: "invalid",
            new_password,
          })
          .expect(401);
      });
    });
    describe("with valid credentials and valid payload", () => {
      it("should return 200 success and new auth_token", async () => {
        const res = await supertest(server)
          .put("/user/update/password")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .send({
            password: payload.password,
            new_password,
          });

        expect(res.status).toBe(200);

        // await delayer(2000, async () => {
        //   const new_auth_token = res.body.auth_token;
        //   const res2 = await supertest(server)
        //     .get("/auth/self")
        //     .set("Authorization", `Bearer ${new_auth_token}`);

        //   expect(res2.status).toBe(200);
        // });
      });
      it("shouldn't be able to authorize with old auth_token", async () => {
        await delayer(1000, async () => {
          await supertest(server)
            .get("/auth/self")
            .set("Authorization", `Bearer ${payload.auth_token}`)
            .expect(401);
        });
      });
      it("should be able to login with new password and return 200", async () => {
        await delayer(2000, async () => {
          await supertest(server)
            .post("/auth/login")
            .send({ email: payload.email, password: new_password })
            .expect(200);
        });
      });
    });
  });
});
