"use client";

import React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateGiftCardDialog } from "../create-gift-card/create-gift-card-dialog";

// Define the gift card type based on the existing schema
interface GiftCard {
  cpid: string;
  title: string;
  value: number;
  name: string;
  reward_status: string;
  language: string;
  reward_availability: string;
  inventory_remaining: string;
  tags: string;
}

interface GiftCardsClientProps {
  isAdmin?: boolean;
}

// Define the columns for the gift cards table
const columns: ColumnDef<GiftCard>[] = [
  {
    accessorKey: "cpid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CPID" />
    ),
    cell: ({ row }) => (
      <div className="w-[180px] font-medium">{row.getValue("cpid")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value" />
    ),
    cell: ({ row }) => <div>${row.getValue("value")}</div>,
  },
  {
    accessorKey: "reward_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("reward_status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reward_availability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Availability" />
    ),
    cell: ({ row }) => {
      const availability = row.getValue("reward_availability") as string;
      return (
        <Badge variant="outline">
          {availability.charAt(0).toUpperCase() +
            availability.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "inventory_remaining",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inventory" />
    ),
    cell: ({ row }) => <div>{row.getValue("inventory_remaining")}</div>,
  },
];

// Sample data - this would typically come from an API
const giftCards: GiftCard[] = [
  {
    cpid: "GC-STARBUCKS-EN-25-B-E2616B",
    title: "Starbucks Gift Card",
    name: "Starbucks",
    value: 25,
    reward_status: "active",
    language: "EN",
    reward_availability: "AVAILABLE",
    inventory_remaining: "150",
    tags: "Eat_Well",
  },
  {
    cpid: "GC-AMAZON-EN-50-B-A71FA1",
    title: "Amazon.com Gift Card",
    name: "Amazon",
    value: 50,
    reward_status: "active",
    language: "EN",
    reward_availability: "AVAILABLE",
    inventory_remaining: "200",
    tags: "Shop",
  },
  {
    cpid: "GC-TARGET-EN-100-B-464A63",
    title: "Target Gift Card",
    name: "Target",
    value: 100,
    reward_status: "suspended",
    language: "EN",
    reward_availability: "NOT_AVAILABLE",
    inventory_remaining: "0",
    tags: "Shop",
  },
];

export const GiftCardsClient: React.FC<GiftCardsClientProps> = ({
  isAdmin = false,
}) => {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const handleCreateSuccess = () => {
    // TODO: Refresh the gift cards list
    // This would typically trigger a refetch of the data
    console.log("Gift card created successfully");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gift Cards Management</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage and monitor all gift card operations across the platform."
              : "View and manage available gift cards."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gift Card
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={giftCards}
          searchColumn={{
            id: "title",
            placeholder: "Search gift cards...",
          }}
          filters={[
            {
              id: "reward_status",
              title: "Status",
              options: [
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
              ],
            },
            {
              id: "reward_availability",
              title: "Availability",
              options: [
                { value: "AVAILABLE", label: "Available" },
                { value: "NOT_AVAILABLE", label: "Not Available" },
              ],
            },
          ]}
        />
      </div>

      {/* Create Gift Card Dialog */}
      <CreateGiftCardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
