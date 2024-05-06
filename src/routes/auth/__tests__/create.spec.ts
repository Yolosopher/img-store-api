import { server, setup, teardown } from "@/__tests__/global";
import generateUID from "@/utils/generateUID";
import supertest from "supertest";

beforeAll(setup);
afterAll(teardown);

describe("Auth POST /create", () => {
  const random = generateUID();
  const email = `nika${random}@gmail.com`;
  describe("create with unique email", () => {
    it("should return 201 success", async () => {
      const payload = {
        email,
        full_name: "nika nishnianidze",
        password: "nikanika2",
      };
      await supertest(server).post("/auth/create").send(payload).expect(201);
    });
  });

  describe("create with the same email", () => {
    it("should return 409 duplicate", async () => {
      const payload = {
        email,
        full_name: "nika nishnianidze",
        password: "123213123fad",
      };
      await supertest(server).post("/auth/create").send(payload).expect(409);
    });
  });

  describe("create with missing email", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        full_name: "nika nishnianidze",
        password: "123213fadsf",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with missing full_name", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email,
        password: "123213",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with missing password", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email,
        full_name: "nika nishnianidze",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with invalid email", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email: "nika",
        full_name: "nika nishnianidze",
        password: "123213",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with invalid full_name", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email,
        full_name: "nika",
        password: "123213",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with longer than 50chars password", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email,
        full_name: "nika nishnianidze",
        password: "123456789012345678901234567890123456789012345678901",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with shorter than 6chars password", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email,
        full_name: "nika nishnianidze",
        password: "123",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with non-latin characters in password", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email,
        full_name: "nika nishnianidze",
        password: "ნიკა",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });

  describe("create with non-latin characters in full_name", () => {
    it("should return 400 bad request", async () => {
      const payload = {
        email,
        full_name: "ნიკა",
        password: "123213",
      };
      await supertest(server).post("/auth/create").send(payload).expect(400);
    });
  });
});
