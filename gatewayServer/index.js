// gatewayServer/index.js
const express = require("express");
const axios = require("axios");
const LRU = require("lru-cache");
const app = express();
const PORT = 3000;

const catalogServers = ["http://localhost:3001", "http://localhost:3003"];
const orderServers = ["http://localhost:3002", "http://localhost:3004"];

let catalogIndex = 0;
let orderIndex = 0;

const cache = new LRU(100);

function getNextCatalogServer() {
  const server = catalogServers[catalogIndex];
  catalogIndex = (catalogIndex + 1) % catalogServers.length;
  return server;
}

function getNextOrderServer() {
  const server = orderServers[orderIndex];
  orderIndex = (orderIndex + 1) % orderServers.length;
  return server;
}

app.get("/", (req, res) => {
  res.send("Gateway server is running");
});

app.get("/search/:topic", async (req, res) => {
  const topic = req.params.topic;
  const cacheKey = `search:${topic}`;

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const response = await axios.get(
      `${getNextCatalogServer()}/search/${encodeURIComponent(topic)}`
    );
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/info/:id", async (req, res) => {
  const bookId = req.params.id;
  const cacheKey = `info:${bookId}`;

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const response = await axios.get(
      `${getNextCatalogServer()}/info/${bookId}`
    );
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Purchase (write - fault-tolerant with fallback)
app.post("/purchase/:id", async (req, res) => {
  const bookId = req.params.id;
  console.log(`📦 Gateway received purchase request for book ${bookId}`);

  const bookInfo = cache.get(`info:${bookId}`);
  if (bookInfo) {
    console.log(`⚡ Using cached info:`, bookInfo);
  }

  for (let i = 0; i < orderServers.length; i++) {
    const index = (orderIndex + i) % orderServers.length;
    const server = orderServers[index];
    try {
      console.log(`🔁 Trying order server: ${server}`);
      const response = await axios.post(
        `${server}/purchase/${bookId}`,
        {},
        { timeout: 1000 }
      );

      orderIndex = (index + 1) % orderServers.length; // rotate for next round
      console.log(`✅ Purchase processed by: ${server}`);
      return res.json(response.data);
    } catch (error) {
      console.error(`❌ Failed to use ${server}: ${error.message}`);
    }
  }

  res.status(500).json({ error: "All order servers failed" });
});

app.post("/invalidate/:id", (req, res) => {
  const bookId = req.params.id;
  const keys = [`info:${bookId}`, `search:*`];
  for (const key of keys) {
    if (cache.has(key)) {
      cache.del(key);
    }
  }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});
