"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { organizationMembershipsSchema } from "./schema";
import { useAuth } from "@clerk/nextjs";
import { AddUserDialog } from "./add-user-dialog";

const BASE_ROLE_OPTIONS = [
  { label: "Basic", value: "org:basic" },
  { label: "Rewards Admin", value: "org:rewards_admin" },
  { label: "Super Admin", value: "org:super_admin" },
];

const CP_ULTRA_ADMIN_ROLE = {
  label: "CP Ultra Admin",
  value: "org:cp_ultra_admin",
};

async function getOrganizationUsers() {
  const response = await fetch(`/api/users/org-users`);
  if (!response.ok) {
    throw new Error("Failed to fetch organization users");
  }
  const data = await response.json();
  return organizationMembershipsSchema.parse(data);
}

async function updateUserRole(userId: string, role: string) {
  const response = await fetch(`/api/users/org-users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user role");
  }

  return response.json();
}

export function UsersClient() {
  const queryClient = useQueryClient();
  const { has, isLoaded } = useAuth();

  const canAccessCPUltraAdmin =
    isLoaded && has({ permission: "org:cpadmin:access" });

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organization-users"],
    queryFn: getOrganizationUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-users"] });
    },
  });

  const users = usersData?.data || [];

  // Check if any users actually have CP Ultra Admin role in the data
  const hasCPUltraAdminUsers = users.some(
    (user) => user.role === "org:cp_ultra_admin"
  );

  // Filter role options for facet filter based on:
  // 1. User has CP admin access, OR
  // 2. There are actually users with CP Ultra Admin role in the data
  const shouldShowCPUltraAdminInFilter =
    canAccessCPUltraAdmin || hasCPUltraAdminUsers;
  const filterRoleOptions = shouldShowCPUltraAdminInFilter
    ? [...BASE_ROLE_OPTIONS, CP_ULTRA_ADMIN_ROLE]
    : BASE_ROLE_OPTIONS;

  // Create organization filter options for CP Ultra admins
  const organizationOptions = canAccessCPUltraAdmin
    ? Array.from(
        new Set(
          users
            .map((user) => user.organizationName)
            .filter((name): name is string => name !== null && name !== undefined)
        )
      )
        .sort()
        .map((orgName) => ({
          label: orgName,
          value: orgName,
        }))
    : [];

  // Show loading state while permissions are being checked
  if (!isLoaded || isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching organization users:", error);
    return (
      <div className="container py-10">
        <div className="text-red-500">
          Error loading organization users. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Organization Users</h1>
        <AddUserDialog />
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchableColumns={[
          {
            id: "user.firstName",
            displayName: "First Name",
          },
          {
            id: "user.lastName",
            displayName: "Last Name",
          },
        ]}
        searchPlaceholder="Search users..."
        filters={[
          {
            id: "role",
            title: "Role",
            options: filterRoleOptions.map((role) => ({
              label: role.label,
              value: role.value,
            })),
          },
          ...(canAccessCPUltraAdmin && organizationOptions.length > 0
            ? [
                {
                  id: "organizationName",
                  title: "Organization",
                  options: organizationOptions,
                },
              ]
            : []),
        ]}
        enableRefresh={true}
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      />
    </div>
  );
}
