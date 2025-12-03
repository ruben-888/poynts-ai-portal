import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Client } from "./schema";
import { ClientActions } from "./client-actions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useGateValue } from "@/lib/hooks/use-feature-flags";
import { useAuth } from "@clerk/nextjs";

// TODO: Replace with actual Clerk role check

export function useClientColumns() {
  const { has, isLoaded, isSignedIn } = useAuth();
  const clientMemberLinkEnabled = useGateValue("clients_member_link_enabled");

  // Return empty columns if auth is not loaded or user is not signed in
  if (!isLoaded || !isSignedIn) {
    return [];
  }

  const canManageClients = has({
    permission: "org:clients:manage",
  });

  const columns: ColumnDef<Client>[] = [
    {
      id: "ID",
      accessorKey: "ent_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "ent_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "ent_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue("ent_type")}</Badge>;
      },
    },
    {
      accessorKey: "ent_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => {
        const status = row.getValue("ent_status") as string;
        return (
          <Badge
            variant={
              status.toLowerCase() === "active" ? "outline" : "secondary"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "members",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Members" />
      ),
      accessorFn: (row) => row.member_count || 0,
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => {
        // Access member_count from the data
        const memberCount = row.original.member_count;
        const clientId = row.original.ent_id;

        // Format with commas or return a dash if no value
        return memberCount !== undefined ? (
          clientMemberLinkEnabled ? (
            <a
              href={`/members?client_id=${clientId}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {memberCount.toLocaleString("en-US")}
            </a>
          ) : (
            memberCount.toLocaleString("en-US")
          )
        ) : (
          "-"
        );
      },
    },
    {
      id: "rewards",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reward Count" />
      ),
      enableSorting: true,
      enableHiding: false,
      cell: ({ row }) => {
        // Access rewards_count if it exists in the data
        const rewardsCount = row.original.rewards_count;
        // Return the count or a dash if no value
        return rewardsCount !== undefined ? rewardsCount : "-";
      },
    },
    {
      id: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => {
        const city = row.ent_city || "";
        const state = row.ent_state || "";

        if (city && state) {
          return `${city}, ${state}`;
        } else if (city) {
          return city;
        } else if (state) {
          return state;
        }
        return "";
      },
    },
    {
      accessorKey: "parent_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Parent Name" />
      ),
      enableSorting: true,
      enableHiding: true,
    },
    ...(canManageClients
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: { original: Client } }) => {
              const client = row.original;
              return <ClientActions client={client} />;
            },
            enableSorting: false,
            enableHiding: false,
          },
        ]
      : []),
  ];

  return columns;
}
