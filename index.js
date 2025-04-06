const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;

const CATALOG_SERVER_URL = "http://catalog-server:3001";
const ORDER_SERVER_URL = "http://order-server:3002";

app.get("/", (req, res) => {
  res.send("Gateway server is running");
});

app.get("/search/:topic", (req, res) => {
  const topic = req.params.topic;
  const requestURL = `${CATALOG_SERVER_URL}/search/${encodeURIComponent(
    topic
  )}`;

  axios
    .get(requestURL)
    .then((response) => res.json(response.data))
    .catch((error) =>
      res.status(error.response.status).json(error.response.data)
    );
});

app.get("/info/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const requestURL = `${CATALOG_SERVER_URL}/info/${bookId}`;

  axios
    .get(requestURL)
    .then((response) => res.json(response.data))
    .catch((error) =>
      res.status(error.response.status).json(error.response.data)
    );
});

app.post("/purchase/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const requestURL = `${ORDER_SERVER_URL}/purchase/${bookId}`;

  axios
    .post(requestURL)
    .then((response) => res.json(response.data))
    .catch((error) =>
      res.status(error.response.status).json(error.response.data)
    );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
