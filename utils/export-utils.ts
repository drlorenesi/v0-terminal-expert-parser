/**
 * Exports data to Excel format
 * @param data The data to export
 * @param fileName The name of the file to download
 * @param isFiltered Whether the data has been filtered
 * @returns A promise that resolves when the export is complete
 */
export async function exportToExcel(
  data: { metadata: string[]; headers: string[]; rows: string[][] } | null,
  fileName: string | null,
  isFiltered = false,
): Promise<void> {
  if (!data) return

  try {
    // Dynamically import xlsx to avoid loading it on initial page load
    const XLSX = await import("xlsx")

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows])

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Data")

    // Add metadata as a separate sheet
    const metadataSheet = XLSX.utils.aoa_to_sheet(data.metadata.map((line) => [line]))
    XLSX.utils.book_append_sheet(wb, metadataSheet, "Metadata")

    // Generate Excel file as a binary string
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    // Create a Blob from the buffer
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    // Create download link with modified filename if filtered
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url

    // Add "_filtered" suffix to filename if data is filtered
    const baseFileName = fileName?.split(".")[0] || "data"
    const suffix = isFiltered ? "_filtered" : ""
    link.download = `${baseFileName}_export${suffix}.xlsx`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("Error exporting to Excel:", err)
    throw new Error("Failed to export to Excel. Please try again.")
  }
}
