const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const config = require("./config");

const seedFeedback = [
  {
    id: randomUUID(),
    name: "Maya Chen",
    email: "maya@example.com",
    category: "Product",
    rating: 5,
    comments: "The new workspace makes weekly planning much easier for our team.",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: randomUUID(),
    name: "Anonymous",
    email: "",
    category: "Support",
    rating: 4,
    comments: "Quick response from support. A searchable help centre would be useful too.",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: randomUUID(),
    name: "Arjun Rao",
    email: "arjun@example.com",
    category: "Feature request",
    rating: 3,
    comments: "Please add CSV exports for monthly reports.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ensureStore = () => {
  fs.mkdirSync(path.dirname(config.dataFile), { recursive: true });
  if (!fs.existsSync(config.dataFile)) {
    fs.writeFileSync(config.dataFile, JSON.stringify(seedFeedback, null, 2));
  }
};

const readAll = () => {
  ensureStore();
  const raw = fs.readFileSync(config.dataFile, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Feedback data store is invalid");
  return data;
};

const saveAll = (feedback) => {
  const temporaryFile = `${config.dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(feedback, null, 2));
  fs.renameSync(temporaryFile, config.dataFile);
};

const add = (input) => {
  const feedback = readAll();
  const record = {
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  feedback.push(record);
  saveAll(feedback);
  return record;
};

module.exports = { readAll, add, ensureStore };
