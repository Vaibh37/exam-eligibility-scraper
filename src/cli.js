const fs = require("fs");
const path = require("path");
const {
  scrapeExam,
  scrapeAll,
  listExams,
  evaluateExam,
  evaluateAll,
  profileSchema
} = require("./index");

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

function readProfile(filePath) {
  const absolute = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

async function scrapeCommand(target) {
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

    if (results.every(result => !result.ok)) process.exitCode = 1;
    return;
  }

  console.log(`Scraping ${target}...`);
  const result = await scrapeExam(target);
  const file = writeJson(`${target}.json`, result);

  console.log(`✓ ${result.name}`);
  console.log(`Source: ${result.source.documentUrl}`);
  console.log(`Saved: ${file}`);
}

function eligibilityCommand(args) {
  const profilePath = args[0];

  if (!profilePath) {
    console.error("Usage: npm run eligibility -- <profile.json> [exam-id]");
    console.error("Profile shape:");
    console.error(JSON.stringify(profileSchema, null, 2));
    process.exitCode = 1;
    return;
  }

  const profile = readProfile(profilePath);
  const examId = args[1];

  const result = examId
    ? evaluateExam(examId, profile)
    : evaluateAll(profile);

  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  const [command = "scrape", ...args] = process.argv.slice(2);

  if (command === "list") {
    console.table(listExams());
    return;
  }

  if (command === "eligibility" || command === "check") {
    eligibilityCommand(args);
    return;
  }

  if (command === "schema") {
    console.log(JSON.stringify(profileSchema, null, 2));
    return;
  }

  if (command === "scrape") {
    await scrapeCommand(args[0] || "all");
    return;
  }

  await scrapeCommand(command);
}

main().catch(error => {
  console.error("Command failed:", error.message);
  process.exitCode = 1;
});
