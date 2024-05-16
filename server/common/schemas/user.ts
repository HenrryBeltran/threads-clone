import { z } from "zod";
import { users } from "../../db/schemas/users";
import { createInsertSchema } from "drizzle-zod";

export const insertUserSchema = createInsertSchema(users, {
  name: z
    .string({ required_error: "Name is required." })
    .min(1, { message: "Name is required." })
    .min(2, {
      message: "User name must be at least 2 characters.",
    })
    .max(48, { message: "Username cannot exceed 48 characters." }),
  bio: z
    .string()
    .max(150, { message: "Biography must be less then 150 characters." })
    .optional(),
  link: z
    .string()
    .url({ message: "Invalid url." })
    .max(60, { message: "Link cannot be longer than 60 characters." })
    .optional()
    .or(z.literal("")),
}).omit({
  id: true,
  username: true,
  email: true,
  password: true,
  followersCount: true,
  followingsCount: true,
  roles: true,
  emailVerified: true,
  createdAt: true,
});
