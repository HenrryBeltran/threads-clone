"use server";

import { cookieOptions } from "@/common/cookieOptions";
import { loginFormSchema } from "@/common/schemas";
import { xata } from "@/db";
import { UserRecord } from "@/db/xata";
import { Try } from "@/lib/safeTry";
import { SelectedPick } from "@xata.io/client";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { z } from "zod";
import { nanoid } from "nanoid";

export type FormState = {
  message: string;
  ok?: boolean;
  path?: string;
  issues?: z.ZodError<typeof loginFormSchema>;
};

export async function loginAction(formData: z.infer<typeof loginFormSchema>) {
  const validatedForm = loginFormSchema.safeParse(formData);

  if (!validatedForm.success) {
    return {
      message: "Invalid form data.",
      issues: validatedForm.error.flatten().fieldErrors,
    };
  }

  const { password } = validatedForm.data;
  const username = validatedForm.data.username.toLowerCase();

  let foundUser: SelectedPick<UserRecord, ("id" | "password")[]> | null | undefined;

  if (username.includes("@")) {
    const { error: foundEmailError, result: foundUserByEmail } = await Try(
      xata.db.user.select(["id", "password"]).filter({ email: username }).getFirst(),
    );

    if (foundEmailError) {
      console.error(foundEmailError);

      return {
        message: foundEmailError.message,
      };
    }

    if (!foundUserByEmail) {
      return {
        message: "Email not register.",
        path: "username",
      };
    }
    foundUser = foundUserByEmail;
  } else {
    const { error: foundUsernameError, result: foundUserByUsername } = await Try(
      xata.db.user.select(["id", "password"]).filter({ username: username }).getFirst(),
    );

    if (foundUsernameError) {
      console.error(foundUserByUsername);

      return {
        message: foundUsernameError.message,
      };
    }

    if (!foundUserByUsername) {
      return {
        message: "Username not found.",
        path: "username",
      };
    }
    foundUser = foundUserByUsername;
  }

  const passwordMatch = await Try(bcrypt.compare(password, foundUser.password!));

  if (passwordMatch.error) {
    return {
      message: passwordMatch.error.message,
    };
  }

  if (!passwordMatch.result) {
    return {
      message: "Wrong password",
      path: "password",
      ok: false,
    };
  }

  cookies().set("st", nanoid(), cookieOptions);

  return { message: "User logged in", ok: true };
}
