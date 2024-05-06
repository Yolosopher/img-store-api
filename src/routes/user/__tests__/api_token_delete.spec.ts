import { server, setup, teardown } from "@/__tests__/global";
import hasThisError from "@/__tests__/hasThisError";
import { registerResponseSchema } from "@/lib/zod/user";
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
  api_token: "",
};

describe("api_token delete DELETE /user/api_token/:api_token", () => {
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

    try {
      const payloadName = "test2";
      const res = await supertest(server)
        .post("/user/api_token/create")
        .set("Authorization", `Bearer ${payload.auth_token}`)
        .send({ name: payloadName });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.name).toBe(payloadName);
      expect(res.body.message).toBe("Api token created successfully");
      payload.api_token = res.body.token;
    } catch (error) {
      console.log(error);
    }
  });

  it("should delete api token with that token in payload", async () => {
    const res = await supertest(server)
      .delete(`/user/api_token/${payload.api_token}`)
      .set("Authorization", `Bearer ${payload.auth_token}`);

    expect(res.status).toBe(200);
    expect(res.body.deleted_api_token).toBe(payload.api_token);
    expect(res.body.message).toBe("Api token deleted successfully");
  });

  it("should not delete api token without auth token", async () => {
    const res = await supertest(server).delete(
      `/user/api_token/${payload.api_token}`
    );

    expect(res.status).toBe(403);
    expect(hasThisError(res.body, "You must be logged in to have access")).toBe(
      true
    );
  });
});
