import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schemas/*.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  migrations: {
    schema: "public",
  },
  verbose: true,
  strict: true,
});
