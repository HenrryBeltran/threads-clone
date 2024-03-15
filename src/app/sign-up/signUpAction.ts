"use server";

import { signUpFormSchema } from "@/common/schemas";
import { xata } from "@/db";
import { Try } from "@/lib/safeTry";
import bcrypt from "bcrypt";
import { z } from "zod";

export type FormState = {
  message: string;
  ok?: boolean;
  path?: string;
  issues?: z.ZodError<typeof signUpFormSchema>;
};

export async function signUpAction(formData: z.infer<typeof signUpFormSchema>) {
  const validatedForm = signUpFormSchema.safeParse(formData);

  if (!validatedForm.success) {
    return {
      message: "Invalid form data.",
      issues: validatedForm.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedForm.data;
  const username = validatedForm.data.username.toLowerCase();

  const { error: foundUsernameError, result: foundUsername } = await Try(
    xata.db.user.select(["id"]).filter({ username: username }).getFirst(),
  );

  if (foundUsernameError) {
    console.error(foundUsername);

    return {
      message: foundUsernameError.message,
    };
  }

  if (foundUsername) {
    return {
      message: `Username ${username} is already taken.`,
      path: "username",
    };
  }

  const { error: foundEmailError, result: foundEmail } = await Try(
    xata.db.user.select(["id"]).filter({ email: email }).getFirst(),
  );

  if (foundEmailError) {
    console.error(foundEmailError);

    return {
      message: foundEmailError.message,
    };
  }

  if (foundEmail) {
    return {
      message: "This email is already register.",
      path: "email",
    };
  }

  const { error: hashedPasswordError, result: hashedPassword } = await Try(
    bcrypt.hash(password, 10),
  );

  if (hashedPasswordError) {
    console.error(hashedPasswordError);

    return {
      message: hashedPasswordError.message,
    };
  }

  const { error } = await Try(
    xata.db.user.create({
      username,
      email,
      password: hashedPassword,
    }),
  );

  if (error) {
    console.error(error);

    return {
      message: error.message,
    };
  }

  return { message: "User signed up.", ok: true };
}
