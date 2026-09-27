const { scrapeExam, scrapeAll, listExams } = require("./core/scrape");
const sources = require("./config/sources");
const {
  evaluateExam,
  evaluateAll,
  listEligibilityRules
} = require("./eligibility/evaluate");
const { normalizeProfile } = require("./eligibility/profile");
const { profileSchema, exampleProfile } = require("./eligibility/schema");

module.exports = {
  scrapeExam,
  scrapeAll,
  listExams,
  sources,
  evaluateExam,
  evaluateAll,
  listEligibilityRules,
  normalizeProfile,
  profileSchema,
  exampleProfile
};
