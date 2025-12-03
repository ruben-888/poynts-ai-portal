"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Building2 } from "lucide-react";
import {
  useAuth,
  useClerk,
  useOrganization,
  useOrganizationList,
} from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/components/context/tenant-provider";

interface Organization {
  id: string;
  name: string;
  slug: string | null;
  imageUrl?: string;
}

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActive } = useClerk();

  // Debug: log to help identify issues
  console.log("[OrganizationSwitcher] Rendering...");

  const tenantContext = useTenant();
  console.log("[OrganizationSwitcher] TenantContext:", tenantContext);

  const { setCurrentOrgId } = tenantContext;

  // Get current organization
  const { organization: currentOrg, isLoaded: isOrgLoaded } = useOrganization();

  // Super admin detection (same pattern as user-nav.tsx)
  const { has, isLoaded: isAuthLoaded } = useAuth();
  const isSuperAdmin = has?.({ permission: "org:cpadmin:access" }) ?? false;

  // Regular users: fetch orgs from Clerk's useOrganizationList
  const { userMemberships, isLoaded: isOrgListLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // Super admins: fetch all orgs from API
  const {
    data: allOrgsData,
    isLoading: isAllOrgsLoading,
  } = useQuery({
    queryKey: ["all-organizations"],
    queryFn: async () => {
      const response = await fetch("/api/users/organizations");
      if (!response.ok) throw new Error("Failed to fetch organizations");
      return response.json();
    },
    enabled: isSuperAdmin && isAuthLoaded,
  });

  // Normalize organizations to a common shape
  const organizations: Organization[] = React.useMemo(() => {
    if (isSuperAdmin && allOrgsData?.data) {
      return allOrgsData.data.map((org: { id: string; name: string; slug: string | null }) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        imageUrl: undefined,
      }));
    }

    if (userMemberships?.data) {
      return userMemberships.data.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        imageUrl: membership.organization.imageUrl,
      }));
    }

    return [];
  }, [isSuperAdmin, allOrgsData, userMemberships]);

  // Loading state
  const isLoading =
    !isAuthLoaded ||
    !isOrgLoaded ||
    (!isSuperAdmin && !isOrgListLoaded) ||
    (isSuperAdmin && isAllOrgsLoading);

  // Handle organization switch
  const handleOrgSwitch = async (orgId: string) => {
    if (orgId === currentOrg?.id) {
      setOpen(false);
      return;
    }

    try {
      setIsSwitching(true);

      // 1. Set Clerk's active organization
      await setActive({ organization: orgId });

      // 2. Update TenantContext
      setCurrentOrgId(orgId);

      // 3. Invalidate all queries to refetch with new org context
      await queryClient.invalidateQueries();

      // 4. Refresh the page to ensure server components get new org
      router.refresh();

      // 5. Close the popover
      setOpen(false);
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  // Get display info for current org
  const currentOrgDisplay = React.useMemo(() => {
    if (currentOrg) {
      return {
        name: currentOrg.name,
        imageUrl: currentOrg.imageUrl,
      };
    }
    // Fallback: find in organizations list
    const found = organizations.find((org) => org.id === currentOrg?.id);
    return found ? { name: found.name, imageUrl: found.imageUrl } : null;
  }, [currentOrg, organizations]);

  // If loading, show spinner
  if (isLoading) {
    return (
      <Button
        variant="outline"
        className={cn("w-[200px] justify-start", className)}
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // If only one organization and not a super admin, render simple button
  if (organizations.length <= 1 && !isSuperAdmin) {
    return (
      <Button
        variant="outline"
        className={cn("w-[200px] justify-start", className)}
      >
        <Avatar className="mr-2 h-5 w-5">
          <AvatarImage
            src={currentOrgDisplay?.imageUrl}
            alt={currentOrgDisplay?.name}
          />
          <AvatarFallback>
            <Building2 className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
        <span className="truncate">{currentOrgDisplay?.name || "No org"}</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select an organization"
          className={cn("w-[200px] justify-between", className)}
          disabled={isSwitching}
        >
          {isSwitching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Switching...
            </>
          ) : (
            <>
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage
                  src={currentOrgDisplay?.imageUrl}
                  alt={currentOrgDisplay?.name}
                />
                <AvatarFallback>
                  <Building2 className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {currentOrgDisplay?.name || "Select org..."}
              </span>
            </>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup
              heading={
                <span className="flex items-center gap-2">
                  {isSuperAdmin ? "All Organizations" : "Your Organizations"}
                  {isSuperAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </span>
              }
            >
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleOrgSwitch(org.id)}
                  className="text-sm"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src={org.imageUrl} alt={org.name} />
                    <AvatarFallback>
                      <Building2 className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{org.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentOrg?.id === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
