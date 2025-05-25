"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Info, AlertTriangle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { DataTable } from "@/components/data-table"
import { FileUploadZone } from "@/components/file-upload-zone"
import { readAndParseFile, findQFColumnIndices, countErrors, type ParsedData } from "@/utils/file-utils"
import { MAX_UPLOAD_SIZE, MAX_UPLOAD_SIZE_BYTES } from "@/lib/env"

export default function Home() {
  const [data, setData] = useState<ParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Check file size against MAX_UPLOAD_SIZE
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError(
        `File is too large. Maximum allowed size is ${MAX_UPLOAD_SIZE} MB. Your file is ${(
          file.size / (1024 * 1024)
        ).toFixed(2)} MB.`,
      )
      return
    }

    // Validate file type
    const validTypes = [".txt", ".csv", ".tsv"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!validTypes.includes(fileExtension)) {
      setError("Invalid file type. Please upload a .txt, .csv, or .tsv file.")
      return
    }

    setFileName(file.name)
    setError(null)
    setIsLoading(true)

    try {
      const parsedData = await readAndParseFile(file)
      setData(parsedData)
    } catch (err) {
      console.error("File upload error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred while processing the file")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const clearData = () => {
    setData(null)
    setFileName(null)
    setError(null)

    // Reset the file input
    const fileInput = document.getElementById("file-upload-input") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // Find QF columns and their corresponding data columns
  const qfColumnIndices = useMemo(() => {
    if (!data) return []
    return findQFColumnIndices(data.headers)
  }, [data])

  // Count total errors in the data
  const errorCount = useMemo(() => {
    if (!data) return 0
    return countErrors(data.rows, qfColumnIndices)
  }, [data, qfColumnIndices])

  return (
    <main className="container mx-auto py-4 sm:py-6 md:py-10 px-2 sm:px-4">
      <Card className="w-full border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pb-4 sm:pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">Data File Upload</CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              Upload a data file to parse and display in a table (max {MAX_UPLOAD_SIZE} MB)
            </CardDescription>
          </div>
          <ThemeToggle />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
            {/* File Upload Zone */}
            {!data && !error && (
              <FileUploadZone
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                maxSizeInMB={MAX_UPLOAD_SIZE}
                className="w-full"
              />
            )}

            {/* Clear Button - Only show when data is loaded */}
            {data && (
              <div className="w-full sm:w-auto sm:flex sm:justify-center">
                <Button
                  className="w-full xs:w-auto h-10 sm:h-9 md:h-9 text-sm px-4"
                  variant="outline"
                  size="default"
                  onClick={clearData}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4 md:h-4 md:w-4" />
                  Upload New File
                </Button>
              </div>
            )}

            {fileName && !isLoading && (
              <p className="mt-0 text-sm text-zinc-500 dark:text-zinc-400 self-start">
                Uploaded: <span className="font-medium text-zinc-900 dark:text-zinc-50">{fileName}</span>
              </p>
            )}

            {error && (
              <Alert variant="destructive" className="w-full border-red-500/20 dark:border-red-500/30">
                <div className="flex items-start justify-between">
                  <AlertDescription className="mt-0.5">{error}</AlertDescription>
                  <Button variant="destructive" size="sm" className="h-7 px-2 ml-2" onClick={clearData}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </Alert>
            )}

            {data && (
              <>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  {/* File Metadata Card */}
                  <div className="w-full space-y-4">
                    <Card className="w-full border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <CardHeader className="pb-2 px-4 border-b border-zinc-200 dark:border-zinc-800">
                        <CardTitle className="text-base sm:text-lg font-medium">File Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 py-3">
                        <div className="space-y-1 sm:space-y-2">
                          {data.metadata.map((line, index) => (
                            <p
                              key={index}
                              className="font-mono text-xs sm:text-sm break-words text-zinc-700 dark:text-zinc-300"
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Legend Card */}
                  <Card className="w-full h-full border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-2 px-4 border-b border-zinc-200 dark:border-zinc-800">
                      <CardTitle className="text-base sm:text-lg font-medium flex items-center">
                        <Info className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        Legend
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                        <p>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">A_speed:</span> machine speed
                        </p>
                        <p>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">B_prod:</span> total packaged
                          products
                        </p>
                        <p>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">X_*:</span> variety of
                          rejected products
                        </p>
                        <p>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">s_*:</span> machine stopped
                          time
                        </p>
                        <p>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">w_*:</span> machine operating
                          time
                        </p>
                        <div className="mt-3 p-2 border border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-900/50 rounded">
                          <p className="flex items-start text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>
                              The QF columns indicate that the data was saved correctly if the value is 0.
                              {errorCount > 0 && (
                                <span className="block mt-1 font-medium">
                                  Found {errorCount} rows with errors in this dataset.
                                </span>
                              )}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Table Component with simplified props */}
                <DataTable
                  headers={data.headers}
                  rows={data.rows}
                  initialPageSize={10}
                  qfColumnIndices={qfColumnIndices}
                  fileName={fileName}
                  data={data}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
