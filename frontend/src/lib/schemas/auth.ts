import { z } from "zod";
import { passwordSchema, passwordSignUpSchema, usernameSchema } from ".";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters.",
    })
    .email()
    .or(usernameSchema),
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    username: usernameSchema,
    email: z.string({ required_error: "Email is required." }).email(),
    password: passwordSignUpSchema,
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const inputOTPSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSignUpSchema,
    confirmNewPassword: passwordSignUpSchema,
  })
  .refine(({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });
