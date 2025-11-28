import React from "react";
import JournalEntriesClient from "./components/journal-entries-client";

export default function JournalEntriesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Journal Entries</h1>
      </div>

      <JournalEntriesClient />
    </div>
  );
}
