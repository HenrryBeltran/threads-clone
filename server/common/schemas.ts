import { z } from "zod";

const username = z
  .string({ required_error: "Username is required." })
  .min(3, {
    message: "Username must be at least 3 characters.",
  })
  .max(30, { message: "Username cannot exceed 30 characters." })
  .refine((s) => !s.includes(" "), "Username cannot have spaces.")
  .refine(
    (s) => !s.startsWith(".") && !s.endsWith("."),
    "Contains misplaced special characters.",
  )
  .refine(
    (s) => /^[a-zA-Z_\d]([a-zA-Z\d_]*\.?[a-zA-Z\d_]+)*$/.test(s),
    `Invalid special characters.\n\nUnderscores and dots are valid.`,
  );

const password = z
  .string({ required_error: "Password is required." })
  .min(8, { message: "Password must be at least 8 characters." })
  .max(30, { message: "Password cannot execeed 30 characters long." });

const nanoToken = z.string().refine((s) => !s.includes(" "), "Invalid token.");

export const loginSchema = z.object({
  username: z.string().email().or(username),
  password,
});

export const signUpSchema = z
  .object({
    username,
    email: z.string({ required_error: "Email is required." }).email(),
    password,
    confirmPassword: password,
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const nanoTokenSchema = nanoToken;

export const inputOTPSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export const emailSchema = z.object({
  email: z.string({ required_error: "Email is required." }).email(),
});

export const resetPasswordSchema = z
  .object({
    newPassword: password,
    confirmNewPassword: password,
  })
  .refine((schema) => schema.newPassword === schema.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

export const profileInfoSchema = z.object({
  name: z
    .string({ required_error: "Username is required." })
    .min(1, { message: "Name is required." })
    .min(2, {
      message: "User name must be at least 2 characters.",
    })
    .max(48, { message: "Username cannot exceed 48 characters." }),
  bio: z.string().max(150, { message: "Biography must be less then 150 characters." }),
  link: z
    .string()
    .url({ message: "Invalid url." })
    .max(60, { message: "Link cannot be longer than 60 characters." })
    .optional()
    .or(z.literal("")),
});

export const completeProfileInfoSchema = profileInfoSchema.extend({
  profilePicture: z
    .object({
      name: z.string(),
      base64: z.string().refine((s) => s.includes("data:image/jpeg;base64,"), {
        message: "Invalid base64 format.",
      }),
    })
    .optional(),
});
