import fs from "node:fs";
import path from "node:path";

export interface ParsedPost {
  week: number;
  platform: "linkedin" | "twitter";
  content: string;
  scheduledAt: Date;
}

function getCalendarPath(): string {
  return path.resolve(
    process.cwd(),
    "social-content",
    "content-calendar.md",
  );
}

export function parseContentCalendar(
  startDate: Date = new Date("2026-03-30T00:00:00Z"),
): ParsedPost[] {
  const calendarPath = getCalendarPath();
  if (!fs.existsSync(calendarPath)) {
    throw new Error(`Content calendar not found at ${calendarPath}`);
  }

  const content = fs.readFileSync(calendarPath, "utf-8");
  const posts: ParsedPost[] = [];

  const weekSections = content.split(/^## Week \d+:/m).slice(1);

  for (let weekIndex = 0; weekIndex < weekSections.length; weekIndex++) {
    const section = weekSections[weekIndex];
    const weekNum = weekIndex + 1;

    const weekStart = new Date(startDate.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000);

    const linkedInDate = new Date(weekStart);
    linkedInDate.setUTCDate(linkedInDate.getUTCDate() + 1);
    linkedInDate.setUTCHours(9, 0, 0, 0);

    const twitterDate = new Date(weekStart);
    twitterDate.setUTCHours(12, 0, 0, 0);

    const linkedInContent = extractPostContent(section, "LinkedIn Post");
    const twitterContent = extractPostContent(section, "X / Twitter Post");

    if (linkedInContent) {
      posts.push({
        week: weekNum,
        platform: "linkedin",
        content: linkedInContent,
        scheduledAt: linkedInDate,
      });
    }

    if (twitterContent) {
      posts.push({
        week: weekNum,
        platform: "twitter",
        content: twitterContent,
        scheduledAt: twitterDate,
      });
    }
  }

  return posts;
}

function extractPostContent(section: string, heading: string): string | null {
  const headingPattern = new RegExp(
    `### ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n`,
  );
  const match = section.match(headingPattern);
  if (!match || match.index === undefined) return null;

  const afterHeading = section.slice(match.index + match[0].length);

  const nextSectionMatch = afterHeading.match(/^###\s/m);
  const nextHr = afterHeading.match(/^---$/m);

  let endIndex = afterHeading.length;
  if (nextSectionMatch?.index !== undefined) {
    endIndex = Math.min(endIndex, nextSectionMatch.index);
  }
  if (nextHr?.index !== undefined) {
    endIndex = Math.min(endIndex, nextHr.index);
  }

  const rawContent = afterHeading.slice(0, endIndex).trim();

  if (!rawContent || rawContent.length < 10) return null;

  return rawContent;
}
