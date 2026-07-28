import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../../db/schemas/users";

export const insertUserSchema = createInsertSchema(users, {
  name: z
    .string({ required_error: "Name is required." })
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
    .or(z.literal("")),
}).omit({
  id: true,
  username: true,
  email: true,
  password: true,
  profilePictureId: true,
  followersCount: true,
  followingsCount: true,
  roles: true,
  emailVerified: true,
  createdAt: true,
});

export const insertUserProfileSchema = insertUserSchema.extend({
  profilePicture: z
    .object({
      base64: z.string().refine((s) => s.includes("data:image/jpeg;base64,"), {
        message: "Invalid base64 format.",
      }),
    })
    .optional(),
});
