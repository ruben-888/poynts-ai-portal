"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SystemActivity } from "@/app/api/sytem-activity/services/get-all-activities";

// Define columns for the data table
export const columns: ColumnDef<SystemActivity>[] = [
  {
    accessorKey: "activity_date",
    header: "Date (UTC)",
    cell: ({ row }) => {
      const dateValue = row.original.activity_date;

      if (dateValue) {
        try {
          // Ensure the date string is treated as UTC regardless of the client\'s locale.
          const utcDate = (() => {
            // If the string already includes a timezone (Z or an offset), use it as-is.
            if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(dateValue)) {
              return new Date(dateValue);
            }

            // Convert "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DDTHH:mm:ssZ" so it is parsed as UTC.
            const isoLike = dateValue.includes("T")
              ? `${dateValue}Z`
              : `${dateValue.replace(" ", "T")}Z`;

            return new Date(isoLike);
          })();

          // Format as "YYYY-MM-DD HH:mm:ss" in UTC
          const year = utcDate.getUTCFullYear();
          const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(utcDate.getUTCDate()).padStart(2, '0');
          const hours = String(utcDate.getUTCHours()).padStart(2, '0');
          const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
          const seconds = String(utcDate.getUTCSeconds()).padStart(2, '0');

          const utcFormatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

          // Format local time for tooltip
          const localYear = utcDate.getFullYear();
          const localMonth = String(utcDate.getMonth() + 1).padStart(2, '0');
          const localDay = String(utcDate.getDate()).padStart(2, '0');
          const localHours = String(utcDate.getHours()).padStart(2, '0');
          const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');
          const localSeconds = String(utcDate.getSeconds()).padStart(2, '0');

          // Get timezone abbreviation (e.g., PDT, PST, EST, etc.)
          const timeZoneAbbr = new Intl.DateTimeFormat(undefined, {
            timeZoneName: 'short',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }).format(utcDate).split(' ').pop();

          const localFormatted = `${localYear}-${localMonth}-${localDay} ${localHours}:${localMinutes}:${localSeconds} (${timeZoneAbbr})`;

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer hover:text-blue-600 transition-colors">
                  {utcFormatted}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                <div className="text-sm">
                  <div>{localFormatted}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        } catch (e) {
          return "N/A";
        }
      }
      return "N/A";
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.original.severity?.toLowerCase() || "";

      // Map severity to appropriate badge variant
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";
      let customClass = "";

      if (severity === "info") {
        variant = "secondary";
      } else if (severity === "warning") {
        variant = "outline";
        customClass = "border-yellow-500 text-yellow-700";
      } else if (severity === "error" || severity === "critical") {
        variant = "destructive";
      }

      return (
        <Badge variant={variant} className={cn("capitalize", customClass)}>
          {severity || "N/A"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "member_name",
    header: "User",
    size: 150, // Make User column about 25% wider
    cell: ({ row }) => {
      const memberName = row.original.member_name;
      const userMetadata = row.original.user_metadata;

      // If no member name, show N/A
      if (!memberName) {
        return <span className="text-muted-foreground">N/A</span>;
      }

      // If no metadata, just show the name without hover
      if (!userMetadata?.user) {
        return <span>{memberName}</span>;
      }

      const user = userMetadata.user;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer hover:text-blue-600 transition-colors">
              {memberName}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-white text-black border border-gray-200 shadow-md p-3 max-w-[300px] [&>svg]:hidden"
            sideOffset={5}
          >
            <table className="w-full text-xs border-spacing-0">
              <tbody>
                {user.fullName && (
                  <tr>
                    <td className="font-medium text-gray-500 pr-3 py-0.5">
                      Full Name:
                    </td>
                    <td>{user.fullName}</td>
                  </tr>
                )}
                {user.primaryEmail && (
                  <tr>
                    <td className="font-medium text-gray-500 pr-3 py-0.5">
                      Email:
                    </td>
                    <td style={{ wordBreak: "break-all" }}>
                      {user.primaryEmail}
                    </td>
                  </tr>
                )}
                {user.orgRole && (
                  <tr>
                    <td className="font-medium text-gray-500 pr-3 py-0.5">
                      Role:
                    </td>
                    <td>{user.orgRole}</td>
                  </tr>
                )}
                {user.orgName && (
                  <tr>
                    <td className="font-medium text-gray-500 pr-3 py-0.5">
                      Organization:
                    </td>
                    <td>{user.orgName}</td>
                  </tr>
                )}
                {user.userId && (
                  <tr>
                    <td className="font-medium text-gray-500 pr-3 py-0.5">
                      User ID:
                    </td>
                    <td style={{ wordBreak: "break-all" }}>{user.userId}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "reward_type",
    header: "Reward Type",
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
  },
];
