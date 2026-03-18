import pdfParse from "pdf-parse";

export class PdfExtractionError extends Error {
  constructor(
    message: string,
    public readonly code: "MALFORMED_PDF" | "EMPTY_TEXT" | "UNKNOWN",
  ) {
    super(message);
    this.name = "PdfExtractionError";
  }
}

function normalizeRecoveredText(input: string) {
  return input
    .replace(/\\[nrtbf]/g, " ")
    .replace(/\\\(|\\\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function recoverTextFromPdfObjects(buffer: Buffer) {
  const source = buffer.toString("latin1");
  const chunks: string[] = [];

  // Extract common literal text objects from malformed PDFs.
  const literalRegex = /\(([^()]{2,})\)/g;
  let literalMatch: RegExpExecArray | null;
  while ((literalMatch = literalRegex.exec(source)) !== null) {
    const cleaned = normalizeRecoveredText(literalMatch[1]);
    if (cleaned.length > 4) {
      chunks.push(cleaned);
    }
  }

  // Fallback: extract readable lines when object text markers are absent.
  if (!chunks.length) {
    const lineChunks = source
      .split(/\r?\n/)
      .map((line) => normalizeRecoveredText(line))
      .filter((line) => /[A-Za-z]{3,}/.test(line))
      .filter((line) => line.length > 12)
      .slice(0, 800);

    chunks.push(...lineChunks);
  }

  const unique: string[] = [];
  for (const c of chunks) {
    if (!unique.includes(c)) {
      unique.push(c);
    }
  }

  return unique.join("\n").slice(0, 25000).trim();
}

export function extractTextFromPDFMalformedFallback(buffer: Buffer) {
  return recoverTextFromPdfObjects(buffer);
}

function sanitizePdfBuffer(buffer: Buffer) {
  // Some uploads include extra bytes before the PDF header that break xref parsing.
  const headerIndex = buffer.indexOf("%PDF-");
  if (headerIndex > 0) {
    return buffer.subarray(headerIndex);
  }
  return buffer;
}

export async function extractTextFromPDF(buffer: Buffer) {
  try {
    const parsed = await pdfParse(buffer);
    const text = String(parsed?.text || "").trim();
    if (!text) {
      throw new PdfExtractionError(
        "PDF was parsed but no readable text was found.",
        "EMPTY_TEXT",
      );
    }
    return text;
  } catch (rawError) {
    const sanitized = sanitizePdfBuffer(buffer);

    if (sanitized !== buffer) {
      try {
        const parsed = await pdfParse(sanitized);
        const text = String(parsed?.text || "").trim();
        if (!text) {
          throw new PdfExtractionError(
            "PDF was parsed but no readable text was found.",
            "EMPTY_TEXT",
          );
        }
        return text;
      } catch {
        // Fall through to normalized error handling below.
      }
    }

    const message =
      rawError instanceof Error
        ? rawError.message
        : "Unknown PDF parsing error";
    const looksMalformed = /bad xref|formaterror|invalid pdf|xref/i.test(
      message,
    );

    if (looksMalformed) {
      throw new PdfExtractionError(
        "This PDF appears malformed or corrupted (bad xref). Please re-export or re-save the file, then upload again.",
        "MALFORMED_PDF",
      );
    }

    if (rawError instanceof PdfExtractionError) {
      throw rawError;
    }

    throw new PdfExtractionError(
      "Failed to extract text from this PDF.",
      "UNKNOWN",
    );
  }
}
