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
  api_tokens: [],
};

describe("delete all api_tokens DELETE /user/api_token/all", () => {
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

    const createApiToken = async (name: string = "test") => {
      try {
        const payloadName = name;
        const res = await supertest(server)
          .post("/user/api_token/create")
          .set("Authorization", `Bearer ${payload.auth_token}`)
          .send({ name: payloadName });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.name).toBe(payloadName);
        expect(res.body.message).toBe("Api token created successfully");
      } catch (error) {
        console.log(error);
      }
    };
    await createApiToken("token1");
    await createApiToken("token2");
    await createApiToken("token3");
  });

  it("should get 3 api tokens for this user", async () => {
    const res = await supertest(server)
      .get(`/auth/self`)
      .set("Authorization", `Bearer ${payload.auth_token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.api_tokens.length).toBe(3);

    payload.api_tokens = res.body.user.api_tokens.map((a: any) => a.token);
  });
  it("should throw 403 error if no auth token", async () => {
    const res = await supertest(server).delete(`/user/api_token/all`);

    expect(res.status).toBe(403);
    expect(hasThisError(res.body, "You must be logged in to have access")).toBe(
      true
    );
  });
  it("should delete all api tokens for this user", async () => {
    const res = await supertest(server)
      .delete(`/user/api_token/all`)
      .set("Authorization", `Bearer ${payload.auth_token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("All api tokens deleted successfully");
  });
  it("should return 0 api tokens after deletion", async () => {
    const res = await supertest(server)
      .get(`/auth/self`)
      .set("Authorization", `Bearer ${payload.auth_token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.api_tokens.length).toBe(0);
  });
});
