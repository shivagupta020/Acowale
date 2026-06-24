const crypto = require("node:crypto");
const config = require("./config");

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
};

const sign = (payload) =>
  crypto
    .createHmac("sha256", config.sessionSecret)
    .update(payload)
    .digest("base64url");

const createToken = () => {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", exp: Date.now() + config.sessionHours * 3600000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

const verifyToken = (token = "") => {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return decoded.role === "admin" && decoded.exp > Date.now();
  } catch {
    return false;
  }
};

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!verifyToken(token)) {
    return res.status(401).json({ success: false, message: "Admin authentication required" });
  }
  next();
};

module.exports = { safeEqual, createToken, verifyToken, requireAdmin };
