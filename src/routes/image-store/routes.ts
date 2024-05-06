import imageStoreController from "@/controllers/image-store";
import uploadMiddleware from "@/middlewares/file-upload";
import requireApiToken from "@/middlewares/requireApiToken";
import useApiToken from "@/middlewares/useApiToken";
import validateZod from "@/middlewares/zodvalidate.mw";
import { Router } from "express";
import asyncHandler from "express-async-handler";

const imageRoutes = Router();

imageRoutes.use(useApiToken);

imageRoutes.post(
  "/upload",
  requireApiToken,
  uploadMiddleware,
  asyncHandler(imageStoreController.uploadImage)
);
imageRoutes.delete(
  "/:name",
  requireApiToken,
  asyncHandler(imageStoreController.deleteImage)
);

imageRoutes.get(
  "/all",
  requireApiToken,
  asyncHandler(imageStoreController.getMyImages)
);
imageRoutes.get("/:name", asyncHandler(imageStoreController.getImage));

export default imageRoutes;