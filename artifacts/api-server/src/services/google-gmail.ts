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
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=google-mail",
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
    throw new Error("Google Mail not connected");
  }
  return accessToken;
}

export async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function sendEmail(to: string, subject: string, body: string) {
  const gmail = await getUncachableGmailClient();
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${body}`,
  ).toString("base64url");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  logger.info({ messageId: result.data.id, to }, "Email sent via Gmail");
  return result.data;
}

export async function listEmails(maxResults = 10) {
  const gmail = await getUncachableGmailClient();
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    labelIds: ["INBOX"],
  });
  return res.data.messages || [];
}

export async function getEmailById(messageId: string) {
  const gmail = await getUncachableGmailClient();
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return res.data;
}
