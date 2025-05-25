/**
 * Copies data to clipboard
 * @param data The data to copy
 * @returns A promise that resolves when the copy is complete
 */
export async function copyToClipboard(data: { headers: string[]; rows: string[][] } | null): Promise<void> {
  if (!data) return

  try {
    // Create a string representation of the data
    const headers = data.headers.join("\t")
    const rows = data.rows.map((row) => row.join("\t")).join("\n")
    const textToCopy = `${headers}\n${rows}`

    // Copy to clipboard
    await navigator.clipboard.writeText(textToCopy)
  } catch (err) {
    console.error("Failed to copy data:", err)
    throw new Error("Failed to copy data to clipboard.")
  }
}
