"use client";

export const TimestampDisplay = () => {
  const timestamp = new Date();

  // Local time
  const localFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "medium",
  });

  // Local timezone abbreviation (slightly hacky way)
  const localTzFormatter = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" });
  const parts = localTzFormatter.formatToParts(timestamp);
  const tzAbbr = parts.find((p) => p.type === "timeZoneName");

  // UTC time
  const utcFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "UTC"
  });

  return (
    <div className="text-base font-bold text-muted-foreground mt-2 space-y-1">
      {localFormatter.format(timestamp)} ({tzAbbr ? tzAbbr.value : "Local"}) | {utcFormatter.format(timestamp)} (UTC)
    </div>
  );
};
