/** Patterns indicating prompt-injection attempts in retrieved knowledge text. */
const INJECTION_PATTERNS: RegExp[] = [
  /\bignore (?:previous|all|above)\b/i,
  /\bdisregard (?:previous|all|your)?\s*(?:instructions|rules|prompts?)\b/i,
  /\bsystem prompt\b/i,
  /\boverride (?:instructions|rules|system)\b/i,
  /\byou are now\b/i,
  /\bact as (?:a|an)?\s*(?:admin|root|developer)\b/i,
  /\bdo not follow (?:the )?(?:rules|policy|guidelines)\b/i,
];

export type NeutralizedText = {
  text: string;
  injectionDetected: boolean;
  neutralizedLines: number;
};

/**
 * Strip or neutralize prompt-injection-like lines in retrieved content.
 * Treat retrieved knowledge as DATA, never as instructions.
 */
export function neutralizePromptInjection(text: string): NeutralizedText {
  const lines = text.split(/\r?\n/);
  let injectionDetected = false;
  let neutralizedLines = 0;

  const cleaned = lines.map((line) => {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(line)) {
        injectionDetected = true;
        neutralizedLines += 1;
        return '[content removed — non-authoritative instruction text]';
      }
    }
    return line;
  });

  return {
    text: cleaned.join('\n'),
    injectionDetected,
    neutralizedLines,
  };
}

export function containsPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}
