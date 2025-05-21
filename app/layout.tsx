
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "@/styles/element-sides.css"
import { MapEditorProviderWrapper } from "@/components/providers/map-editor-provider-wrapper"
import { Toaster } from "@/components/ui/toaster"
export const metadata: Metadata = {
  title: "MMV - Mall Map Viewer",
  description: "Interactive shopping mall map editor and viewer",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
            <MapEditorProviderWrapper>
              {children}
              <Toaster />
            </MapEditorProviderWrapper>
      </body>
    </html>
  )
}
