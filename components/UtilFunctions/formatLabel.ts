function formatLabel(key: string): string {
  return key
    .replace(/^us-gaap[_-]/i, "") // Remove common prefix
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase
    .replace(/_/g, " ") // Replace underscores
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}
export { formatLabel };