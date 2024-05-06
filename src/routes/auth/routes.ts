import userController from "@/controllers/user";
import { userCreateSchema, userLoginSchema } from "@lib/zod/user";
import { Router } from "express";
import validateZod from "@/middlewares/zodvalidate.mw";
import requireAuth from "@/middlewares/requireauth.mw";
import asyncHandler from "@/middlewares/asyncHandler";

const authRoutes = Router();

authRoutes.post(
  "/create",
  validateZod(userCreateSchema, "body"),
  asyncHandler(userController.create)
);
authRoutes.post(
  "/login",
  validateZod(userLoginSchema, "body"),
  asyncHandler(userController.login)
);
authRoutes.get("/logout", requireAuth, asyncHandler(userController.logout));
authRoutes.get("/self", requireAuth, asyncHandler(userController.self));

export default authRoutes;
