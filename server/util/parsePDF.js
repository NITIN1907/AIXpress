// util/parsePDF.js  (keep this one)
const { PdfReader } = require("pdfreader");
function parsePDF(buffer) {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer)) {
      return reject(new Error("parsePDF expects a Buffer"));
    }

    let fullText = "";
    const reader = new PdfReader();

    reader.parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
        return;
      }

      if (!item) {
        // End of document
        resolve(fullText.trim());
        return;
      }

      if (item.text) {
        fullText += item.text + "\n";   // \n is usually better than space
      }
    });
  });
}

module.exports = parsePDF;