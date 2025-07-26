
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { importLayoutFromJson } from "@/utils/localStorage-utils"
import { Download, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import useMutate from "@/hooks/use-mutate"

export function LayoutImport() {
  const [layoutName, setLayoutName] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isImporting, setisImporting] = useState(false)
  // input ref
  const inputRef = useRef<HTMLInputElement>(null)

  const [cleanTheElement, { isLoading, isError, error }] = useMutate({ callback: undefined });

  const handleImport = () => {
    setisImporting(true)
    setImportStatus("idle")
    setErrorMessage("")

    try {
      // If no name is provided, use the active layout name or a default
      const file = inputRef.current?.files?.[0];
      if (!file) {
        throw new Error("No file selected")
      }
      cleanTheElement('/clean-elements');
      // First save the current state as a layout
      const saveSuccess = importLayoutFromJson(file)


      if (saveSuccess == false) {
        throw new Error("Failed to import layout")
      }else
      {
        setImportStatus("success")
        setLayoutName("")
      }

    } catch (error) {
      console.error("Error Importing layout:", error)
      setImportStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setisImporting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Import Layout</CardTitle>
        <CardDescription>
          Importing Layout will overwrite the current layout. Please ensure you have saved your current layout if needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="layout-name" className="text-sm font-medium">
              Select Import File
            </label>
            <Input
              type="file"
              accept=".json"
              id="layout-name"
              placeholder="Enter a name for your layout"
              ref={inputRef}
            />
          </div>

          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isImporting ? "Importing..." : "Import Layout"}
          </Button>
        </div>

        {importStatus === "success" && (
          <Alert className="mt-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Layout Imported successfully.</AlertDescription>
          </Alert>
        )}
        {importStatus === "error" && (
          <Alert className="mt-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage || "Failed to export layout. Please try again."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
   
    </Card>
  )
}

export default LayoutImport
