export function outputSection(): string {
  return `# Output format (critical)

Respond with **only** the JSON \`ContentModule\` object:

- Valid JSON (double quotes, no trailing commas)
- No markdown code fences
- No commentary before or after
- No \`//\` comments inside JSON

The author will paste your response into evo-quest for validation and import.`;
}
