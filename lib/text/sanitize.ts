const NOISY_SYMBOLS_REGEX =
  /[\uFFFD\u25A1\u25A0\u2610-\u2612\u2022\u25CF\u25E6\u2043\u2219\uF0B7]/g;
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;
const LEADING_OCR_ARTIFACT_REGEX = /^y\s+(?=[a-z]{4,})/;

export function sanitizeStudyText(value: string) {
  return String(value || "")
    .replace(NOISY_SYMBOLS_REGEX, " ")
    .replace(CONTROL_CHARS_REGEX, " ")
    .replace(/\s+/g, " ")
    .replace(LEADING_OCR_ARTIFACT_REGEX, "")
    .trim();
}
