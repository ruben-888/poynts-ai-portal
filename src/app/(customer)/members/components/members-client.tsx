"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { DataTable } from "@/components/data-table/data-table";
import { columns, Member } from "./columns";
import { useEffect } from "react";
import { Row } from "@tanstack/react-table";
import { ManageMember } from "./manage-member";

// Define the enterprise schema
const enterpriseSchema = z
  .object({
    entId: z.number(),
    entName: z.string(),
    entType: z.string().nullable(),
    entStatus: z.string().nullable(),
  })
  .nullable();

// Define the schema for member data validation
const memberSchema = z.object({
  id: z.number(),
  email: z.string(),
  mPhone: z.string(),
  name: z.string(),
  status: z.string(),
  zip: z.string().nullable(),
  mode: z.string().nullable(),
  customerMemberId: z.string(),
  clientName: z.string(),
  lastActivityDate: z.string().nullable(),
  createDate: z.string().nullable(),
  updateDate: z.string().nullable(),
  enterprise: enterpriseSchema,
});

// Define the metadata schema
const metaSchema = z.object({
  totalMembers: z.number(),
  totalClients: z.number(),
  returned: z.number(),
  limit: z.number(),
});

const membersResponseSchema = z.object({
  data: z.array(memberSchema),
  meta: metaSchema,
});

// Function to fetch members data
async function getMembers(): Promise<z.infer<typeof membersResponseSchema>> {
  const response = await fetch("/api/members");
  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }
  const data = await response.json();
  return membersResponseSchema.parse(data);
}

export function MembersClient() {
  // State to track if refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New state for the manage member dialog
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Get the query client for invalidation
  const queryClient = useQueryClient();

  // Create initial column visibility state
  const initialColumnVisibility = {
    id: true, // Show ID column as first column
    email: false,
    name: false, // Hide name column by default
    mPhone: false, // Hide phone column by default
    mode: false, // Hide mode column by default
    status: false, // Hide status column by default
    updateDate: false, // Hide last updated column by default
  };

  // Filter out the select column from columns
  const tableColumns = columns.filter((column) => column.id !== "select");

  // Effect to hide the row selection count using CSS
  useEffect(() => {
    // Add a style tag to hide the row selection text
    const style = document.createElement("style");
    style.innerHTML = `
      .data-table-pagination-row-count {
        color: transparent !important;
        user-select: none !important;
      }
      
      /* Ensure pagination container keeps justify-between */
      .data-table-pagination {
        display: flex !important;
        justify-content: space-between !important;
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);

    // Add classes to the pagination elements
    const observer = new MutationObserver((mutations) => {
      // Target the row selection count text
      const rowSelectionElements = document.querySelectorAll(
        ".flex-1.text-sm.text-muted-foreground"
      );
      rowSelectionElements.forEach((el) => {
        el.classList.add("data-table-pagination-row-count");
      });

      // Target the pagination container
      const paginationContainers = document.querySelectorAll(
        ".flex.items-center.justify-between.px-2"
      );
      paginationContainers.forEach((el) => {
        el.classList.add("data-table-pagination");
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  // Fetch members using React Query
  const { data, isLoading, error, refetch } = useQuery<
    z.infer<typeof membersResponseSchema>
  >({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  // Function to handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Small delay to ensure animation is visible
    }
  };

  // Function to handle row double-click
  const handleRowDoubleClick = (row: Row<Member>) => {
    setSelectedMember(row.original);
    setIsManageOpen(true);
  };

  // Extract members from the response data
  const members = data?.data || [];

  // Extract metadata for display
  const totalMembers = data?.meta?.totalMembers || 0;
  const totalClients = data?.meta?.totalClients || 0;

  // Generate dynamic client options from the actual data
  const clientOptions = Array.from(
    new Set(members.map((member) => member.clientName).filter(Boolean))
  )
    .sort()
    .map((clientName) => ({
      value: clientName,
      label: clientName,
    }));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading members...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error:{" "}
        {error instanceof Error ? error.message : "Failed to load members"}
      </div>
    );
  }

  return (
    <div className="h-full flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            {totalMembers.toLocaleString()} Total Member
            {totalMembers !== 1 ? "s" : ""} • {totalClients} Client
            {totalClients !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <DataTable
        data={members}
        columns={tableColumns}
        searchColumn={{
          id: "name",
          placeholder: "Search by name...",
        }}
        searchableColumns={[
          {
            id: "name",
            displayName: "Name",
          },
          {
            id: "customerMemberId",
            displayName: "External ID",
          },
          {
            id: "mPhone",
            displayName: "Phone",
          },
        ]}
        filters={[
          {
            id: "clientName",
            title: "Client",
            options: clientOptions,
          },
        ]}
        enableRowSelection={false}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        initialColumnVisibility={initialColumnVisibility}
        enableCSVExport={true}
        csvFilename="carepoynt-members-export"
        showActionsButton={false}
        onRowDoubleClick={handleRowDoubleClick}
      />

      {/* Member Management Dialog */}
      <ManageMember
        isOpen={isManageOpen}
        onOpenChange={setIsManageOpen}
        member={selectedMember}
      />
    </div>
  );
}
