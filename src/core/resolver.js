const { getText } = require("./http");
const { parseHtml } = require("./html");

function isPdfUrl(url = "") {
  return /\.pdf(?:$|[?#])/i.test(url);
}

function scoreLink(link, source) {
  const haystack = [
    link.text || "",
    link.context || "",
    link.url || ""
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  for (const term of source.candidateTerms || []) {
    if (haystack.includes(term.toLowerCase())) score += 6;
  }

  if (source.year && haystack.includes(String(source.year))) score += 5;
  if (haystack.includes("information bulletin")) score += 9;
  if (haystack.includes("information brochure")) score += 8;
  if (haystack.includes("accessible version")) score += 3;
  if (/\b(download|view)\b/.test(haystack)) score += 2;
  if (isPdfUrl(link.url)) score += 5;

  const years = haystack.match(/20\d{2}/g) || [];
  if (
    source.year &&
    years.length &&
    years.every(year => year !== String(source.year))
  ) {
    score -= 8;
  }

  return score;
}

function rankLinks(links, source) {
  return links
    .map(link => ({ ...link, score: scoreLink(link, source) }))
    .filter(link => link.score > 0)
    .sort((a, b) => b.score - a.score);
}

function fallback(source, cause) {
  if (!source.fallbackDocumentUrl) throw cause;

  return {
    url: source.fallbackDocumentUrl,
    type: isPdfUrl(source.fallbackDocumentUrl) ? "pdf" : "unknown",
    discoveredFrom: source.discoveryPage || null,
    usedFallback: true,
    discoveryError: cause?.message || null
  };
}

async function discoverDocument(source) {
  const listingResponse = await getText(source.discoveryPage);
  const listing = parseHtml(listingResponse.data, listingResponse.url);
  const ranked = rankLinks(listing.links, source);

  if (!ranked.length) {
    throw new Error(
      `No bulletin/brochure candidate found for ${source.name} at ${source.discoveryPage}`
    );
  }

  const candidate = ranked[0];

  if (isPdfUrl(candidate.url)) {
    return {
      url: candidate.url,
      type: "pdf",
      discoveredFrom: listingResponse.url,
      usedFallback: false
    };
  }

  const candidateResponse = await getText(candidate.url);

  if (/application\/pdf/i.test(candidateResponse.contentType)) {
    return {
      url: candidateResponse.url,
      type: "pdf",
      discoveredFrom: listingResponse.url,
      usedFallback: false
    };
  }

  const candidatePage = parseHtml(candidateResponse.data, candidateResponse.url);
  const nested = rankLinks(candidatePage.links, source);

  const pdf = nested.find(link => isPdfUrl(link.url));
  if (pdf) {
    return {
      url: pdf.url,
      type: "pdf",
      discoveredFrom: candidateResponse.url,
      usedFallback: false
    };
  }

  const likelyDownload = candidatePage.links
    .map(link => {
      const haystack = `${link.text} ${link.context} ${link.url}`.toLowerCase();
      let score = 0;
      if (haystack.includes("accessible version")) score += 5;
      if (haystack.includes("download")) score += 4;
      if (/\bview\b/.test(haystack)) score += 2;
      return { ...link, score };
    })
    .filter(link => link.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (likelyDownload) {
    return {
      url: likelyDownload.url,
      type: isPdfUrl(likelyDownload.url) ? "pdf" : "unknown",
      discoveredFrom: candidateResponse.url,
      usedFallback: false
    };
  }

  return {
    url: candidateResponse.url,
    type: "html",
    discoveredFrom: listingResponse.url,
    usedFallback: false
  };
}

async function resolveDocument(source) {
  if (source.documentUrl) {
    return {
      url: source.documentUrl,
      type: source.documentType || (isPdfUrl(source.documentUrl) ? "pdf" : "html"),
      discoveredFrom: null,
      usedFallback: false
    };
  }

  try {
    return await discoverDocument(source);
  } catch (error) {
    return fallback(source, error);
  }
}

module.exports = {
  isPdfUrl,
  scoreLink,
  rankLinks,
  resolveDocument
};
