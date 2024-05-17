import { WelcomeTemplate } from "../email/welcome-template";
import { db } from "../db";
import { verifyUser } from "../db/schemas/verify-user";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { customAlphabet, nanoid } from "nanoid";
import { Resend } from "resend";
import { safeTry } from "./safe-try";

dayjs.extend(utc);

const resend = new Resend(process.env.RESEND_API_KEY);

type User = {
  id: string;
  email?: string;
  username?: string;
};

export async function emailVerification(user: User) {
  const numberCode = customAlphabet("0123456789", 6);
  const verificationToken = nanoid(32);
  const verificationCode = numberCode();
  const expires = dayjs.utc().add(10, "minutes").format("YYYY-MM-DD HH:mm:ss");

  const { error: foundEmailError, result: foundEmail } = await safeTry(
    db.query.verifyUser.findFirst({
      columns: { id: true },
      where: eq(verifyUser.email, user.email!),
    }),
  );

  if (foundEmailError) {
    throw new Error(foundEmailError.message);
  }

  if (foundEmail) {
    await safeTry(
      db
        .update(verifyUser)
        .set({
          expires,
          code: verificationCode,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(verifyUser.id, foundEmail.id)),
    );
  } else {
    await safeTry(
      db.insert(verifyUser).values({
        id: nanoid(),
        email: user.email!,
        expires,
        token: verificationToken,
        code: verificationCode,
      }),
    );
  }

  await safeTry(
    resend.emails.send({
      from:
        process.env.NODE_ENV === "development"
          ? "Threads Clone <onboarding@resend.dev>"
          : "Threads Clone <noreply@threads-clone.henrryb.site>",
      to: [user.email!],
      subject: "Welcome to Threads Clone! Confirm Your Account",
      html: WelcomeTemplate({ username: user.username!, verificationCode }),
    }),
  );

  return { verificationToken, verificationCode };
}
