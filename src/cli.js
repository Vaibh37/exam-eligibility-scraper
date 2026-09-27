const fs = require("fs");
const path = require("path");
const { scrapeExam, scrapeAll, listExams } = require("./index");

function ensureOutputDir() {
  const dir = path.join(process.cwd(), "output");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeJson(filename, data) {
  const dir = ensureOutputDir();
  const target = path.join(dir, filename);
  fs.writeFileSync(target, JSON.stringify(data, null, 2), "utf8");
  return target;
}

async function main() {
  const target = process.argv[2] || "all";

  if (target === "list") {
    console.table(listExams());
    return;
  }

  if (target === "all") {
    console.log("Scraping all configured exams...");
    const results = await scrapeAll();
    const file = writeJson("all-exams.json", results);

    for (const result of results) {
      if (result.ok) {
        console.log(
          `✓ ${result.data.name} -> ${result.data.source.documentUrl}`
        );
      } else {
        console.error(`✗ ${result.id}: ${result.error}`);
      }
    }

    console.log(`\nSaved ${file}`);

    if (results.every(result => !result.ok)) {
      process.exitCode = 1;
    }
    return;
  }

  console.log(`Scraping ${target}...`);
  const result = await scrapeExam(target);
  const file = writeJson(`${target}.json`, result);

  console.log(`✓ ${result.name}`);
  console.log(`Source: ${result.source.documentUrl}`);
  console.log(`Saved: ${file}`);
}

main().catch(error => {
  console.error("Scraper failed:", error.message);
  process.exitCode = 1;
});
