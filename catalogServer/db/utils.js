const jsonfile = require("jsonfile");
const FILE_PATH = "./db/database.json";

function getDatabase() {
  return new Promise((resolve, reject) => {
    jsonfile.readFile(FILE_PATH, (err, database) => {
      if (err) {
        reject(err);
      } else {
        resolve(database);
      }
    });
  });
}

function updateDatabase(database) {
  return new Promise((resolve, reject) => {
    jsonfile.writeFile(FILE_PATH, database, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = { getDatabase, updateDatabase };
