import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_main-layout/search")({
  validateSearch: (search) => z.object({ q: z.string().optional() }).parse(search),
});
