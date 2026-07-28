import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as activities from "./schemas/activities";
import * as follows from "./schemas/follows";
import * as likes from "./schemas/likes";
import * as resetPassword from "./schemas/reset-password";
import * as saved from "./schemas/saved";
import * as searchHistory from "./schemas/search-history";
import * as sessions from "./schemas/sessions";
import * as threads from "./schemas/threads";
import * as users from "./schemas/users";
import * as verifyEmail from "./schemas/verify-email";
import * as verifyUser from "./schemas/verify-user";

const client = createClient({
  url: Bun.env.DATABASE_URL!,
  authToken: Bun.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema: {
    ...users,
    ...likes,
    ...saved,
    ...follows,
    ...threads,
    ...sessions,
    ...verifyUser,
    ...verifyEmail,
    ...resetPassword,
    ...searchHistory,
    ...activities,
  },
});
