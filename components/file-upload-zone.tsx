"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
  maxSizeInMB: number
  className?: string
}

export function FileUploadZone({ onFileSelect, isLoading, maxSizeInMB, className }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragOver(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      setDragCounter(0)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        // Validate file type
        const validTypes = [".txt", ".csv", ".tsv"]
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

        if (!validTypes.includes(fileExtension)) {
          // You might want to show an error here
          console.error("Invalid file type. Please upload a .txt, .csv, or .tsv file.")
          return
        }

        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  const handleClick = useCallback(() => {
    if (!isLoading) {
      document.getElementById("file-upload-input")?.click()
    }
  }, [isLoading])

  return (
    <div
      className={cn(
        "relative w-full border-2 border-dashed rounded-lg transition-all duration-200 ease-in-out",
        isDragOver
          ? "border-zinc-400 bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-900/50"
          : "border-zinc-300 dark:border-zinc-700",
        isLoading && "opacity-50 cursor-not-allowed",
        !isLoading && "cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600",
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        id="file-upload-input"
        type="file"
        accept=".txt,.csv,.tsv"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center justify-center gap-4 p-8 sm:p-12">
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full transition-colors",
            isDragOver ? "bg-zinc-200 dark:bg-zinc-800" : "bg-zinc-100 dark:bg-zinc-900",
          )}
        >
          {isDragOver ? (
            <FileText className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
          ) : (
            <Upload className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
          )}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {isDragOver ? "Drop your file here" : "Upload a data file"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isDragOver ? "Release to upload your file" : "Drag and drop your file here, or click to browse"}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            (supports .txt files, max {maxSizeInMB} MB)
          </p>
        </div>

        {!isDragOver && (
          <Button
            className="mt-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "Loading..." : "Choose File"}
          </Button>
        )}
      </div>
    </div>
  )
}
