import dotenv from "dotenv";
import { IMAPAccount } from "../types";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  features: {
    elasticsearch: process.env.ENABLE_ELASTICSEARCH !== "false", // enabled by default
    vectorDB: process.env.ENABLE_VECTOR_DB !== "false", // enabled by default
    aiLabeling: process.env.ENABLE_AI_LABELING !== "false", // enabled by default
    webhooks: process.env.ENABLE_WEBHOOKS !== "false", // enabled by default
    realtime: process.env.ENABLE_REALTIME === "true", // disabled by default
  },

  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  },

  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
  },

  webhooks: {
    slack: process.env.SLACK_WEBHOOK_URL || "",
    generic: process.env.WEBHOOK_SITE_URL || "",
    bookingLink: process.env.BOOKING_LINK || "https://cal.com/example",
  },

  rateLimit: {
    geminiCallsPerMinute: parseInt(
      process.env.GEMINI_CALLS_PER_MINUTE || "15",
      10
    ),
  },
};

export function getIMAPAccounts(): IMAPAccount[] {
  const accounts: IMAPAccount[] = [];

  if (process.env.IMAP_USER_1 && process.env.IMAP_PASSWORD_1) {
    accounts.push({
      user: process.env.IMAP_USER_1,
      password: process.env.IMAP_PASSWORD_1,
      host: process.env.IMAP_HOST_1 || "imap.gmail.com",
      port: parseInt(process.env.IMAP_PORT_1 || "993", 10),
      tls: true,
    });
  }

  if (process.env.IMAP_USER_2 && process.env.IMAP_PASSWORD_2) {
    accounts.push({
      user: process.env.IMAP_USER_2,
      password: process.env.IMAP_PASSWORD_2,
      host: process.env.IMAP_HOST_2 || "imap.gmail.com",
      port: parseInt(process.env.IMAP_PORT_2 || "993", 10),
      tls: true,
    });
  }

  return accounts;
}
