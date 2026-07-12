import { Router, type IRouter } from "express";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, linksTable, collectionsTable } from "@stashd/db";
import {
  ListLinksQueryParams,
  CreateLinkBody,
  GetLinkParams,
  UpdateLinkParams,
  UpdateLinkBody,
  DeleteLinkParams,
  UpdateLinkStatusParams,
  UpdateLinkStatusBody,
} from "@stashd/api-schema";

const router: IRouter = Router();

const STALE_DAYS = 14;

function isStale(createdAt: Date, status: string): boolean {
  if (status !== "to_read") return false;
  const ageMs = Date.now() - createdAt.getTime();
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}

function formatLink(row: typeof linksTable.$inferSelect & { collectionName?: string | null }) {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description ?? null,
    imageUrl: row.imageUrl ?? null,
    siteName: row.siteName ?? null,
    favicon: row.favicon ?? null,
    aiSummary: row.aiSummary ?? null,
    readingTimeMinutes: row.readingTimeMinutes ?? null,
    status: row.status,
    tags: row.tags ?? [],
    collectionId: row.collectionId ?? null,
    collectionName: row.collectionName ?? null,
    notes: row.notes ?? null,
    isStale: isStale(new Date(row.createdAt), row.status),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

const linkSelectColumns = {
  id: linksTable.id,
  url: linksTable.url,
  title: linksTable.title,
  description: linksTable.description,
  imageUrl: linksTable.imageUrl,
  siteName: linksTable.siteName,
  favicon: linksTable.favicon,
  aiSummary: linksTable.aiSummary,
  readingTimeMinutes: linksTable.readingTimeMinutes,
  status: linksTable.status,
  tags: linksTable.tags,
  collectionId: linksTable.collectionId,
  collectionName: collectionsTable.name,
  notes: linksTable.notes,
  createdAt: linksTable.createdAt,
};

async function attachCollectionName(link: typeof linksTable.$inferSelect) {
  let collectionName: string | null = null;
  if (link.collectionId) {
    const [col] = await db
      .select({ name: collectionsTable.name })
      .from(collectionsTable)
      .where(eq(collectionsTable.id, link.collectionId));
    collectionName = col?.name ?? null;
  }
  return formatLink({ ...link, collectionName });
}

// GET /links
router.get("/links", async (req, res): Promise<void> => {
  const parsed = ListLinksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, collectionId, tag, sort, q } = parsed.data;

  let query = db
    .select(linkSelectColumns)
    .from(linksTable)
    .leftJoin(collectionsTable, eq(linksTable.collectionId, collectionsTable.id))
    .$dynamic();

  const conditions = [];
  if (status) conditions.push(eq(linksTable.status, status));
  if (collectionId) conditions.push(eq(linksTable.collectionId, collectionId));
  if (tag) conditions.push(sql`${tag} = ANY(${linksTable.tags})`);
  if (q) {
    conditions.push(
      or(
        ilike(linksTable.title, `%${q}%`),
        ilike(linksTable.description, `%${q}%`),
        ilike(linksTable.url, `%${q}%`),
        ilike(linksTable.aiSummary, `%${q}%`),
        sql`${q} ILIKE ANY(${linksTable.tags})`,
      )!,
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (sort === "oldest") {
    query = query.orderBy(asc(linksTable.createdAt));
  } else if (sort === "unread_first") {
    query = query.orderBy(
      sql`CASE WHEN ${linksTable.status} = 'to_read' THEN 0 WHEN ${linksTable.status} = 'reading' THEN 1 ELSE 2 END`,
      desc(linksTable.createdAt),
    );
  } else {
    query = query.orderBy(desc(linksTable.createdAt));
  }

  const rows = await query;
  res.json(rows.map((r) => formatLink(r)));
});

// POST /links
router.post("/links", async (req, res): Promise<void> => {
  const parsed = CreateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url, tags, collectionId, ...rest } = parsed.data;

  const [link] = await db
    .insert(linksTable)
    .values({ url, tags: tags ?? [], collectionId: collectionId ?? null, ...rest })
    .returning();

  res.status(201).json(await attachCollectionName(link));
});

// GET /links/stats
router.get("/links/stats", async (_req, res): Promise<void> => {
  const [statsRow] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      toRead: sql<number>`COUNT(*) FILTER (WHERE ${linksTable.status} = 'to_read')::int`,
      reading: sql<number>`COUNT(*) FILTER (WHERE ${linksTable.status} = 'reading')::int`,
      done: sql<number>`COUNT(*) FILTER (WHERE ${linksTable.status} = 'done')::int`,
      stale: sql<number>`COUNT(*) FILTER (
        WHERE ${linksTable.status} = 'to_read'
        AND ${linksTable.createdAt} < NOW() - INTERVAL '${sql.raw(String(STALE_DAYS))} days'
      )::int`,
    })
    .from(linksTable);

  const [{ count: collectionsCount }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(collectionsTable);

  const tagsQuery = await db.select({ tags: linksTable.tags }).from(linksTable);
  const allTags = new Set<string>();
  for (const r of tagsQuery) {
    for (const t of r.tags) allTags.add(t);
  }

  res.json({
    total: statsRow.total,
    toRead: statsRow.toRead,
    reading: statsRow.reading,
    done: statsRow.done,
    stale: statsRow.stale,
    collectionsCount,
    tagsCount: allTags.size,
  });
});

// GET /links/:id
router.get("/links/:id", async (req, res): Promise<void> => {
  const params = GetLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select(linkSelectColumns)
    .from(linksTable)
    .leftJoin(collectionsTable, eq(linksTable.collectionId, collectionsTable.id))
    .where(eq(linksTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json(formatLink(row));
});

// PATCH /links/:id
router.patch("/links/:id", async (req, res): Promise<void> => {
  const params = UpdateLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tags, collectionId, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (tags !== undefined) updates.tags = tags;
  if (collectionId !== undefined) updates.collectionId = collectionId;

  const [link] = await db
    .update(linksTable)
    .set(updates)
    .where(eq(linksTable.id, params.data.id))
    .returning();

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json(await attachCollectionName(link));
});

// DELETE /links/:id
router.delete("/links/:id", async (req, res): Promise<void> => {
  const params = DeleteLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [link] = await db
    .delete(linksTable)
    .where(eq(linksTable.id, params.data.id))
    .returning();

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.sendStatus(204);
});

// PATCH /links/:id/status
router.patch("/links/:id/status", async (req, res): Promise<void> => {
  const params = UpdateLinkStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLinkStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [link] = await db
    .update(linksTable)
    .set({ status: parsed.data.status })
    .where(eq(linksTable.id, params.data.id))
    .returning();

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json(await attachCollectionName(link));
});

export default router;