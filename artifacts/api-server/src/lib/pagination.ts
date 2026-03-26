import type { Request } from "express";
import { sql, asc, desc, ilike, and, gte, lte, eq, type SQL, type Column } from "drizzle-orm";
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function parsePagination(req: Request, defaults?: { limit?: number; maxLimit?: number }): PaginationParams {
  const maxLimit = defaults?.maxLimit ?? 100;
  const defaultLimit = defaults?.limit ?? 20;

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
  const sortBy = (req.query.sortBy as string) || undefined;
  const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

  return { page, limit, sortBy, sortOrder };
}

export function buildPaginatedResponse<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

export function getOffset(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

export function getSortColumn(
  columnMap: Record<string, PgColumn>,
  sortBy: string | undefined,
  defaultColumn: PgColumn,
): PgColumn {
  if (!sortBy) return defaultColumn;
  return columnMap[sortBy] || defaultColumn;
}

export function getSortDirection(column: PgColumn, order: "asc" | "desc") {
  return order === "asc" ? asc(column) : desc(column);
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export function parseDateRange(req: Request): DateRangeFilter {
  return {
    from: (req.query.from as string) || undefined,
    to: (req.query.to as string) || undefined,
  };
}

export function buildDateRangeCondition(column: PgColumn, range: DateRangeFilter): SQL[] {
  const conditions: SQL[] = [];
  if (range.from) {
    conditions.push(gte(column, new Date(range.from)));
  }
  if (range.to) {
    conditions.push(lte(column, new Date(range.to)));
  }
  return conditions;
}

export function buildSearchCondition(columns: PgColumn[], searchTerm: string): SQL | undefined {
  if (!searchTerm) return undefined;
  const conditions = columns.map((col) => ilike(col, `%${searchTerm}%`));
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return sql`(${sql.join(conditions, sql` OR `)})`;
}

export function buildFilterCondition(column: PgColumn, value: string | undefined): SQL | undefined {
  if (!value) return undefined;
  return eq(column, value);
}
