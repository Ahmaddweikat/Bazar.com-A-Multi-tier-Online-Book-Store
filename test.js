const axios = require("axios");

const TEST_URL = "http://localhost:3001/info/1";

async function timeRequest(label) {
  const start = Date.now();
  try {
    const res = await axios.get(TEST_URL);
    const duration = Date.now() - start;
    console.log(`${label} - Time: ${duration}ms`);
    return res.data;
  } catch (err) {
    console.error(`${label} - Error:`, err.message);
  }
}

async function test() {
  console.log("=== Uncached Test (first request) ===");
  await timeRequest("First request");

  console.log("=== Cached Test (second request) ===");
  await timeRequest("Second request");

  console.log("=== Clear cache via restart or invalidation ===");

  // Optional: manually invalidate
  await axios.post("http://localhost:3000/invalidate/1");

  console.log("=== After Cache Invalidate ===");
  await timeRequest("After invalidation");
}

test();
