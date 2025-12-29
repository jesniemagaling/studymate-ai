const pdfParse = require('pdf-parse');

export async function extractTextFromPDF(buffer: Buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}
