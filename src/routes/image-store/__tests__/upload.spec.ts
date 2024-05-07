import { server, setup, teardown } from "@/__tests__/global";
import hasThisError from "@/__tests__/hasThisError";
import CONFIG from "@/config";
import { registerResponseSchema } from "@/lib/zod/user";
import { ReadAccess } from "@/models/image-store/types";
import generateUID from "@/utils/generateUID";
import { rmSync } from "fs";
import path from "path";
import supertest from "supertest";

beforeAll(setup);
afterAll(teardown);

const random = generateUID();
const email = `nika${random}@gmail.com`;
const email2 = `nikaaaa${random}@gmail.com`;
const payload = {
  _id: "",
  email,
  full_name: "nika nishnianidze",
  password: "nikanika2",
  auth_token: "",
  api_token: "",
  public_image_name: "",
  private_image_name: "",
};
const payload2 = {
  _id: "",
  email: email2,
  full_name: "nika nishnianidze",
  password: "nikanika2",
  auth_token: "",
  api_token: "",
  public_image_name: "",
  private_image_name: "",
};
const testImagePrivatePath = path.resolve(__dirname, "test_private.png");

const testImagePublicPath = path.resolve(__dirname, "test_public.png");

const deleteTestUploadFolder = () => {
  rmSync(CONFIG.image_upload_path, { recursive: true, force: true });
};
describe("image store routes", () => {
  beforeAll(async () => {
    const createUser = async (pl: typeof payload) => {
      try {
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
      } catch (error) {
        console.log(error);
      }
    };
    await createUser(payload);
    await createUser(payload2);
    const createApiToken = async (
      name: string = "test",
      pl: typeof payload
    ) => {
      try {
        const payloadName = name;
        const res = await supertest(server)
          .post("/user/api_token/create")
          .set("Authorization", `Bearer ${pl.auth_token}`)
          .send({ name: payloadName });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.name).toBe(payloadName);
        expect(res.body.message).toBe("Api token created successfully");

        pl.api_token = res.body.token;
      } catch (error) {
        console.log(error);
      }
    };
    await createApiToken("token1", payload);
    await createApiToken("token2", payload2);
  });

  afterAll(async () => {
    deleteTestUploadFolder();
  });
  describe("upload image POST /image/upload", () => {
    it("should upload image as PUBLIC if correct auth token", async () => {
      const res = await supertest(server)
        .post(`/image/upload`)
        .set("Authorization", `Bearer ${payload.api_token}`)
        .field("access", "public")
        .attach("image", testImagePublicPath);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Image uploaded successfully");
      expect(res.body).toHaveProperty("image_name");

      payload.public_image_name = res.body.image_name;
    });
    it("should upload image as PUBLIC if correct auth token", async () => {
      const res = await supertest(server)
        .post(`/image/upload`)
        .set("Authorization", `Bearer ${payload2.api_token}`)
        .field("access", "public")
        .attach("image", testImagePublicPath);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Image uploaded successfully");
      expect(res.body).toHaveProperty("image_name");

      payload2.public_image_name = res.body.image_name;
    });
    it("should read PUBLIC image", async () => {
      const res = await supertest(server).get(
        `/image/${payload.public_image_name}`
      );
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/^image/);
    });
    it("should upload image as PRIVATE if correct auth token", async () => {
      const res = await supertest(server)
        .post(`/image/upload`)
        .set("Authorization", `Bearer ${payload.api_token}`)
        .field("access", "private")
        .attach("image", testImagePrivatePath);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Image uploaded successfully");
      expect(res.body).toHaveProperty("image_name");

      payload.private_image_name = res.body.image_name;
    });
    it("should upload image as PRIVATE if correct auth token for other user", async () => {
      const res = await supertest(server)
        .post(`/image/upload`)
        .set("Authorization", `Bearer ${payload2.api_token}`)
        .field("access", "private")
        .attach("image", testImagePrivatePath);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Image uploaded successfully");
      expect(res.body).toHaveProperty("image_name");

      payload2.private_image_name = res.body.image_name;
    });
    it("should read PRIVATE image with api_token", async () => {
      const res = await supertest(server)
        .get(`/image/${payload.public_image_name}`)
        .set("Authorization", `Bearer ${payload.api_token}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/^image/);
    });
    it("should throw error 403 when reading PRIVATE image without api_token", async () => {
      const res = await supertest(server).get(
        `/image/${payload.private_image_name}`
      );
      expect(res.status).toBe(403);
      expect(
        hasThisError(
          res.body,
          "You do not have permission to access this image"
        )
      ).toBe(true);
    });
    it("should throw error 404 when reading non-existing image", async () => {
      const res = await supertest(server).get(`/image/non-existing-image.png`);
      expect(res.status).toBe(404);
      expect(hasThisError(res.body, "Image not found")).toBe(true);
    });
    it("should throw error 400 when uploading image without access field", async () => {
      const res = await supertest(server)
        .post(`/image/upload`)
        .set("Authorization", `Bearer ${payload.api_token}`)
        .attach("image", testImagePublicPath);
      expect(res.status).toBe(400);
      expect(
        hasThisError(
          res.body,
          "The 'access' field is required and must be either private or public"
        )
      ).toBe(true);
    });
    it("should throw error 400 when uploading image with invalid access field", async () => {
      const res = await supertest(server)
        .post(`/image/upload`)
        .set("Authorization", `Bearer ${payload.api_token}`)
        .field("access", "invalid")
        .attach("image", testImagePublicPath);
      expect(res.status).toBe(400);
      expect(
        hasThisError(
          res.body,
          "The 'access' field is required and must be either private or public"
        )
      ).toBe(true);
    });
    it("should throw error 401 when uploading image without api_token", async () => {
      const res = await supertest(server)
        .post(`/image/upload`)
        .field("access", "public")
        .attach("image", testImagePublicPath);
      expect(res.status).toBe(403);
      expect(
        hasThisError(res.body, "You must be logged in to have access")
      ).toBe(true);
    });
  });
  describe("get my images GET /image/all", () => {
    it("should get all images with correct api_token", async () => {
      const res = await supertest(server)
        .get(`/image/all`)
        .set("Authorization", `Bearer ${payload.api_token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
    const findInArrayByAccess = (access: ReadAccess, arr: any[]) => {
      return !!arr.find((item) => item.access === access);
    };
    it("should get only PUBLIC images with correct api_token and ?access=public", async () => {
      const res = await supertest(server)
        .get(`/image/all?access=${ReadAccess.PUBLIC}`)
        .set("Authorization", `Bearer ${payload.api_token}`);

      expect(res.status).toBe(200);
      const found = findInArrayByAccess(ReadAccess.PUBLIC, res.body);
      expect(found).toBe(false);
    });
    it("should get only PRIVATE images with correct api_token and ?access=private", async () => {
      const res = await supertest(server)
        .get(`/image/all?access=${ReadAccess.PRIVATE}`)
        .set("Authorization", `Bearer ${payload.api_token}`);

      const found = findInArrayByAccess(ReadAccess.PUBLIC, res.body);
      expect(res.status).toBe(200);
      expect(found).toBe(false);
    });
  });
  describe("change image access PATCH /image/:name", () => {
    it("should throw 400 when trying to change to access which is already set", async () => {
      const res = await supertest(server)
        .patch(`/image/${payload.public_image_name}`)
        .set("Authorization", `Bearer ${payload.api_token}`)
        .send({ access: "public" });
      expect(res.status).toBe(400);
    });
    it("should change image access with correct api_token", async () => {
      const res = await supertest(server)
        .patch(`/image/${payload.private_image_name}`)
        .set("Authorization", `Bearer ${payload.api_token}`)
        .send({ access: "public" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Image access changed successfully");
      expect(res.body.image_name).toBe(payload.private_image_name);
      expect(res.body.new_access).toBe("public");
    });
    it("should throw error 403 when changing access of PRIVATE image without api_token", async () => {
      const res = await supertest(server)
        .patch(`/image/${payload.private_image_name}`)
        .send({ access: "private" });
      expect(res.status).toBe(403);
      expect(
        hasThisError(res.body, "You must be logged in to have access")
      ).toBe(true);
    });
  });
  describe("delete image DELETE /image/:name", () => {
    it("should delete image with correct api_token", async () => {
      const res = await supertest(server)
        .delete(`/image/${payload.public_image_name}`)
        .set("Authorization", `Bearer ${payload.api_token}`);
      expect(res.status).toBe(200);
      expect(res.body.deleted_image_name).toBe(payload.public_image_name);
    });
    it("should throw error 403 when deleting image without api_token", async () => {
      const res = await supertest(server).delete(
        `/image/${payload.public_image_name}`
      );
      expect(res.status).toBe(403);
      expect(
        hasThisError(res.body, "You must be logged in to have access")
      ).toBe(true);
    });
    it("should throw error 404 when deleting non-existing image", async () => {
      const res = await supertest(server)
        .delete(`/image/non-existing-image.png`)
        .set("Authorization", `Bearer ${payload.api_token}`);
      expect(res.status).toBe(404);
      expect(hasThisError(res.body, "Image not found")).toBe(true);
    });
    it("should throw error 403 when deleting PRIVATE image without api_token", async () => {
      const res = await supertest(server).delete(
        `/image/${payload.private_image_name}`
      );
      expect(res.status).toBe(403);
      expect(
        hasThisError(res.body, "You must be logged in to have access")
      ).toBe(true);
    });
    it("should throw error 403 when deleting PRIVATE image with different api_token", async () => {
      const res = await supertest(server)
        .delete(`/image/${payload.private_image_name}`)
        .set("Authorization", `Bearer ${payload2.api_token}`);
      expect(res.status).toBe(403);
      expect(
        hasThisError(
          res.body,
          "You do not have permission to delete this image"
        )
      ).toBe(true);
    });
    it("should throw error 404 when deleting PUBLIC image with different api_token", async () => {
      const res = await supertest(server)
        .delete(`/image/${payload.public_image_name}`)
        .set("Authorization", `Bearer ${payload2.api_token}`);
      expect(res.status).toBe(404);
      expect(hasThisError(res.body, "Image not found")).toBe(true);
    });
    it("should delete PRIVATE image with correct api_token", async () => {
      const res = await supertest(server)
        .delete(`/image/${payload.private_image_name}`)
        .set("Authorization", `Bearer ${payload.api_token}`);
      expect(res.status).toBe(200);
      expect(res.body.deleted_image_name).toBe(payload.private_image_name);
    });
    it("should delete PUBLIC image with correct api_token", async () => {
      const res = await supertest(server)
        .delete(`/image/${payload2.public_image_name}`)
        .set("Authorization", `Bearer ${payload2.api_token}`);
      expect(res.status).toBe(200);
      expect(res.body.deleted_image_name).toBe(payload2.public_image_name);
    });
  });
});
