import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

export default function Loading() {
  return (
    <main className="container mx-auto py-4 sm:py-6 md:py-10 px-2 sm:px-4">
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pb-4 sm:pb-6">
          <div>
            <CardTitle>Data File Upload</CardTitle>
            <CardDescription>Upload a data file to parse and display in a table</CardDescription>
          </div>
          <Skeleton className="h-9 w-9 rounded-md" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
            {/* Button skeleton */}
            <div className="w-full sm:w-auto sm:flex sm:justify-center">
              <div className="flex flex-col xs:flex-row gap-2 w-full xs:w-auto">
                <Skeleton className="w-full xs:w-32 h-10" />
              </div>
            </div>

            {/* Loading indicator */}
            <div className="flex flex-col items-center justify-center py-8 w-full">
              <div className="animate-spin text-primary mb-4">
                <RefreshCw className="h-10 w-10" />
              </div>
              <p className="text-muted-foreground text-sm">Loading application...</p>
            </div>

            {/* Table skeleton */}
            <div className="w-full space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-40" />
              </div>

              <div className="border rounded-md w-full">
                <div className="p-2 border-b">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-24" />
                    ))}
                  </div>
                </div>

                <div className="p-2">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex gap-2 py-2 border-b last:border-0">
                      {[1, 2, 3, 4, 5].map((col) => (
                        <Skeleton key={col} className="h-5 w-24" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
