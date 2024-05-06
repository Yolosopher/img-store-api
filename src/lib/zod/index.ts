import z from "zod";

export const stringNoDigitsSchema = (requiredMsg?: string) =>
  z
    .string({
      message: requiredMsg || "The field is required",
    }) // Ensure the input is a string
    .regex(/^[^0-9]*$/, { message: "String cannot contain digits" }); // Ensure the string contains no digits

export const onlyLatinSchema = (zz: z.ZodString) =>
  //"Letters should only be Latin characters",
  zz.regex(/^[a-zA-Z0-9\s\S]*$/, {
    message: "Letters should only be Latin characters",
  });

export const emailSchema = z
  .string({
    message: "Email is required",
  })
  .email({
    message: "Invalid email address",
  });

export const fullnameSchema = onlyLatinSchema(
  stringNoDigitsSchema("Full name is required")
    .min(5, {
      message: "At least 5 characters",
    })
    .max(255, {
      message: "Too long",
    })
);

export const passwordSchema = onlyLatinSchema(
  z
    .string({
      message: "Password is required",
    })
    .min(6, {
      message: "At least 6 characters",
    })
    .max(50, {
      message: "Too long",
    })
);
