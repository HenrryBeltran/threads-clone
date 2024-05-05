import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from ".";

migrate(db, { migrationsFolder: "drizzle" });
