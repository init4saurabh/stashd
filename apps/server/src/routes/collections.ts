import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, collectionsTable, linksTable } from "@stashd/db";
import {
  CreateCollectionBody,
  GetCollectionParams,
  UpdateCollectionParams,
  UpdateCollectionBody,
  DeleteCollectionParams,
} from "@stashd/api-schema";

const router: IRouter = Router();

function formatCollection(
  row: Pick<typeof collectionsTable.$inferSelect, "id" | "name" | "description" | "color" | "createdAt">,
  linkCount: number,
) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    color: row.color ?? null,
    linkCount,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

// GET /collections
router.get("/collections", async (req, res): Promise<void> => {
  const userId = req.userId!;

  const rows = await db
    .select({
      id: collectionsTable.id,
      name: collectionsTable.name,
      description: collectionsTable.description,
      color: collectionsTable.color,
      createdAt: collectionsTable.createdAt,
      linkCount: sql<number>`COUNT(${linksTable.id})::int`,
    })
    .from(collectionsTable)
    .leftJoin(linksTable, eq(linksTable.collectionId, collectionsTable.id))
    .where(eq(collectionsTable.userId, userId))
    .groupBy(collectionsTable.id)
    .orderBy(collectionsTable.name);

  res.json(rows.map((r) => formatCollection(r, r.linkCount)));
});

// POST /collections
router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.userId!;

  const [col] = await db
    .insert(collectionsTable)
    .values({ ...parsed.data, userId })
    .returning();
  res.status(201).json(formatCollection(col, 0));
});

// GET /collections/:id
router.get("/collections/:id", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.userId!;

  const [row] = await db
    .select({
      id: collectionsTable.id,
      name: collectionsTable.name,
      description: collectionsTable.description,
      color: collectionsTable.color,
      createdAt: collectionsTable.createdAt,
      linkCount: sql<number>`COUNT(${linksTable.id})::int`,
    })
    .from(collectionsTable)
    .leftJoin(linksTable, eq(linksTable.collectionId, collectionsTable.id))
    .where(and(eq(collectionsTable.id, params.data.id), eq(collectionsTable.userId, userId)))
    .groupBy(collectionsTable.id);

  if (!row) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.json(formatCollection(row, row.linkCount));
});

// PATCH /collections/:id
router.patch("/collections/:id", async (req, res): Promise<void> => {
  const params = UpdateCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.userId!;

  const [col] = await db
    .update(collectionsTable)
    .set(parsed.data)
    .where(and(eq(collectionsTable.id, params.data.id), eq(collectionsTable.userId, userId)))
    .returning();

  if (!col) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(linksTable)
    .where(eq(linksTable.collectionId, col.id));

  res.json(formatCollection(col, count));
});

// DELETE /collections/:id
router.delete("/collections/:id", async (req, res): Promise<void> => {
  const params = DeleteCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.userId!;

  const [col] = await db
    .delete(collectionsTable)
    .where(and(eq(collectionsTable.id, params.data.id), eq(collectionsTable.userId, userId)))
    .returning();

  if (!col) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;