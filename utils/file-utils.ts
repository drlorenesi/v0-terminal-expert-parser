/**
 * Parses the content of an uploaded data file
 * @param content The file content as a string
 * @returns Parsed data including metadata, headers, and rows
 */
export function parseFileContent(content: string) {
  if (!content || typeof content !== "string") {
    throw new Error("Invalid file content: File appears to be empty or not a text file")
  }

  // Split content into lines
  const lines = content.split("\n").filter((line) => line.trim() !== "")

  if (lines.length < 3) {
    throw new Error("Invalid file format: File must contain at least metadata and header lines")
  }

  // Extract metadata (first two lines)
  const metadata = lines.slice(0, 2).map((line) => line.trim())

  // Find the line with headers (contains "Date", "Time", etc.)
  const headerLineIndex = lines.findIndex((line) => line.includes("Date") && line.includes("Time"))

  if (headerLineIndex === -1) {
    throw new Error("Invalid file format: Could not find header line with 'Date' and 'Time' columns")
  }

  // Parse headers
  const headerLine = lines[headerLineIndex]
  const headers = headerLine
    .split("\t")
    .map((header) => header.replace(/"/g, "").trim())
    .filter((header) => header !== "")

  if (headers.length === 0) {
    throw new Error("Invalid file format: No headers found in the file")
  }

  // Parse data rows
  const dataRows = lines.slice(headerLineIndex + 1).map((line) => {
    return line
      .split("\t")
      .map((cell) => cell.replace(/"/g, "").trim())
      .filter((_, index) => index < headers.length)
  })

  return { metadata, headers, rows: dataRows }
}

/**
 * Interface for the parsed data structure
 */
export interface ParsedData {
  metadata: string[]
  headers: string[]
  rows: string[][]
}

/**
 * Reads a file and parses its content
 * @param file The file to read
 * @returns A promise that resolves with the parsed data
 */
export function readAndParseFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"))
      return
    }

    if (file.size === 0) {
      reject(new Error("File is empty"))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        // Check if we have a result
        if (!e.target) {
          reject(new Error("File reading failed: No result available"))
          return
        }

        const content = e.target.result

        // Validate content
        if (!content || typeof content !== "string") {
          reject(new Error("File reading failed: Unable to read file content"))
          return
        }

        // Parse the content
        const parsedData = parseFileContent(content)
        resolve(parsedData)
      } catch (err) {
        console.error("Error parsing file:", err)
        if (err instanceof Error) {
          reject(err)
        } else {
          reject(new Error("Failed to parse file. Please ensure it's in the correct format."))
        }
      }
    }

    reader.onerror = (e) => {
      console.error("FileReader error:", e)
      reject(new Error("Failed to read file. Please try again."))
    }

    // Try to read the file as text
    try {
      reader.readAsText(file)
    } catch (err) {
      console.error("Error initiating file read:", err)
      reject(new Error("Failed to read file. The file may be corrupted or in an unsupported format."))
    }
  })
}

/**
 * Finds QF columns and their corresponding data columns
 * @param headers The headers array
 * @returns An array of QF column indices and their corresponding data column indices
 */
export function findQFColumnIndices(headers: string[]): { qfIndex: number; dataIndex: number }[] {
  if (!headers || !Array.isArray(headers)) {
    return []
  }

  return headers.reduce<{ qfIndex: number; dataIndex: number }[]>((acc, header, index) => {
    if (header === "QF") {
      // Find the data column that this QF column corresponds to
      const dataIndex = index - 1
      if (dataIndex >= 0) {
        acc.push({ qfIndex: index, dataIndex })
      }
    }
    return acc
  }, [])
}

/**
 * Counts the total number of rows with errors in the data
 * @param rows The data rows
 * @param qfColumnIndices The QF column indices
 * @returns The number of rows with errors
 */
export function countErrors(rows: string[][], qfColumnIndices: { qfIndex: number; dataIndex: number }[]): number {
  if (!rows || !Array.isArray(rows) || !qfColumnIndices || !Array.isArray(qfColumnIndices)) {
    return 0
  }

  return rows.reduce((count, row) => {
    if (!row || !Array.isArray(row)) {
      return count
    }

    const rowHasError = qfColumnIndices.some(({ qfIndex }) => {
      return qfIndex < row.length && row[qfIndex] !== "0"
    })

    return count + (rowHasError ? 1 : 0)
  }, 0)
}
