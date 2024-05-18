import { z } from "zod";

export const usernameSchema = z
  .string({ required_error: "Username is required." })
  .min(3, {
    message: "Username must be at least 3 characters.",
  })
  .max(30, { message: "Username cannot exceed 30 characters." })
  .refine((s) => !s.includes(" "), "Username cannot have spaces.")
  .refine((s) => !s.startsWith(".") && !s.endsWith("."), "Contains misplaced special characters.")
  .refine(
    (s) => /^[a-zA-Z_\d]([a-zA-Z\d_]*\.?[a-zA-Z\d_]+)*$/.test(s),
    `Invalid special characters.\n\nUnderscores and dots are valid.`,
  );

export const passwordSchema = z
  .string({ required_error: "Password is required." })
  .min(8, { message: "Password must be at least 8 characters." })
  .max(30, { message: "Password cannot execeed 30 characters long." });

export const passwordSignUpSchema = z
  .string({ required_error: "Password is required." })
  .min(8, { message: "Password must be at least 8 characters." })
  .max(30, { message: "Password cannot execeed 30 characters long." })
  .refine((s) => /[0-9]/.test(s), "Password must contain a number.")
  .refine((s) => /[a-z]/.test(s), "Password must contain an lowercase letter.")
  .refine((s) => /[A-Z]/.test(s), "Password must contain an uppercase letter.");

export const nanoTokenSchema = z.string().refine((s) => !s.includes(" "), "Invalid token.");

export const temporalTokenSchema = z
  .string()
  .length(32, { message: "Invalid token." })
  .refine((s) => !s.includes(" "), "Invalid token.");

export const emailSchema = z.object({
  email: z.string({ required_error: "Email is required." }).email(),
});
