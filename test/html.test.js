const test = require("node:test");
const assert = require("node:assert/strict");
const { parseHtml } = require("../src/core/html");

test("parseHtml returns absolute links and surrounding context", () => {
  const html = `
    <html>
      <head><title>Bulletins</title></head>
      <body>
        <table>
          <tr>
            <td>JEE Main Information Bulletin 2026</td>
            <td><a href="/files/jee-2026.pdf">View</a></td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const parsed = parseHtml(html, "https://example.org/info/");

  assert.equal(parsed.title, "Bulletins");
  assert.equal(parsed.links.length, 1);
  assert.equal(
    parsed.links[0].url,
    "https://example.org/files/jee-2026.pdf"
  );
  assert.match(parsed.links[0].context, /Information Bulletin 2026/);
});
