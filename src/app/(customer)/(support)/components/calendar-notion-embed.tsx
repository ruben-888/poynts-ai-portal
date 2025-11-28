"use client"

import { useState } from "react"
import { ExternalLink, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CalendarNotionEmbed() {
  const [isLoading, setIsLoading] = useState(true)
  const notionCalendarUrl = "https://nettle-gaura-65e.notion.site/CP-Well-Calendar-1bafbd59b0b0805c896acff61c186356?pvs=143"

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const openInNewTab = () => {
    window.open(notionCalendarUrl, "_blank")
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Embedded Calendar</h2>
          <p className="text-muted-foreground">Direct calendar view</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCwIcon className="h-4 w-4" />
            <span className="ml-1">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4" />
            <span className="ml-1">Open in Notion</span>
          </Button>
        </div>
      </div>
      <Card className="p-0 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-96 bg-gray-50">
            <div className="flex flex-col items-center gap-4">
              <RefreshCwIcon className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-gray-500">Loading calendar...</p>
            </div>
          </div>
        )}
        <iframe
          src={notionCalendarUrl}
          className={`w-full h-[800px] border-0 ${isLoading ? "hidden" : "block"}`}
          onLoad={handleIframeLoad}
          title="CP Well Calendar"
          allow="fullscreen"
        />
      </Card>
      <div className="mt-4 text-sm text-muted-foreground text-center">
        <p>
          Calendar is powered by Notion. If you experience any issues loading the calendar, try{" "}
          <button onClick={openInNewTab} className="text-primary hover:underline">
            opening it directly in Notion
          </button>
          .
        </p>
      </div>
    </div>
  )
}