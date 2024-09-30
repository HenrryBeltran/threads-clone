import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { activities as activitiesTable } from "../db/schemas/activities";
import { safeTry } from "./safe-try";

dayjs.extend(utc);

type CreateActivity = (
  type: "mention" | "reply" | "follow" | "like",
  sender: string,
  receiver: string,
  message: string,
  threadPostId?: string | null,
) => Promise<void>;

export const createActivity: CreateActivity = async (type, sender, receiver, message, threadPostId = null) => {
  if (type === "follow") {
    const follow = await updateRepeatedActivity(receiver, "follow");
    if (follow !== undefined) {
      return;
    }
  } else if (type === "like") {
    const like = await updateRepeatedActivity(receiver, "like");
    if (like !== undefined) {
      return;
    }
  }

  const newActivity = await safeTry(
    db.insert(activitiesTable).values({ id: nanoid(), sender, receiver, message, type, threadPostId }),
  );

  if (newActivity.error !== null) {
    throw new Error(newActivity.error.message);
  }
};

async function updateRepeatedActivity(receiver: string, type: "follow" | "like") {
  const findActivity = await safeTry(
    db.query.activities.findFirst({
      columns: { id: true },
      where: and(eq(activitiesTable.receiver, receiver), eq(activitiesTable.type, type)),
    }),
  );

  if (findActivity.error !== null) {
    throw new Error(findActivity.error.message);
  }

  if (findActivity.result !== undefined) {
    const { error } = await safeTry(
      db
        .update(activitiesTable)
        .set({ readStatus: false, updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss") })
        .where(eq(activitiesTable.id, findActivity.result.id)),
    );

    if (error !== null) {
      throw new Error(error.message);
    }

    return findActivity.result;
  }
}
