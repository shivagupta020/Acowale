const path = require("node:path");

const parseOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const config = {
  port: Number.parseInt(process.env.PORT || "5001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  allowedOrigins: parseOrigins(
    process.env.ALLOWED_ORIGINS || "http://localhost:5173",
  ),
  adminPassword: process.env.ADMIN_PASSWORD || "change-me-in-production",
  sessionSecret: process.env.SESSION_SECRET || "local-development-secret",
  sessionHours: Number.parseInt(process.env.SESSION_HOURS || "8", 10),
  dataFile:
    process.env.DATA_FILE || path.join(__dirname, "../data/feedback.json"),
};

if (config.nodeEnv === "production") {
  const insecure = [];
  if (config.adminPassword === "change-me-in-production") insecure.push("ADMIN_PASSWORD");
  if (config.sessionSecret === "local-development-secret") insecure.push("SESSION_SECRET");
  if (insecure.length) {
    throw new Error(`Production requires secure values for: ${insecure.join(", ")}`);
  }
}

module.exports = config;
