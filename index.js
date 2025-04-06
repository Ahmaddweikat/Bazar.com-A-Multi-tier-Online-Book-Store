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
