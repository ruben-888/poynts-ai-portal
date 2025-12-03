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
import { ManageProgram, Program } from "./manage-program";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  archived: "bg-slate-100 text-slate-800",
};

async function fetchPrograms(organizationId: string): Promise<Program[]> {
  const response = await fetch(
    `/api/programs?organization_id=${organizationId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch programs");
  }
  const result = await response.json();
  return result.data;
}

export default function ProgramsClient() {
  const { currentOrgId, isInitialized } = useTenant();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<Program | null>(
    null
  );
  const [isCreateMode, setIsCreateMode] = React.useState(false);

  const {
    data: programs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["programs", currentOrgId],
    queryFn: () => fetchPrograms(currentOrgId),
    enabled: isInitialized && !!currentOrgId,
  });

  const handleNewProgram = () => {
    setSelectedProgram(null);
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleRowClick = (program: Program) => {
    setSelectedProgram(program);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Program>[] = [
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
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "active";
        return (
          <Badge variant="outline" className={statusColors[status] || ""}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
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
        <p className="text-destructive">Failed to load programs</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={programs}
        searchColumn={{
          id: "name",
          placeholder: "Search programs...",
        }}
        customActions={
          <Button onClick={handleNewProgram}>
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Button>
        }
        enableRowSelection={false}
        rowIdField="id"
      />
      <ManageProgram
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedProgram={selectedProgram}
        isCreateMode={isCreateMode}
      />
    </>
  );
}
