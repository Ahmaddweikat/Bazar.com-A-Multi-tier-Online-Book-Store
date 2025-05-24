const jsonfile = require("jsonfile");

const FILE_PATH = "./log/log.json";

function getLog() {
  return new Promise((resolve, reject) => {
    jsonfile.readFile(FILE_PATH, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function updateLog(log) {
  return new Promise((resolve, reject) => {
    jsonfile.writeFile(FILE_PATH, log, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  getLog,
  updateLog,
};
