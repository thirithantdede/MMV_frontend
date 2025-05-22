"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { exportMallLayout } from "@/utils/localStorage-utils"
import { Download, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMapEditor } from "@/context/map-editor-context"

export function LayoutExport() {
  const [layoutName, setLayoutName] = useState("")
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const {totalFloors} = useMapEditor();

  const handleExport = () => {
    setIsExporting(true)
    setExportStatus("idle")
    setErrorMessage("")

    try {
      const exportSuccess = exportMallLayout(layoutName,totalFloors);

      if (exportSuccess) {
        setExportStatus("success")
        setLayoutName("") // Reset the input field
      } else {
        throw new Error("Failed to export layout")
      }
    } catch (error) {
      console.error("Error exporting layout:", error)
      setExportStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Export Layout</CardTitle>
        <CardDescription>Export your current mall layout as a JSON file</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="layout-name" className="text-sm font-medium">
              Layout Name (optional)
            </label>
            <Input
              id="layout-name"
              placeholder="Enter a name for your layout"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
            />
            <p className="text-xs text-gray-500">If left blank, the current active layout name will be used</p>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Layout"}
          </Button>
        </div>

        {exportStatus === "success" && (
          <Alert className="mt-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Layout exported successfully.</AlertDescription>
          </Alert>
        )}

        {exportStatus === "error" && (
          <Alert className="mt-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage || "Failed to export layout. Please try again."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: You can share this JSON file with others or use it as a backup of your layout.
        </p>
      </CardFooter>
    </Card>
  )
}

export default LayoutExport
