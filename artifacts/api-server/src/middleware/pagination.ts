import type { Request } from "express";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sort?: string;
  order: "asc" | "desc";
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

export function parsePagination(req: Request): PaginationParams {
  const parsed = paginationSchema.safeParse(req.query);
  const params = parsed.success ? parsed.data : { page: 1, limit: 25, order: "desc" as const };
  return {
    page: params.page,
    limit: params.limit,
    offset: (params.page - 1) * params.limit,
    sort: (req.query.sort as string) || undefined,
    order: params.order,
  };
}

export function paginateArray<T>(items: T[], params: PaginationParams): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / params.limit);
  const data = items.slice(params.offset, params.offset + params.limit);
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

export function sortArray<T extends Record<string, unknown>>(items: T[], sort: string | undefined, order: "asc" | "desc"): T[] {
  if (!sort) return items;
  return [...items].sort((a, b) => {
    const aVal = a[sort];
    const bVal = b[sort];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    return order === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
}

export function filterByFields<T extends Record<string, unknown>>(
  items: T[],
  query: Record<string, string | string[] | undefined>,
  allowedFilters: string[],
): T[] {
  let filtered = items;
  for (const field of allowedFilters) {
    const val = query[field];
    if (val !== undefined && val !== "") {
      const valStr = Array.isArray(val) ? val[0] : val;
      if (!valStr) continue;
      filtered = filtered.filter(item => {
        const itemVal = item[field];
        if (itemVal == null) return false;
        return String(itemVal).toLowerCase() === valStr.toLowerCase();
      });
    }
  }
  const dateFrom = query.dateFrom as string | undefined;
  const dateTo = query.dateTo as string | undefined;
  if (dateFrom || dateTo) {
    filtered = filtered.filter(item => {
      const createdAt = item.createdAt;
      const created = createdAt instanceof Date ? createdAt.toISOString() : String(createdAt || "");
      if (dateFrom && created < dateFrom) return false;
      if (dateTo && created > dateTo) return false;
      return true;
    });
  }
  return filtered;
}

export function searchItems<T extends Record<string, unknown>>(
  items: T[],
  query: string | undefined,
  searchFields: string[],
): T[] {
  if (!query || query.trim() === "") return items;
  const q = query.toLowerCase().trim();
  return items.filter(item =>
    searchFields.some(field => {
      const val = item[field];
      return val != null && String(val).toLowerCase().includes(q);
    }),
  );
}
