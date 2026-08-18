// A small, deliberately conservative local safety net. If a check-in note
// contains language suggesting acute risk, the app skips music suggestions
// entirely and routes the student straight to crisis resources instead —
// regardless of whether the AI layer is configured. This check runs
// independently of the Anthropic API so it still works with zero setup.
const RISK_PATTERNS = [
  /\bkill myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend my life\b/i,
  /\bwant to die\b/i,
  /\bdon'?t want to (live|be alive)\b/i,
  /\bself[\s-]?harm\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bno reason to (live|go on)\b/i,
];

export function containsCrisisLanguage(text = "") {
  if (!text || typeof text !== "string") return false;
  return RISK_PATTERNS.some((pattern) => pattern.test(text));
}
