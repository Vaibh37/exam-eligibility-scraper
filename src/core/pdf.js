const pdf = require("pdf-parse");

async function parsePdf(buffer) {
  const result = await pdf(buffer);

  return {
    pages: result.numpages || null,
    info: result.info || {},
    text: result.text || ""
  };
}

module.exports = { parsePdf };
