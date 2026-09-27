const express = require("express");
const { scrapeExam, scrapeAll, listExams, sources } = require("./index");

const app = express();
const port = Number(process.env.PORT || 3001);

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));

app.get("/health", (_, res) => {
  res.json({
    ok: true,
    service: "exam-eligibility-scraper",
    time: new Date().toISOString()
  });
});

app.get("/api/exams", (_, res) => {
  res.json({ exams: listExams() });
});

app.get("/api/exams/:id", (req, res) => {
  const source = sources[req.params.id];

  if (!source) {
    return res.status(404).json({
      error: "Unknown exam",
      available: Object.keys(sources)
    });
  }

  return res.json({
    id: source.id,
    name: source.name,
    conductingBody: source.conductingBody,
    officialWebsite: source.officialWebsite,
    year: source.year
  });
});

app.post("/api/scrape/:id", async (req, res, next) => {
  try {
    const result = await scrapeExam(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/scrape", async (_, res, next) => {
  try {
    const results = await scrapeAll();
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  const unknownExam = /^Unknown exam/.test(error.message);

  res.status(unknownExam ? 404 : 502).json({
    error: error.message
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Exam Eligibility Scraper API listening on http://localhost:${port}`
    );
  });
}

module.exports = app;
