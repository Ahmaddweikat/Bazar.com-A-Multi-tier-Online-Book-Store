// orderServer/index.js
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3002;

const DB_PATH = path.join(__dirname, "log", "log.json");
const PEER_REPLICA = process.env.PEER_REPLICA || "http://localhost:3004";
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

function readLog() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    if (!data.orders) return { orders: [] };
    return data;
  } catch (e) {
    return { orders: [] };
  }
}

function writeLog(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.post("/purchase/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  console.log(`📥 Received purchase request for book ${bookId}`);

  try {
    const log = readLog();
    log.orders.push({ bookId, time: new Date().toISOString() });
    writeLog(log);

    console.time("Invalidate Cache");
    await axios
      .post(`${GATEWAY_URL}/invalidate/${bookId}`, {}, { timeout: 500 })
      .catch((err) => {
        console.warn("⚠️ Invalidate cache failed:", err.message);
      });
    console.timeEnd("Invalidate Cache");

    console.time("Sync Replica");
    await axios
      .post(`${PEER_REPLICA}/sync-purchase/${bookId}`, {}, { timeout: 500 })
      .catch((err) => {
        console.warn("⚠️ Sync replica failed:", err.message);
      });
    console.timeEnd("Sync Replica");

    console.time("Update Stock");
    await axios
      .post(
        `http://localhost:3001/update-stock/${bookId}/-1`,
        {},
        { timeout: 500 }
      )
      .catch((err) => {
        console.warn("⚠️ Stock update failed:", err.message);
      });
    console.timeEnd("Update Stock");

    res.json({ message: `Purchase recorded for book ${bookId}` });
  } catch (err) {
    console.error("❌ Purchase error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/sync-purchase/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  console.log(`🔁 Sync request received for book ${bookId}`);

  try {
    const log = readLog();
    log.orders.push({ bookId, time: new Date().toISOString(), synced: true });
    writeLog(log);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Order server running on port ${PORT}`);
});
