import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LayoutExport from "@/components/layout-exporter"
import LayoutImport from "./layout-importer"

export function LayoutManager() {
  const [activeTab, setActiveTab] = useState("export")

  return (
    <div className="p-4 max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="w-full">
            Export Layout
          </TabsTrigger>
          <TabsTrigger value="import" className="w-full">
            Import Layout
          </TabsTrigger>
        </TabsList>
        <TabsContent value="export">
          <LayoutExport />
        </TabsContent>
         <TabsContent value="import">
          <LayoutImport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LayoutManager
