import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { users as usersTable } from "../db/schemas/users";

/// TODO: pass this to real db

const usersData = [
  { id: 1, username: "foo", name: "Foo" },
  { id: 2, username: "bar", name: "Bar" },
];

const userSchema = z.object({
  id: z.number().int().positive().min(1),
  username: z.string().min(3).max(30).toLowerCase(),
  name: z.string().min(3).max(48),
});

const insertUserSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const users = new Hono()
  .get("/", (ctx) => {
    return ctx.json(usersData);
  })
  .get("/:idusername", async (ctx) => {
    const idUsername = ctx.req.param("idusername");

    const foundUser = await db.query.users.findFirst({
      where: or(eq(usersTable.username, idUsername), eq(usersTable, idUsername)),
    });

    if (foundUser === undefined) {
      return ctx.notFound();
    }

    return ctx.json(foundUser);
  })
  .post("/", zValidator("json", insertUserSchema), (ctx) => {
    const body = ctx.req.valid("json");

    usersData.push({ id: usersData.length + 1, ...body });

    return ctx.json({ message: "User created" }, 201);
  })
  .delete("/:id", (ctx) => {
    const id = ctx.req.param("id");

    const findUser = usersData.findIndex((user) => user.id === Number(id));

    if (findUser === -1) {
      return ctx.notFound();
    }

    usersData.splice(findUser, 1);

    return ctx.json({ message: "User deleted" });
  });
