/**
 * Environment configuration with type safety
 */

// Maximum file size for uploads in MB
export const MAX_UPLOAD_SIZE = process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE
  ? Number.parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE, 10)
  : 10

// Convert to bytes for easier comparison
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE * 1024 * 1024
