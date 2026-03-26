const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const ENTITY_RE = /[&<>"'`/]/g;

export function escapeHtml(str: string): string {
  return str.replace(ENTITY_RE, (char) => HTML_ENTITIES[char] || char);
}

export function sanitizeString(value: string): string {
  return escapeHtml(value.trim());
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): T {
  const result: Record<string, unknown> = { ...obj };
  for (const field of fields) {
    const val = result[field as string];
    if (typeof val === "string") {
      result[field as string] = sanitizeString(val);
    }
  }
  return result as T;
}
