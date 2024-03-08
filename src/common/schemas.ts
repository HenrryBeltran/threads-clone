import { z } from "zod";

export const loginFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Username must be at least 8 characters.",
  }),
});

export const signUpFormSchema = z
  .object({
    username: z
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
      ),
    email: z.string({ required_error: "Email is required." }).email(),
    password: z
      .string({ required_error: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." })
      .max(30, { message: "Password cannot execeed 30 characters long." }),
    confirmPassword: z
      .string({ required_error: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." })
      .max(30, { message: "Password cannot execeed 30 characters long." }),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
