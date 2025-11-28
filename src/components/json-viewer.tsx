"use client";

import dynamic from "next/dynamic";
import { ScrollArea } from "@/components/ui/scroll-area";

// Dynamically import ReactJson with no SSR
const ReactJson = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  ),
});

export default function JsonViewer({ jsonObject }: { jsonObject: object }) {
  return (
    <ScrollArea className="w-full rounded-md border p-4">
      <ReactJson
        src={jsonObject}
        displayDataTypes={false}
        collapseStringsAfterLength={70}
        enableClipboard={false}
        name={null}
        displayObjectSize={false}
      />
    </ScrollArea>
  );
}
