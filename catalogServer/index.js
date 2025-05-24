const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;

const DB_PATH = path.join(__dirname, "db", "database.json");
const PEER_REPLICA = process.env.PEER_REPLICA || "http://catalog-server-2:3003";
const GATEWAY_URL = process.env.GATEWAY_URL || "http://gateway-server:3000";

// Track seen book IDs and topics independently
let seenInfoIds = new Set();
let seenSearchTopics = new Set();

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Search books by topic

// /info/:id
app.get("/info/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const db = readDB();
  const book = db.books.find((b) => b.id === bookId);

  if (!seenInfoIds.has(bookId)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    seenInfoIds.add(bookId);
  }

  // Mark the topic as seen
  if (book) {
    seenSearchTopics.add(book.topic.toLowerCase());
    res.json(book);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// /search/:topic
app.get("/search/:topic", async (req, res) => {
  const topic = req.params.topic.toLowerCase();
  const db = readDB();
  const result = db.books.filter((b) => b.topic.toLowerCase() === topic);

  if (!seenSearchTopics.has(topic)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    seenSearchTopics.add(topic);
  }

  // Mark all related book IDs as seen
  result.forEach((book) => seenInfoIds.add(book.id));

  res.json(result);
});
// Update stock
app.post("/update-stock/:id/:quantity", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const quantity = parseInt(req.params.quantity);
  const db = readDB();
  const book = db.books.find((b) => b.id === bookId);

  if (!book) return res.status(404).json({ error: "Book not found" });
  book.stock += quantity;
  writeDB(db);

  await axios.post(`${GATEWAY_URL}/invalidate/${bookId}`).catch(() => {});
  await axios
    .post(`${PEER_REPLICA}/sync-update-stock/${bookId}/${quantity}`)
    .catch(() => {});

  res.json({ message: "Stock updated" });
});

// Replica sync endpoint
app.post("/sync-update-stock/:id/:quantity", (req, res) => {
  const bookId = parseInt(req.params.id);
  const quantity = parseInt(req.params.quantity);
  const db = readDB();
  const book = db.books.find((b) => b.id === bookId);
  if (book) {
    book.stock += quantity;
    writeDB(db);
  }
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Catalog server running on ${PORT}`));
