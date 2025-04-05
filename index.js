const express = require("express");
const { getDatabase, updateDatabase } = require("./db/utils");
const app = express();

app.get("/", (req, res) => {
  res.send("Catalog server is running");
});

app.get("/search/:topic", (req, res) => {
  const topic = req.params.topic;

  getDatabase().then((database) => {
    const books = database?.filter((book) => book.topic === topic);
    if (books.length > 0) {
      res.send(books);
    } else {
      res.status(404).send({ message: "No books found" });
    }
  });
});

app.get("/info/:id", (req, res) => {
  const bookId = parseInt(req.params.id);

  getDatabase().then((database) => {
    const book = database?.find((book) => book.ID === bookId);
    if (book) {
      res.send(book);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  });
});

app.post("/purchase/:id", (req, res) => {
  const bookId = parseInt(req.params.id);

  getDatabase().then((database) => {
    const book = database?.find((book) => book.ID === bookId);
    if (book) {
      if (book.quantity > 0) {
        book.quantity--;
        updateDatabase(database)
          .then(() => res.send({ message: "Book purchased successfully" }))
          .catch(() =>
            res.status(500).send({ message: "Internal server error:" })
          );
      } else {
        res.status(400).send({ message: "Book out of stock" });
      }
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
