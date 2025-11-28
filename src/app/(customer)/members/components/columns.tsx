"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Define the Member type based on the updated API response
export interface Member {
  id: number; // Renamed from memberid
  email: string;
  mPhone: string;
  name: string;
  status: string; // Renamed from memberStatus
  zip: string | null;
  mode: string | null;
  customerMemberId: string;
  clientName: string;
  lastActivityDate: string | null;
  createDate: string | null;
  updateDate: string | null;
  enterprise: {
    entId: number;
    entName: string;
    entType: string | null;
    entStatus: string | null;
  } | null;
}

export const columns: ColumnDef<Member>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customerMemberId",
    header: "Customer ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("customerMemberId")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name") || "—"}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "mPhone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("mPhone") || "—"}</div>,
  },
  {
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }) => <div>{row.getValue("clientName") || "—"}</div>,
  },
  {
    accessorKey: "createDate",
    header: "Date Created",
    cell: ({ row }) => {
      const date = row.getValue("createDate") as string | null;
      return <div>{date ? new Date(date).toLocaleDateString() : "—"}</div>;
    },
  },
  {
    accessorKey: "lastActivityDate",
    header: "Last Activity",
    cell: ({ row }) => {
      const date = row.getValue("lastActivityDate") as string | null;
      return <div>{date ? new Date(date).toLocaleDateString() : "—"}</div>;
    },
  },
  {
    accessorKey: "updateDate",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.getValue("updateDate") as string | null;
      return <div>{date ? new Date(date).toLocaleDateString() : "—"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => {
      const mode = row.getValue("mode") as string;

      return (
        <Badge
          variant={mode === "live" ? "default" : "outline"}
          className="capitalize"
        >
          {mode}
        </Badge>
      );
    },
  },
];
