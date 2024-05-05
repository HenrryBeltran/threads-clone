import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./server/db";

migrate(db, { migrationsFolder: "drizzle" });
