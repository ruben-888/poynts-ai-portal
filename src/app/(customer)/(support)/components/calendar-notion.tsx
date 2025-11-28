"use client";

import { Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CalendarNotion() {
  const handleOpenCalendar = () => {
    window.open("https://nettle-gaura-65e.notion.site/CP-Well-Calendar-1bafbd59b0b0805c896acff61c186356?pvs=143", "_blank");
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>CP Well Calendar</CardTitle>
        <CardDescription>
          Access the CP Well Calendar to view upcoming events, schedules, and important dates
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={handleOpenCalendar} className="w-full sm:w-auto">
          Open Calendar
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
     </CardContent>
    </Card>
  );
}
