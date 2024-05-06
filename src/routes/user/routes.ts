import userController from "@/controllers/user";
import { Router } from "express";
import requireAuth from "@/middlewares/requireauth.mw";
import validateZod from "@/middlewares/zodvalidate.mw";
import {
  createApiTokenSchema,
  updateFullnameSchema,
  updatePasswordSchema,
} from "@/lib/zod/user";
import asyncHandler from "@/middlewares/asyncHandler";

const userRoutes = Router();

userRoutes.delete("/delete", requireAuth, asyncHandler(userController.delete));
userRoutes.put(
  "/update/full_name",
  requireAuth,
  validateZod(updateFullnameSchema, "body"),
  asyncHandler(userController.changeFullName)
);

userRoutes.put(
  "/update/password",
  requireAuth,
  validateZod(updatePasswordSchema, "body"),
  asyncHandler(userController.changePassword)
);

userRoutes.post(
  "/api_token/create",
  requireAuth,
  validateZod(createApiTokenSchema, "body"),
  asyncHandler(userController.createApiToken)
);
userRoutes.delete(
  "/api_token/all",
  requireAuth,
  asyncHandler(userController.deleteAllApiTokens)
);
userRoutes.delete(
  "/api_token/:token",
  requireAuth,
  asyncHandler(userController.deleteApiToken)
);

export default userRoutes;
