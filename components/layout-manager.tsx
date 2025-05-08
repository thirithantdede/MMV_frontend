import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LayoutExport from "@/components/layout-exporter"

export function LayoutManager() {
  const [activeTab, setActiveTab] = useState("export")

  return (
    <div className="p-4 max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="export">
          <LayoutExport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LayoutManager
