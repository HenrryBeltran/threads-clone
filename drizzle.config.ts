import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schemas/*.ts",
  out: "./drizzle",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
});
