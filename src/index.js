const { scrapeExam, scrapeAll, listExams } = require("./core/scrape");
const sources = require("./config/sources");

module.exports = {
  scrapeExam,
  scrapeAll,
  listExams,
  sources
};
