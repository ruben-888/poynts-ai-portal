"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SourceInfo } from "@/app/api/rewards/(routes)/sources/schema";

interface SourceCircleProps {
  source: SourceInfo;
}

export function SourceCircle({ source }: SourceCircleProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 border-green-200 text-green-800";
      case "suspended":
        return "bg-amber-100 border-amber-200 text-amber-800";
      case "inactive":
      default:
        return "bg-gray-100 border-gray-200 text-gray-500";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toUpperCase()) {
      case "AVAILABLE":
        return "text-green-600";
      case "UNAVAILABLE":
        return "text-red-600";
      default:
        return "text-amber-600";
    }
  };

  const formatAvailability = (availability: string) => {
    return (
      availability.charAt(0).toUpperCase() + availability.slice(1).toLowerCase()
    );
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium cursor-pointer border ${getStatusColor(source.status)}`}
          >
            {source.source_letter}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-white text-black border border-gray-200 shadow-md p-3 max-w-[300px] [&>svg]:hidden"
          sideOffset={5}
        >
          <table className="w-full text-xs border-spacing-0">
            <tbody>
              <tr>
                <td className="font-medium text-gray-500 pr-3 py-0.5">
                  Source:
                </td>
                <td>{source.source_letter}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-500 pr-3 py-0.5">CPID:</td>
                <td style={{ wordBreak: "break-all" }}>{source.cpidx}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-500 pr-3 py-0.5">
                  Availability:
                </td>
                <td
                  className={getAvailabilityColor(source.reward_availability)}
                >
                  {formatAvailability(source.reward_availability)}
                </td>
              </tr>
              <tr>
                <td className="font-medium text-gray-500 pr-3 py-0.5">
                  Status:
                </td>
                <td
                  className={
                    getStatusColor(source.status).includes("text-green")
                      ? "text-green-600"
                      : "text-amber-600"
                  }
                >
                  {formatStatus(source.status)}
                </td>
              </tr>
              {source.provider_id && (
                <tr>
                  <td className="font-medium text-gray-500 pr-3 py-0.5">
                    Provider:
                  </td>
                  <td>{source.provider_id}</td>
                </tr>
              )}
            </tbody>
          </table>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SourceCirclesProps {
  sources: SourceInfo[];
  isLoading?: boolean;
}

export function SourceCircles({ sources, isLoading }: SourceCirclesProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
          -
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {sources.map((source, index) => (
        <SourceCircle key={`${source.cpidx}-${index}`} source={source} />
      ))}
    </div>
  );
}
