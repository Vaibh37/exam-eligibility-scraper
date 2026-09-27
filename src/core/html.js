const cheerio = require("cheerio");

function toAbsoluteUrl(href, baseUrl) {
  if (!href) return null;

  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

function cleanInline(value = "") {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function parseHtml(html, baseUrl) {
  const $ = cheerio.load(html);

  const title = cleanInline($("title").first().text()) || null;
  const description =
    cleanInline($('meta[name="description"]').attr("content")) ||
    cleanInline($('meta[property="og:description"]').attr("content")) ||
    null;

  const links = [];

  $("a[href]").each((_, element) => {
    const $element = $(element);
    const url = toAbsoluteUrl($element.attr("href"), baseUrl);
    if (!url) return;

    const text = cleanInline($element.text());
    const rowContext = cleanInline(
      $element.closest("tr, li, p, article, section, div").first().text()
    ).slice(0, 800);

    links.push({
      text,
      context: rowContext || text,
      url
    });
  });

  $("script, style, noscript, svg").remove();

  const text = $("body")
    .text()
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

  return { title, description, links, text };
}

module.exports = { parseHtml, toAbsoluteUrl, cleanInline };
