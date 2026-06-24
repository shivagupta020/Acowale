const express = require("express");
const cors = require("cors");
require("dotenv").config();

const config = require("./config");
const logger = require("./logger");
const store = require("./store");
const { safeEqual, createToken, requireAdmin } = require("./auth");
const { categories, validateFeedback } = require("./validation");

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.info("request.completed", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "Acowale Feedback API", docs: "/api/health" });
});

app.get("/api/health", (req, res) => {
  store.ensureStore();
  res.json({
    success: true,
    status: "healthy",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/categories", (req, res) => {
  res.json({ success: true, data: categories });
});

app.post("/api/auth/login", (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!safeEqual(password, config.adminPassword)) {
    return res.status(401).json({ success: false, message: "Incorrect password" });
  }
  res.json({
    success: true,
    data: { token: createToken(), expiresInHours: config.sessionHours },
  });
});

app.get("/api/auth/me", requireAdmin, (req, res) => {
  res.json({ success: true, data: { role: "admin" } });
});

app.post("/api/feedback", (req, res) => {
  const result = validateFeedback(req.body);
  if (!result.valid) {
    return res.status(422).json({
      success: false,
      message: "Please correct the highlighted fields",
      errors: result.errors,
    });
  }
  const feedback = store.add(result.value);
  res.status(201).json({
    success: true,
    message: "Thank you—your feedback has been received",
    data: feedback,
  });
});

app.get("/api/feedback", requireAdmin, (req, res) => {
  const category = String(req.query.category || "");
  const query = String(req.query.q || "").trim().toLowerCase().slice(0, 100);
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);

  let results = store.readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (category && category !== "All") results = results.filter((item) => item.category === category);
  if (query) {
    results = results.filter((item) =>
      [item.name, item.email, item.category, item.comments]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }
  const total = results.length;
  const start = (page - 1) * limit;
  res.json({
    success: true,
    data: results.slice(start, start + limit),
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
  });
});

app.get("/api/analytics/summary", requireAdmin, (req, res) => {
  const feedback = store.readAll();
  const categoryDistribution = categories.map((category) => ({
    category,
    count: feedback.filter((item) => item.category === category).length,
  }));
  const ratings = feedback.map((item) => item.rating).filter(Number.isFinite);
  const averageRating = ratings.length
    ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
    : 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = feedback.filter((item) => new Date(item.createdAt).getTime() >= weekAgo).length;

  res.json({
    success: true,
    data: {
      total: feedback.length,
      averageRating,
      thisWeek,
      categoryDistribution,
      recent: feedback
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.use((error, req, res, next) => {
  logger.error("request.failed", {
    method: req.method,
    path: req.originalUrl,
    error: error.message,
  });
  if (res.headersSent) return next(error);
  const status = error.type === "entity.too.large" ? 413 : error.message.includes("CORS") ? 403 : 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "An unexpected server error occurred" : error.message,
  });
});
const PORT = process.env.PORT || config.port || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
  logger.info("server.started", {
    port: PORT,
    environment: config.nodeEnv,
  });
});
}

module.exports = app;
