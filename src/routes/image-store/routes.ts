import imageStoreController from "@/controllers/image-store";
import asyncHandler from "@/middlewares/asyncHandler";
import uploadMiddleware from "@/middlewares/file-upload";
import requireApiToken from "@/middlewares/requireApiToken";
import useApiToken from "@/middlewares/useApiToken";
import { Router } from "express";

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
imageRoutes.patch(
  "/:name",
  requireApiToken,
  asyncHandler(imageStoreController.changeImageAccess)
);

imageRoutes.get(
  "/all",
  requireApiToken,
  asyncHandler(imageStoreController.getMyImages)
);
imageRoutes.get("/:name", asyncHandler(imageStoreController.getImage));

export default imageRoutes;
