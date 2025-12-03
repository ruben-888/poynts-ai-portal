"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/components/context/tenant-provider";
import { ManageCampaign, Campaign } from "./manage-campaign";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-indigo-100 text-indigo-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-slate-100 text-slate-800",
};

const typeColors: Record<string, string> = {
  acquisition: "bg-purple-100 text-purple-800",
  engagement: "bg-orange-100 text-orange-800",
  adherence: "bg-cyan-100 text-cyan-800",
  aspiration: "bg-pink-100 text-pink-800",
};

async function fetchCampaigns(organizationId: string): Promise<Campaign[]> {
  const response = await fetch(
    `/api/campaigns?organization_id=${organizationId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }
  const result = await response.json();
  return result.data;
}

export default function CampaignsClient() {
  const { currentOrgId, isInitialized } = useTenant();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    React.useState<Campaign | null>(null);
  const [isCreateMode, setIsCreateMode] = React.useState(false);

  const {
    data: campaigns = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campaigns", currentOrgId],
    queryFn: () => fetchCampaigns(currentOrgId),
    enabled: isInitialized && !!currentOrgId,
  });

  const handleNewCampaign = () => {
    setSelectedCampaign(null);
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleRowClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => handleRowClick(row.original)}
        >
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="outline" className={typeColors[type] || ""}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "draft";
        return (
          <Badge variant="outline" className={statusColors[status] || ""}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total_poynts",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Poynts" />
      ),
      cell: ({ row }) => {
        const poynts = row.getValue("total_poynts") as number;
        return <span className="font-medium">{poynts.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "start_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("start_date") as string | null;
        return date ? new Date(date).toLocaleDateString() : "Not set";
      },
    },
    {
      accessorKey: "end_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("end_date") as string | null;
        return date ? new Date(date).toLocaleDateString() : "Ongoing";
      },
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("slug")}</span>
      ),
    },
  ];

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load campaigns</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={campaigns}
        searchColumn={{
          id: "name",
          placeholder: "Search campaigns...",
        }}
        customActions={
          <Button onClick={handleNewCampaign}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        }
        enableRowSelection={false}
        rowIdField="id"
      />
      <ManageCampaign
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedCampaign={selectedCampaign}
        isCreateMode={isCreateMode}
      />
    </>
  );
}
