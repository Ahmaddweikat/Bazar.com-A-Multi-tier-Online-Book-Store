const express = require("express");
const axios = require("axios");
const { getLog, updateLog } = require("./log/utils");
const { v4: uuidv4 } = require("uuid");
const app = express();

const PORT = 3002;
const CATALOG_SERVER_URL = "http://catalog-server:3001";

app.get("/", (req, res) => {
  res.send("Order server is running");
});

app.post("/purchase/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const requestURL = `${CATALOG_SERVER_URL}/purchase/${bookId}`;

  try {
    const response = await axios.post(requestURL);

    const order = {
      orderNumber: uuidv4(),
      bookId,
      date: new Date(),
    };

    const log = await getLog();
    log.push(order);
    await updateLog(log);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status).send(err.response?.data);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
