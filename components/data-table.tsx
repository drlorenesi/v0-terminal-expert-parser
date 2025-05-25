"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Copy, Check, Download, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { exportToExcel } from "@/utils/export-utils"
import { copyToClipboard } from "@/utils/clipboard-utils"

// Define sort direction type
export type SortDirection = "asc" | "desc" | null

// Define sort state type
export interface SortState {
  column: number | null
  direction: SortDirection
}

// Simplified interface with only the essential props
export interface DataTableProps {
  headers: string[]
  rows: string[][]
  initialPageSize?: number
  qfColumnIndices?: { qfIndex: number; dataIndex: number }[]
  className?: string
  fileName?: string | null
  data?: { metadata: string[]; headers: string[]; rows: string[][] } | null
}

export function DataTable({
  headers,
  rows,
  initialPageSize = 10,
  qfColumnIndices = [],
  className,
  fileName = null,
  data = null,
}: DataTableProps) {
  // Internal state management
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null })
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Handle column sort
  const handleSort = (columnIndex: number) => {
    setSortState((prevState) => {
      // If clicking the same column, cycle through sort directions: null -> asc -> desc -> null
      if (prevState.column === columnIndex) {
        if (prevState.direction === null) return { column: columnIndex, direction: "asc" }
        if (prevState.direction === "asc") return { column: columnIndex, direction: "desc" }
        return { column: null, direction: null } // Reset sort if already desc
      }
      // If clicking a new column, start with ascending sort
      return { column: columnIndex, direction: "asc" }
    })
  }

  // Determine if a value is a number
  const isNumeric = useCallback((value: string): boolean => {
    return !isNaN(Number(value)) && !isNaN(Number.parseFloat(value))
  }, [])

  // Determine if a value is a date
  const isDate = useCallback((value: string): boolean => {
    // Simple check for common date formats
    return /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/.test(value) || !isNaN(Date.parse(value))
  }, [])

  // Compare function for sorting
  const compareValues = useCallback(
    (a: string, b: string, isAsc: boolean): number => {
      // Handle empty values
      if (a === "" && b === "") return 0
      if (a === "") return isAsc ? 1 : -1
      if (b === "") return isAsc ? -1 : 1

      // Check if values are numeric
      if (isNumeric(a) && isNumeric(b)) {
        return isAsc ? Number(a) - Number(b) : Number(b) - Number(a)
      }

      // Check if values are dates
      if (isDate(a) && isDate(b)) {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return isAsc ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
      }

      // Default to string comparison
      return isAsc ? a.localeCompare(b) : b.localeCompare(a)
    },
    [isNumeric, isDate],
  )

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) {
      return rows
    }

    const term = searchTerm.toLowerCase()
    return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(term)))
  }, [rows, searchTerm])

  // Sort filtered rows based on sort state
  const sortedFilteredRows = useMemo(() => {
    if (!filteredRows.length || sortState.column === null || sortState.direction === null) {
      return filteredRows
    }

    const columnIndex = sortState.column
    const isAsc = sortState.direction === "asc"

    return [...filteredRows].sort((rowA, rowB) => {
      const valueA = rowA[columnIndex] || ""
      const valueB = rowB[columnIndex] || ""
      return compareValues(valueA, valueB, isAsc)
    })
  }, [filteredRows, sortState, compareValues])

  // Calculate pagination
  const totalPages = useMemo(() => {
    if (!sortedFilteredRows.length) return 1
    if (pageSize === -1) return 1 // "All" option
    return Math.ceil(sortedFilteredRows.length / pageSize)
  }, [sortedFilteredRows.length, pageSize])

  // Get current page data
  const currentData = useMemo(() => {
    if (pageSize === -1) return sortedFilteredRows // "All" option

    const startIndex = (currentPage - 1) * pageSize
    return sortedFilteredRows.slice(startIndex, startIndex + pageSize)
  }, [sortedFilteredRows, currentPage, pageSize])

  // Handle page change
  const changePage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newSize = Number.parseInt(value)
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Check if a cell should be highlighted as an error
  const isCellError = (rowIndex: number, cellIndex: number) => {
    if (!currentData[rowIndex]) return false

    // Check if this cell is a data column with a corresponding QF column
    const qfPair = qfColumnIndices.find((pair) => pair.dataIndex === cellIndex)
    if (qfPair) {
      const qfValue = currentData[rowIndex][qfPair.qfIndex]
      return qfValue !== "0"
    }

    // Check if this cell is a QF column
    const dataQfPair = qfColumnIndices.find((pair) => pair.qfIndex === cellIndex)
    if (dataQfPair) {
      return currentData[rowIndex][cellIndex] !== "0"
    }

    return false
  }

  // Encapsulated export functionality
  const handleExportToExcel = async () => {
    if (!data) return

    setIsExporting(true)
    try {
      // Determine if we're exporting filtered data
      const isFiltered = searchTerm.trim() !== ""

      // Create the data to export
      const exportData = isFiltered
        ? {
            ...data,
            rows: filteredRows,
          }
        : data

      await exportToExcel(exportData, fileName, isFiltered)
    } catch (err) {
      console.error("Export error:", err)
    } finally {
      setIsExporting(false)
    }
  }

  // Encapsulated copy functionality
  const handleCopyToClipboard = async () => {
    if (!data) return

    try {
      // Determine if we're copying filtered data
      const isFiltered = searchTerm.trim() !== ""

      // Create the data to copy
      const copyData = isFiltered
        ? {
            headers: data.headers,
            rows: filteredRows,
          }
        : {
            headers: data.headers,
            rows: data.rows,
          }

      await copyToClipboard(copyData)

      // Show success indicator
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Copy error:", err)
    }
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Table Controls - Responsive Layout */}
      <div className="w-full flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3">
        {/* Menubar - Fixed width on sm screens to match 390px appearance */}
        <div className="w-full sm:w-auto flex justify-center">
          <div className="w-full max-w-[358px] sm:w-[358px] inline-flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-md h-9 overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <div className="flex-[1.3] flex items-center justify-center h-full hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger
                  className="border-0 bg-transparent text-zinc-800 dark:text-zinc-50 h-full p-0 min-w-0 w-auto focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-zinc-300 dark:data-[state=open]:bg-zinc-700"
                  style={{ backgroundColor: "transparent" }}
                >
                  <span className="flex items-center whitespace-nowrap">
                    <span className="mr-1">Show</span>
                    <SelectValue placeholder="10" />
                    <span className="ml-1">rows</span>
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="-1">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              className="flex-[0.75] flex items-center justify-center h-full text-zinc-800 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              onClick={handleCopyToClipboard}
              disabled={!data}
              aria-label="Copy data to clipboard"
            >
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              <span className="text-sm">Copy</span>
            </button>

            <button
              className="flex-[0.95] flex items-center justify-center h-full text-zinc-800 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              onClick={handleExportToExcel}
              disabled={isExporting || !data}
              aria-label="Export to Excel"
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="text-sm">{isExporting ? "Exporting..." : "Excel"}</span>
            </button>
          </div>
        </div>

        {/* Search Input - Reduced width at medium screens */}
        <div className="w-full sm:w-[358px] md:w-[280px]">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <Input
              type="search"
              placeholder="Search data..."
              className="pl-8 h-8 text-xs sm:text-sm w-full border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50">
              {headers.map((header, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "whitespace-nowrap text-xs sm:text-sm py-2.5 cursor-pointer select-none font-medium text-zinc-700 dark:text-zinc-300",
                    header === "QF" && "bg-zinc-100 dark:bg-zinc-900",
                    sortState.column === index && "bg-zinc-200 dark:bg-zinc-800",
                  )}
                  onClick={() => handleSort(index)}
                >
                  <div className="flex items-center justify-between">
                    <span>{header}</span>
                    {sortState.column === index && (
                      <span className="ml-1">
                        {sortState.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                >
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      className={cn(
                        "text-xs sm:text-sm py-2.5 text-zinc-700 dark:text-zinc-300",
                        headers[cellIndex] === "QF" && "bg-zinc-100 dark:bg-zinc-900",
                        isCellError(rowIndex, cellIndex) && "text-red-600 dark:text-red-400 font-medium",
                        sortState.column === cellIndex && "bg-zinc-100 dark:bg-zinc-900/50",
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableCell colSpan={headers.length} className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                  {searchTerm ? "No matching results found" : "No data available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Controls - Bottom Row */}
      <div className="flex flex-row items-center justify-between w-full mt-1.5 pt-1">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {pageSize === -1
              ? `Showing all ${sortedFilteredRows.length} rows`
              : `Showing ${Math.min((currentPage - 1) * pageSize + 1, sortedFilteredRows.length)}-${Math.min(
                  currentPage * pageSize,
                  sortedFilteredRows.length,
                )} of ${sortedFilteredRows.length} rows`}
            {searchTerm && ` (Found ${sortedFilteredRows.length} of ${rows.length} rows)`}
          </p>
        </div>

        {pageSize !== -1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-200 dark:border-zinc-800"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs sm:text-sm mx-2 text-zinc-700 dark:text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-200 dark:border-zinc-800"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
