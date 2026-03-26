import { google } from "googleapis";
import { logger } from "../lib/logger";

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  const connData = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=google-calendar",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connData?.settings?.access_token ||
    connData?.settings?.oauth?.credentials?.access_token;

  if (!connData || !accessToken) {
    throw new Error("Google Calendar not connected");
  }
  return accessToken;
}

export async function getUncachableCalendarClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function listUpcomingEvents(maxResults = 10) {
  const calendar = await getUncachableCalendarClient();
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });
  logger.info({ count: res.data.items?.length }, "Fetched calendar events");
  return res.data.items || [];
}

export async function createEvent(summary: string, start: string, end: string, description?: string) {
  const calendar = await getUncachableCalendarClient();
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary,
      description,
      start: { dateTime: start, timeZone: "America/New_York" },
      end: { dateTime: end, timeZone: "America/New_York" },
    },
  });
  logger.info({ eventId: res.data.id, summary }, "Calendar event created");
  return res.data;
}

export async function getEventById(eventId: string) {
  const calendar = await getUncachableCalendarClient();
  const res = await calendar.events.get({
    calendarId: "primary",
    eventId,
  });
  return res.data;
}
