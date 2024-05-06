import supertest from "supertest";
import { server, setup, teardown } from "./global";

beforeAll(setup);
afterAll(teardown);

describe("Healthcheck", () => {
  it("should return 200", async () => {
    await supertest(server).get("/healthcheck").expect(200);
  });
});
