"use client";

import * as React from "react";
import { Info, Building2, Key } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Organization } from "@/app/api/v1/(admin)/organizations/schema";

interface ViewOrganizationProps {
  item: Organization | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const navItems = [
  { name: "General", icon: Info },
  { name: "Hierarchy", icon: Building2 },
  { name: "Integration", icon: Key },
];

// Status badge variant mapping
const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  suspended: "destructive",
};

export function ViewOrganization({
  item,
  isOpen,
  onOpenChange,
}: ViewOrganizationProps) {
  const [activeTab, setActiveTab] = React.useState("General");

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("General");
    }
  }, [isOpen]);

  if (!item) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <div className="text-lg font-medium">{item.name}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={statusVariants[item.status] || "secondary"}
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Organization ID
                  </Label>
                  <div className="font-mono text-xs break-all bg-muted/50 p-2 rounded">
                    {item.id}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Created
                  </Label>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Last Updated
                  </Label>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(item.updated_at), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <div className="rounded-lg border bg-muted/10 p-4 text-sm">
                {item.description || "No description provided"}
              </div>
            </div>
          </div>
        );

      case "Hierarchy":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Parent Organization
                </Label>
                {item.parent_id ? (
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Parent Org</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {item.parent_id}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground">
                    This is a root organization (no parent)
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Organization Level
                </Label>
                <Badge variant="outline" className="text-sm">
                  {item.parent_id ? "Child Organization" : "Root Organization"}
                </Badge>
              </div>
            </div>
          </div>
        );

      case "Integration":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Clerk Organization ID
                </Label>
                {item.auth_provider_org_id ? (
                  <div className="rounded-lg border bg-card p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Clerk Integration
                        </span>
                      </div>
                      <div className="font-mono text-xs break-all bg-muted/50 p-2 rounded">
                        {item.auth_provider_org_id}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground">
                    No Clerk organization linked
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Integration Status
                </Label>
                <Badge
                  variant={item.auth_provider_org_id ? "default" : "outline"}
                >
                  {item.auth_provider_org_id ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">View Organization</DialogTitle>
        <DialogDescription className="sr-only">
          View details for {item.name}
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((navItem, index) => (
                      <SidebarMenuItem
                        key={navItem.name}
                        className={index === 0 ? "mt-[30px]" : ""}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={navItem.name === activeTab}
                          onClick={() => setActiveTab(navItem.name)}
                        >
                          <button className="w-full">
                            <navItem.icon className="h-4 w-4" />
                            <span>{navItem.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[680px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Organizations</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
