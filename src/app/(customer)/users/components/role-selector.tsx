"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";

const BASE_ROLE_OPTIONS = [
  { label: "Basic", value: "org:basic" },
  { label: "Rewards Admin", value: "org:rewards_admin" },
  { label: "Super Admin", value: "org:super_admin" },
];

const CP_ULTRA_ADMIN_ROLE = {
  label: "CP Ultra Admin",
  value: "org:cp_ultra_admin",
};

// Complete role mapping for consistent display names
const ALL_ROLE_OPTIONS = [...BASE_ROLE_OPTIONS, CP_ULTRA_ADMIN_ROLE];
const ROLE_DISPLAY_MAP = Object.fromEntries(
  ALL_ROLE_OPTIONS.map((role) => [role.value, role.label])
);

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

interface RoleSelectorProps {
  userId: string;
  initialRole: string;
}

export function RoleSelector({ userId, initialRole }: RoleSelectorProps) {
  const queryClient = useQueryClient();
  const { has, isLoaded } = useAuth();

  const canManageUsers = isLoaded && has({ permission: "org:users:manage" });
  const canAccessCPUltraAdmin =
    isLoaded && has({ permission: "org:cpadmin:access" });

  // Include CP Ultra Admin in dropdown options if:
  // 1. User has CP admin access, OR
  // 2. The current user already has CP Ultra Admin role (so they can see their current state)
  const shouldShowCPUltraAdmin =
    canAccessCPUltraAdmin || initialRole === "org:cp_ultra_admin";
  const roleOptions = shouldShowCPUltraAdmin
    ? [...BASE_ROLE_OPTIONS, CP_ULTRA_ADMIN_ROLE]
    : BASE_ROLE_OPTIONS;

  const { mutate: updateRole, isPending } = useMutation({
    mutationFn: (role: string) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-users"] });
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user role");
      console.error("Error updating role:", error);
    },
  });

  // Show loading state while permissions are being checked
  if (!isLoaded) {
    return <div className="h-10 w-[200px] animate-pulse bg-muted rounded-md" />;
  }

  // If user can't manage users, show a read-only badge with the role
  if (!canManageUsers) {
    // Always use the complete role mapping for display names
    const displayName = ROLE_DISPLAY_MAP[initialRole] || initialRole;
    return (
      <Badge variant="secondary" className="h-8 px-3 font-medium">
        {displayName}
      </Badge>
    );
  }

  return (
    <Select
      defaultValue={initialRole}
      onValueChange={(value) => {
        // Prevent assignment of CP Ultra Admin if user doesn't have permission
        if (value === "org:cp_ultra_admin" && !canAccessCPUltraAdmin) {
          toast.error(
            "You don't have permission to assign CP Ultra Admin role"
          );
          return;
        }
        updateRole(value);
      }}
      disabled={isPending}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={
              option.value === "org:cp_ultra_admin" && !canAccessCPUltraAdmin
            }
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
