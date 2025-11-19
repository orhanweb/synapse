export class LinkExtractor {
  /**
   * Extracts note references from text using @ mention syntax.
   * Example: "This is about @Machine Learning and @AI" -> ["Machine Learning", "AI"]
   *
   * Rules:
   * - @ must be preceded by space, newline, or start of string (to avoid email addresses)
   * - Captures text after @ until next space, newline, or punctuation
   */
  static extract(content: string): string[] {
    // Regex explanation:
    // (?:^|[\s]) - @ must be at start or after whitespace (non-capturing group)
    // @ - literal @ symbol
    // ([A-Za-z0-9](?:[A-Za-z0-9\s]*[A-Za-z0-9])?) - capture group:
    //   - starts with alphanumeric
    //   - can contain alphanumeric and spaces in middle
    //   - ends with alphanumeric (no trailing spaces)
    const mentionRegex = /(?:^|[\s])@([A-Za-z0-9](?:[A-Za-z0-9\s]*[A-Za-z0-9])?)/g;
    const matches = Array.from(content.matchAll(mentionRegex));

    // Extract captured groups (note titles) and remove duplicates
    const titles = matches.map(match => match[1].trim());
    return Array.from(new Set(titles));
  }
}
