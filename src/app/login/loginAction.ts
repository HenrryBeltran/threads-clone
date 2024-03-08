"use server";

import { loginFormSchema } from "@/common/schemas";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function loginAction(_: FormState, formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = loginFormSchema.safeParse(data);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(data)) {
      fields[key] = data[key].toString();
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  // if (parsed.data.email.includes("a")) {
  //   return {
  //     message: "Invalid email",
  //     fields: parsed.data,
  //   };
  // }

  console.log("~ User", JSON.stringify(parsed.data, null, 2));

  return { message: "User logged in" };
}
