/** Doesn't work with inputs not start-trimmed. */
export function toSentenceCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
