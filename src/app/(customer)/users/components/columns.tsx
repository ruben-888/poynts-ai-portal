"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OrganizationMembership } from "./schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { RoleSelector } from "./role-selector";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Component for organization cell with hooks
function OrganizationCell({ membership }: { membership: OrganizationMembership }) {
  const { has, isLoaded } = useAuth();
  const canAccessCPUltraAdmin = isLoaded && has({ permission: "org:cpadmin:access" });
  
  if (!canAccessCPUltraAdmin) {
    return null;
  }

  return (
    <div className="text-sm">
      {membership.organizationName || "Unknown"}
    </div>
  );
}

// Component for actions cell with hooks
function ActionsCell({ membership }: { membership: OrganizationMembership }) {
  const { has, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const canAccessCPUltraAdmin = isLoaded && has({ permission: "org:cpadmin:access" });
  
  if (!canAccessCPUltraAdmin) {
    return null;
  }

  const handleImpersonate = async () => {
    try {
      const response = await fetch('/api/auth/actor-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: membership.user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to get actor token');
      }

      const { data } = await response.json();
      const token = data?.token;
      if (!token) {
        throw new Error("Actor token not present in response");
      }
      await signOut({ redirectUrl: `/__clerk_ticket=${token}` });
    } catch (error) {
      console.error('Error impersonating user:', error);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="h-8 w-8 p-0"
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Impersonate User</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>
              You&apos;re about to impersonate this user. This will log you out and log you in as them.
            </DialogDescription>
          </DialogHeader>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={membership.user.imageUrl} />
                  <AvatarFallback>
                    {`${membership.user.firstName?.charAt(0) || ""}${membership.user.lastName?.charAt(0) || ""}`}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {membership.user.firstName} {membership.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {membership.user.emailAddresses.find(
                      (email) => email.id === membership.user.primaryEmailAddressId
                    )?.emailAddress}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{membership.role}</Badge>
                    <Badge variant="outline">{membership.organizationName}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImpersonate}>
              Impersonate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<OrganizationMembership>[] = [
  {
    accessorKey: "imageUrl",
    header: () => <div className="w-9"></div>,
    cell: ({ row }) => {
      const user = row.original.user;
      const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;

      return (
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={user.imageUrl}
            alt={`${user.firstName || ""} ${user.lastName || ""}`}
          />
          <AvatarFallback>{initials || "U"}</AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
    size: 50,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress;

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {`${user.firstName || "N/A"} ${user.lastName || ""}`}
          </span>
          {primaryEmail && (
            <span className="text-xs text-muted-foreground">
              {primaryEmail}
            </span>
          )}
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "organizationName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => {
      const membership = row.original;
      return <OrganizationCell membership={membership} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.organizationName || "Unknown");
    },
    size: 150,
  },
  {
    accessorKey: "lastSignInAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Sign In" />
    ),
    cell: ({ row }) => {
      const lastSignInAt = row.original.user.lastSignInAt;
      if (!lastSignInAt) return <div>Never</div>;
      return (
        <div>{formatDistanceToNow(lastSignInAt, { addSuffix: true })}</div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return <div>{formatDistanceToNow(createdAt, { addSuffix: true })}</div>;
    },
    size: 150,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const membership = row.original;
      return (
        <RoleSelector
          userId={membership.user.id}
          initialRole={membership.role}
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.role);
    },
    size: 150,
  },
  {
    id: "actions",
    header: () => <div className="w-9"></div>,
    cell: ({ row }) => {
      const membership = row.original;
      return <ActionsCell membership={membership} />;
    },
    enableSorting: false,
    size: 50,
  },
];
