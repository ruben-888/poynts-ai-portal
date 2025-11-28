import { CalendarNotion } from "../components/calendar-notion";

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            CP Well Calendar - View upcoming events and schedules
          </p>
        </div>
        <CalendarNotion />
      </div>
    </div>
  );
}