import { Router } from "express";
import { z } from "zod";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import {
  carlotaJoInquiriesTable,
  carlotaJoEngagementsTable,
} from "@szl-holdings/db/schema";
import { eq, and, count, desc, asc, ilike, sql, type SQL } from "drizzle-orm";
import { requireAuth } from "./auth";
import { validateAndSanitizeBody } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import { sanitizeString } from "../lib/sanitize";
import { AppError } from "../lib/errors";
import {
  parsePagination,
  buildPaginatedResponse,
  getOffset,
  getSortColumn,
  getSortDirection,
  parseDateRange,
  buildDateRangeCondition,
  buildSearchCondition,
  buildFilterCondition,
} from "../lib/pagination";
import { getCachedOrFetch, invalidateCacheByKeys, CACHE_KEYS, CACHE_TTLS } from "../lib/cache";
import type { PgColumn } from "drizzle-orm/pg-core";

const router = Router();

const inquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  service: z.string().max(200).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  message: z.string().max(5000).optional(),
  company: z.string().max(200).optional(),
  datePreference: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  type: z.string().max(100).optional(),
});

const updateInquirySchema = z.object({
  status: z.enum(["new", "in-review", "contacted", "converted", "closed"]).optional(),
  service: z.string().max(200).optional(),
});

const engagementSchema = z.object({
  inquiryId: z.number().optional(),
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().max(200),
  company: z.string().max(200).optional(),
  service: z.string().min(1).max(200),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  startDate: z.string().max(100).optional(),
  endDate: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

const updateEngagementSchema = z.object({
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  endDate: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

const inquirySortColumns: Record<string, PgColumn> = {
  createdAt: carlotaJoInquiriesTable.createdAt,
  name: carlotaJoInquiriesTable.name,
  email: carlotaJoInquiriesTable.email,
  status: carlotaJoInquiriesTable.status,
  type: carlotaJoInquiriesTable.type,
};

const engagementSortColumns: Record<string, PgColumn> = {
  createdAt: carlotaJoEngagementsTable.createdAt,
  clientName: carlotaJoEngagementsTable.clientName,
  status: carlotaJoEngagementsTable.status,
  service: carlotaJoEngagementsTable.service,
};

router.get("/carlota-jo/health", (_req, res) => {
  res.json({ ok: true, group: "carlota-jo", timestamp: new Date().toISOString() });
});

router.post("/carlota-jo/inquiries", validateAndSanitizeBody(inquirySchema), asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const { name, email, service, budget, timeline, message, company, datePreference, description, type } = req.body;

  const inquiryCode = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const [inquiry] = await db.insert(carlotaJoInquiriesTable).values({
    inquiryCode,
    name: sanitizeString(name),
    email: sanitizeString(email),
    service: sanitizeString(service || ""),
    budget: budget ? sanitizeString(budget) : undefined,
    timeline: timeline ? sanitizeString(timeline) : undefined,
    message: message ? sanitizeString(message) : undefined,
    company: company ? sanitizeString(company) : undefined,
    datePreference: datePreference ? sanitizeString(datePreference) : undefined,
    description: description ? sanitizeString(description) : undefined,
    type: type ? sanitizeString(type) : "general_inquiry",
    status: "new",
  }).returning();

  await invalidateCacheByKeys(CACHE_KEYS.CARLOTA_JO_STATS, CACHE_KEYS.PORTFOLIO_SUMMARY, CACHE_KEYS.PLATFORM_DASHBOARD);

  res.json({ success: true, id: inquiry.id, inquiryCode: inquiry.inquiryCode, message: "Inquiry received successfully" });
}));

router.get("/carlota-jo/inquiries", requireAuth, asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const pagination = parsePagination(req);
  const dateRange = parseDateRange(req);
  const search = (req.query.search as string) || undefined;
  const statusFilter = (req.query.status as string) || undefined;
  const typeFilter = (req.query.type as string) || undefined;
  const serviceFilter = (req.query.service as string) || undefined;

  const conditions: (SQL | undefined)[] = [];

  if (statusFilter) {
    conditions.push(buildFilterCondition(carlotaJoInquiriesTable.status, statusFilter));
  }
  if (typeFilter) {
    conditions.push(buildFilterCondition(carlotaJoInquiriesTable.type, typeFilter));
  }
  if (serviceFilter) {
    conditions.push(ilike(carlotaJoInquiriesTable.service, `%${serviceFilter}%`));
  }

  const dateConditions = buildDateRangeCondition(carlotaJoInquiriesTable.createdAt, dateRange);
  conditions.push(...dateConditions);

  if (search) {
    conditions.push(buildSearchCondition(
      [carlotaJoInquiriesTable.name, carlotaJoInquiriesTable.email, carlotaJoInquiriesTable.company],
      search,
    ));
  }

  const definedConditions = conditions.filter((c): c is SQL => c !== undefined);
  const whereClause = definedConditions.length > 0 ? and(...definedConditions) : undefined;

  const sortCol = getSortColumn(inquirySortColumns, pagination.sortBy, carlotaJoInquiriesTable.createdAt);
  const sortDir = getSortDirection(sortCol, pagination.sortOrder);

  const [totalResult, inquiries] = await Promise.all([
    db.select({ count: count() }).from(carlotaJoInquiriesTable).where(whereClause),
    db.select()
      .from(carlotaJoInquiriesTable)
      .where(whereClause)
      .orderBy(sortDir)
      .limit(pagination.limit)
      .offset(getOffset(pagination)),
  ]);

  const total = totalResult[0]?.count ?? 0;
  res.json(buildPaginatedResponse(inquiries, total, pagination));
}));

router.get("/carlota-jo/inquiries/:id", requireAuth, asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw AppError.badRequest("Invalid inquiry ID");
  }

  const [inquiry] = await db.select()
    .from(carlotaJoInquiriesTable)
    .where(eq(carlotaJoInquiriesTable.id, id))
    .limit(1);

  if (!inquiry) {
    throw AppError.notFound("Inquiry not found");
  }

  res.json(inquiry);
}));

router.patch("/carlota-jo/inquiries/:id", requireAuth, validateAndSanitizeBody(updateInquirySchema), asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw AppError.badRequest("Invalid inquiry ID");
  }

  const updates: Partial<typeof carlotaJoInquiriesTable.$inferInsert> & { updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (req.body.status) updates.status = req.body.status;
  if (req.body.service) updates.service = req.body.service;

  const [updated] = await db.update(carlotaJoInquiriesTable)
    .set(updates)
    .where(eq(carlotaJoInquiriesTable.id, id))
    .returning();

  if (!updated) {
    throw AppError.notFound("Inquiry not found");
  }

  await invalidateCacheByKeys(CACHE_KEYS.CARLOTA_JO_STATS, CACHE_KEYS.PORTFOLIO_SUMMARY, CACHE_KEYS.PLATFORM_DASHBOARD);

  res.json(updated);
}));

router.delete("/carlota-jo/inquiries/:id", requireAuth, asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw AppError.badRequest("Invalid inquiry ID");
  }

  const [deleted] = await db.delete(carlotaJoInquiriesTable)
    .where(eq(carlotaJoInquiriesTable.id, id))
    .returning();

  if (!deleted) {
    throw AppError.notFound("Inquiry not found");
  }

  await invalidateCacheByKeys(CACHE_KEYS.CARLOTA_JO_STATS, CACHE_KEYS.PORTFOLIO_SUMMARY, CACHE_KEYS.PLATFORM_DASHBOARD);

  res.json({ success: true, message: "Inquiry deleted" });
}));

router.post("/carlota-jo/engagements", requireAuth, validateAndSanitizeBody(engagementSchema), asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const engagementCode = `eng_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const [engagement] = await db.insert(carlotaJoEngagementsTable).values({
    engagementCode,
    inquiryId: req.body.inquiryId || null,
    clientName: sanitizeString(req.body.clientName),
    clientEmail: sanitizeString(req.body.clientEmail),
    company: req.body.company ? sanitizeString(req.body.company) : undefined,
    service: sanitizeString(req.body.service),
    status: req.body.status || "active",
    startDate: req.body.startDate || null,
    endDate: req.body.endDate || null,
    budget: req.body.budget ? sanitizeString(req.body.budget) : undefined,
    notes: req.body.notes ? sanitizeString(req.body.notes) : undefined,
  }).returning();

  await invalidateCacheByKeys(CACHE_KEYS.CARLOTA_JO_STATS, CACHE_KEYS.PORTFOLIO_SUMMARY, CACHE_KEYS.PLATFORM_DASHBOARD);

  res.json({ success: true, engagement });
}));

router.get("/carlota-jo/engagements", requireAuth, asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const pagination = parsePagination(req);
  const statusFilter = (req.query.status as string) || undefined;
  const search = (req.query.search as string) || undefined;

  const conditions: (SQL | undefined)[] = [];

  if (statusFilter) {
    conditions.push(buildFilterCondition(carlotaJoEngagementsTable.status, statusFilter));
  }

  if (search) {
    conditions.push(buildSearchCondition(
      [carlotaJoEngagementsTable.clientName, carlotaJoEngagementsTable.clientEmail, carlotaJoEngagementsTable.company],
      search,
    ));
  }

  const definedConditions = conditions.filter((c): c is SQL => c !== undefined);
  const whereClause = definedConditions.length > 0 ? and(...definedConditions) : undefined;

  const sortCol = getSortColumn(engagementSortColumns, pagination.sortBy, carlotaJoEngagementsTable.createdAt);
  const sortDir = getSortDirection(sortCol, pagination.sortOrder);

  const [totalResult, engagements] = await Promise.all([
    db.select({ count: count() }).from(carlotaJoEngagementsTable).where(whereClause),
    db.select()
      .from(carlotaJoEngagementsTable)
      .where(whereClause)
      .orderBy(sortDir)
      .limit(pagination.limit)
      .offset(getOffset(pagination)),
  ]);

  const total = totalResult[0]?.count ?? 0;
  res.json(buildPaginatedResponse(engagements, total, pagination));
}));

router.get("/carlota-jo/engagements/:id", requireAuth, asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw AppError.badRequest("Invalid engagement ID");
  }

  const [engagement] = await db.select()
    .from(carlotaJoEngagementsTable)
    .where(eq(carlotaJoEngagementsTable.id, id))
    .limit(1);

  if (!engagement) {
    throw AppError.notFound("Engagement not found");
  }

  res.json(engagement);
}));

router.patch("/carlota-jo/engagements/:id", requireAuth, validateAndSanitizeBody(updateEngagementSchema), asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw AppError.badRequest("Invalid engagement ID");
  }

  const updates: Partial<typeof carlotaJoEngagementsTable.$inferInsert> & { updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (req.body.status) updates.status = req.body.status;
  if (req.body.endDate) updates.endDate = req.body.endDate;
  if (req.body.budget) updates.budget = req.body.budget;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;

  const [updated] = await db.update(carlotaJoEngagementsTable)
    .set(updates)
    .where(eq(carlotaJoEngagementsTable.id, id))
    .returning();

  if (!updated) {
    throw AppError.notFound("Engagement not found");
  }

  await invalidateCacheByKeys(CACHE_KEYS.CARLOTA_JO_STATS, CACHE_KEYS.PORTFOLIO_SUMMARY, CACHE_KEYS.PLATFORM_DASHBOARD);

  res.json(updated);
}));

router.get("/carlota-jo/stats", requireAuth, asyncHandler(async (req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const stats = await getCachedOrFetch(
    CACHE_KEYS.CARLOTA_JO_STATS,
    async () => {
      const [inquiryStats] = await db.select({
        total: count(),
        newCount: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'new' THEN 1 END`),
        inReviewCount: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'in-review' THEN 1 END`),
        contactedCount: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'contacted' THEN 1 END`),
        convertedCount: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'converted' THEN 1 END`),
        closedCount: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'closed' THEN 1 END`),
      }).from(carlotaJoInquiriesTable);

      const [engagementStats] = await db.select({
        total: count(),
        activeCount: count(sql`CASE WHEN ${carlotaJoEngagementsTable.status} = 'active' THEN 1 END`),
        completedCount: count(sql`CASE WHEN ${carlotaJoEngagementsTable.status} = 'completed' THEN 1 END`),
      }).from(carlotaJoEngagementsTable);

      return {
        inquiries: inquiryStats,
        engagements: engagementStats,
      };
    },
    { ttlSeconds: CACHE_TTLS.CARLOTA_JO_STATS },
  );

  res.json(stats);
}));

export default router;
