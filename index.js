<<<<<<< HEAD
const readline = require("readline");
const fs = require("fs");
// Sample books data (you can replace this with a database or file system)
let books = JSON.parse(
  fs.readFileSync("./catalogServer/db/database.json", "utf8")
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function displayMenu() {
  console.log("\n=== Book Management System ===");
  console.log("1. Show Books");
  console.log("2. Search for Book");
  console.log("3. Info (Search by ID)");
  console.log("4. Purchase Book");
  console.log("5. Exit");
  console.log("==========================");
}

function showBooks() {
  console.log("\nAvailable Books:");
  books.forEach((book) => {
    console.log(
      `ID: ${book.ID} | Title: ${book.title} | Topic: ${book.topic} | Quantity: ${book.quantity} | Price: $${book.price}`
    );
  });
}

function searchBook() {
  rl.question("\nEnter book topic or title to search: ", (search) => {
    const searchTerm = search.toLowerCase();
    const results = books.filter(
      (book) =>
        book.topic.toLowerCase().includes(searchTerm) ||
        book.title.toLowerCase().includes(searchTerm)
    );

    if (results.length > 0) {
      console.log("\nSearch Results:");
      results.forEach((book) => {
        console.log(
          `ID: ${book.ID} | Title: ${book.title} | Quantity: ${book.quantity} | Price: $${book.price}`
        );
      });
    } else {
      console.log("No books found matching your search.");
    }
    mainMenu();
  });
}

function getBookInfo() {
  rl.question("\nEnter book ID: ", (ID) => {
    const book = books.find((b) => b.ID === parseInt(ID));
    if (book) {
      console.log("\nBook Information:");
      console.log(`ID: ${book.ID}`);
      console.log(`Title: ${book.title}`);
      console.log(`Topic: ${book.topic}`);
      console.log(`Quantity: ${book.quantity}`);
      console.log(`Price: $${book.price}`);
    } else {
      console.log("Book not found.");
    }
    mainMenu();
  });
}

function purchaseBook() {
  rl.question("Enter book ID to purchase: ", (ID) => {
    const book = books.find((b) => b.ID === parseInt(ID));
    if (book) {
      if (book.quantity > 0) {
        book.quantity--;
        console.log("\nPurchase successful!");
        console.log(`You bought "${book.title}" for $${book.price}`);
        console.log(`Remaining quantity: ${book.quantity}`);
      } else {
        console.log("Sorry, this book is out of stock.");
      }
    } else {
      console.log("Book not found.");
    }
    mainMenu();
  });
}

function mainMenu() {
  displayMenu();
  rl.question("Select an option (1-5): ", (choice) => {
    switch (choice) {
      case "1":
        showBooks();
        mainMenu();
        break;
      case "2":
        searchBook();
        break;
      case "3":
        getBookInfo();
        break;
      case "4":
        purchaseBook();
        break;
      case "5":
        console.log(
          "Thank you for using the Bazar.com Book Management System. Goodbye!"
        );
        rl.close();
        break;
      default:
        console.log("Invalid option. Please try again.");
        mainMenu();
        break;
    }
  });
}

// Start the application
console.log("Welcome to the Bazar.com Book Management System!");
mainMenu();
=======
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
>>>>>>> d8f9a1204f23ab65627c9e25ccdf2975630d6d37
