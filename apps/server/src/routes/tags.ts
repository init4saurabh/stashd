import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, linksTable } from "@stashd/db";

const router: IRouter = Router();

// GET /tags
router.get("/tags", async (req, res): Promise<void> => {
  const userId = req.userId!;

  const rows = await db
    .select({ tags: linksTable.tags })
    .from(linksTable)
    .where(eq(linksTable.userId, userId));

  const counts = new Map<string, number>();
  for (const { tags } of rows) {
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const result = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  res.json(result);
});

export default router;