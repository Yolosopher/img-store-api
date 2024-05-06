import z from "zod";
import { emailSchema, fullnameSchema, passwordSchema } from ".";
import { Role } from "@/global";

export const userCreateSchema = z.object({
  email: emailSchema,
  full_name: fullnameSchema,
  password: passwordSchema,
});

export const updateFullnameSchema = z.object({
  full_name: fullnameSchema,
});

export const updatePasswordSchema = z.object({
  password: z.string({
    message: "old password is required",
  }),
  new_password: passwordSchema,
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const userDeleteSchema = z.object({
  user_id: z.string().min(3),
});

const currentUserInResponseSchema = z.object({
  _id: z.string(),
  email: emailSchema,
  full_name: fullnameSchema,
  role: z.nativeEnum(Role),
  auth_token: z.string(),
});

export const loginResponseSchema = z.object({
  message: z.literal("Login successful"),
  current_user: currentUserInResponseSchema,
});
export const registerResponseSchema = z.object({
  message: z.literal("Sign up successful"),
  current_user: currentUserInResponseSchema,
});

export const createApiTokenSchema = z.object({
  name: z
    .string({
      message: "Token name must be a string",
    })
    .optional(),
});
