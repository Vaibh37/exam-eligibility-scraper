const crypto = require("crypto");
const sources = require("../config/sources");
const { getBuffer, sleep } = require("./http");
const { parseHtml } = require("./html");
const { parsePdf } = require("./pdf");
const { normalizeText } = require("./normalize");
const { resolveDocument, isPdfUrl } = require("./resolver");
const { extractInformation } = require("./extract");

async function readResolvedDocument(resolved) {
  const response = await getBuffer(resolved.url);
  const contentType = response.contentType.toLowerCase();
  const pdfLike =
    resolved.type === "pdf" ||
    contentType.includes("application/pdf") ||
    isPdfUrl(response.url);

  const sha256 = crypto
    .createHash("sha256")
    .update(response.data)
    .digest("hex");

  if (pdfLike) {
    const parsed = await parsePdf(response.data);
    return {
      url: response.url,
      type: "pdf",
      status: response.status,
      title: parsed.info?.Title || null,
      pages: parsed.pages,
      sha256,
      bytes: response.data.length,
      text: normalizeText(parsed.text)
    };
  }

  const html = response.data.toString("utf8");
  const parsed = parseHtml(html, response.url);

  return {
    url: response.url,
    type: "html",
    status: response.status,
    title: parsed.title,
    pages: null,
    sha256,
    bytes: response.data.length,
    text: normalizeText(parsed.text)
  };
}

function listExams() {
  return Object.values(sources).map(source => ({
    id: source.id,
    name: source.name,
    conductingBody: source.conductingBody,
    officialWebsite: source.officialWebsite,
    year: source.year
  }));
}

async function scrapeExam(id) {
  const source = sources[id];
  if (!source) {
    const available = Object.keys(sources).join(", ");
    throw new Error(`Unknown exam "${id}". Available: ${available}`);
  }

  const resolved = await resolveDocument(source);
  const document = await readResolvedDocument(resolved);

  if (!document.text || document.text.length < 100) {
    throw new Error(
      `Source document for ${source.name} returned too little readable text`
    );
  }

  const extracted = extractInformation(document.text);

  return {
    id: source.id,
    name: source.name,
    conductingBody: source.conductingBody,
    officialWebsite: source.officialWebsite,
    year: source.year,
    source: {
      discoveryPage: source.discoveryPage || null,
      discoveredFrom: resolved.discoveredFrom,
      documentUrl: document.url,
      documentType: document.type,
      httpStatus: document.status,
      usedFallback: Boolean(resolved.usedFallback),
      discoveryError: resolved.discoveryError || null
    },
    document: {
      title: document.title,
      pages: document.pages,
      bytes: document.bytes,
      sha256: document.sha256,
      extractedTextLength: document.text.length
    },
    ...extracted,
    scrapedAt: new Date().toISOString()
  };
}

async function scrapeAll() {
  const delay = Number(process.env.SCRAPER_BATCH_DELAY_MS || 1200);
  const results = [];

  for (const id of Object.keys(sources)) {
    try {
      const data = await scrapeExam(id);
      results.push({ ok: true, data });
    } catch (error) {
      results.push({
        ok: false,
        id,
        error: error.message
      });
    }

    if (delay > 0) await sleep(delay);
  }

  return results;
}

module.exports = { scrapeExam, scrapeAll, listExams };
