const axios = require("axios");

const timeout = Number(process.env.SCRAPER_TIMEOUT_MS || 30000);
const retries = Number(process.env.SCRAPER_RETRIES || 2);

const client = axios.create({
  timeout,
  maxRedirects: 8,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; ExamEligibilityScraper/1.0; +https://github.com/Vaibh37/exam-eligibility-scraper)",
    Accept:
      "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8"
  },
  validateStatus: status => status >= 200 && status < 400
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(url, responseType) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await client.get(url, { responseType });
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const retryable =
        !status || status === 408 || status === 429 || status >= 500;

      if (!retryable || attempt === retries) throw error;

      const retryAfter = Number(error.response?.headers?.["retry-after"]);
      const waitMs = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : 700 * 2 ** attempt;

      await sleep(waitMs);
    }
  }

  throw lastError;
}

function finalUrl(response, fallback) {
  return (
    response.request?.res?.responseUrl ||
    response.request?._redirectable?._currentUrl ||
    fallback
  );
}

async function getText(url) {
  const response = await request(url, "text");

  return {
    status: response.status,
    url: finalUrl(response, url),
    contentType: String(response.headers["content-type"] || ""),
    data: response.data
  };
}

async function getBuffer(url) {
  const response = await request(url, "arraybuffer");

  return {
    status: response.status,
    url: finalUrl(response, url),
    contentType: String(response.headers["content-type"] || ""),
    data: Buffer.from(response.data)
  };
}

module.exports = { getText, getBuffer, sleep };
