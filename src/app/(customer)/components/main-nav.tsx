"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  UserCircle,
  Gift,
  Settings,
  ClipboardList,
  ChevronDown,
  Activity,
  Key,
  UserCog,
  BarChart3,
  HelpCircle,
  Loader2,
  Megaphone,
  Calendar,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useGateValue } from "@/lib/hooks/use-feature-flags";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  showIcons?: boolean;
  onNavigate?: () => void;
  isMobile?: boolean;
}

export function MainNav({
  className,
  showIcons = false,
  onNavigate,
  isMobile = false,
  ...props
}: MainNavProps) {
  const pathname = usePathname();
  const { openOrganizationProfile } = useClerk();
  const { has, isLoaded, isSignedIn } = useAuth();

  // Statsig Feature Gates
  const isFinancialEnabled = useGateValue("financial_module_enabled");
  const isRewardsEnabled = useGateValue("rewards_module_enabled");
  const isCatalogsEnabled = useGateValue("catalogs_module_enabled");
  const isMembersEnabled = useGateValue("members_module_enabled");

  const isClientsEnabled = useGateValue("clients_module_enabled");
  const isTransactionsEnabled = useGateValue("transactions_module_enabled");
  const isPlatformAdminEnabled = false; // useGateValue("platform_admin_enabled");
  const isSupportEnabled = useGateValue("support_module_enabled");
  const isUserManagementEnabled = useGateValue("user_management");

  // System Items
  const isSystemActivityEnabled = useGateValue("system_activity_enabled");
  const isApiCredentialsEnabled = useGateValue("api_credentials_enabled");
  const isManageAccessEnabled = useGateValue("manage_access_enabled");
  const isSystemEnabled =
    isSystemActivityEnabled ||
    isApiCredentialsEnabled ||
    isManageAccessEnabled ||
    isPlatformAdminEnabled;

  // Base classes for links - different for mobile vs desktop
  const baseLinkClasses = isMobile
    ? "text-base font-medium transition-colors hover:text-primary flex items-center gap-3 py-1"
    : "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2";

  // Show a loading spinner during loading instead of returning null
  if (!isLoaded) {
    return (
      <nav
        className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        {...props}
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </nav>
    );
  }

  // Only hide if explicitly not signed in after loading completes
  if (!isSignedIn) return null;

  const canViewClients = has({ permission: "org:clients:view" });
  const canViewMembers = has({ permission: "org:members:view" });

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={cn(
          baseLinkClasses,
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
        )}
      >
        {showIcons && <LayoutDashboard className="h-5 w-5" />}
        Dashboard
      </Link>
      <Link
        href="/campaigns"
        onClick={onNavigate}
        className={cn(
          baseLinkClasses,
          pathname === "/campaigns" || pathname.startsWith("/campaigns/")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        {showIcons && <Megaphone className="h-5 w-5" />}
        Campaigns
      </Link>
      {isRewardsEnabled && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              baseLinkClasses,
              pathname === "/rewards" ||
                pathname.startsWith("/catalogs") ||
                pathname === "/orders" ||
                pathname === "/financial" ||
                pathname === "/programs" ||
                pathname.startsWith("/programs/")
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {showIcons && <Gift className="h-5 w-5" />}
            <span>Rewards</span>
            <ChevronDown className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/programs"
                  onClick={onNavigate}
                  className="flex items-center gap-2 w-full"
                >
                  <Layers className="h-4 w-4" />
                  <span>Programs</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/rewards"
                  onClick={onNavigate}
                  className="flex items-center gap-2 w-full"
                >
                  <Gift className="h-4 w-4" />
                  <span>Reward List</span>
                </Link>
              </DropdownMenuItem>
              {isCatalogsEnabled && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/catalogs"
                      onClick={onNavigate}
                      className="flex items-center gap-2 w-full"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Catalogs</span>
                    </Link>
                  </DropdownMenuItem>
{/*                  <DropdownMenuItem asChild>
                    <Link
                      href="/catalogs/overview"
                      onClick={onNavigate}
                      className="flex items-center gap-2 w-full"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Catalog Overview</span>
                    </Link>
                  </DropdownMenuItem>*/}
                </>
              )}
              {false && isTransactionsEnabled && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/orders"
                    onClick={onNavigate}
                    className="flex items-center gap-2 w-full"
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {false && isFinancialEnabled && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/financial"
                    onClick={onNavigate}
                    className="flex items-center gap-2 w-full"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Financial</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {isClientsEnabled && canViewClients && (
        <Link
          href="/clients"
          onClick={onNavigate}
          className={cn(
            baseLinkClasses,
            pathname === "/clients" ? "text-primary" : "text-muted-foreground"
          )}
        >
          {showIcons && <Users className="h-5 w-5" />}
          Clients
        </Link>
      )}
      {isMembersEnabled && canViewMembers && (
        <Link
          href="/members"
          onClick={onNavigate}
          className={cn(
            baseLinkClasses,
            pathname === "/members" ? "text-primary" : "text-muted-foreground"
          )}
        >
          {showIcons && <UserCircle className="h-5 w-5" />}
          Members
        </Link>
      )}
      {false && isSystemEnabled && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              baseLinkClasses,
              pathname.startsWith("/system") || pathname === "/status"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {showIcons && <Settings className="h-5 w-5" />}
            <span>System</span>
            <ChevronDown className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {isUserManagementEnabled &&
                has({ permission: "org:users:view" }) && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/users"
                      onClick={onNavigate}
                      className="flex items-center gap-2 w-full"
                    >
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              {isSystemActivityEnabled && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/system-activity"
                    onClick={onNavigate}
                    className="flex items-center gap-2 w-full"
                  >
                    <Activity className="h-4 w-4" />
                    <span>System Activity</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link
                  href="/status"
                  onClick={onNavigate}
                  className="flex items-center gap-2 w-full"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Platform Status</span>
                </Link>
              </DropdownMenuItem>
              {isApiCredentialsEnabled && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/credentials"
                    onClick={onNavigate}
                    className="flex items-center gap-2 w-full"
                  >
                    <Key className="h-4 w-4" />
                    <span>API Credentials</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {isManageAccessEnabled && (
                <DropdownMenuItem
                  onClick={() => {
                    openOrganizationProfile();
                    onNavigate?.();
                  }}
                  className="flex items-center gap-2 w-full cursor-pointer"
                >
                  <UserCog className="h-4 w-4" />
                  <span>Manage Access</span>
                </DropdownMenuItem>
              )}
              {isPlatformAdminEnabled && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/dashboard"
                      onClick={onNavigate}
                      className="flex items-center gap-2 w-full"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Platform Admin</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {false && isSupportEnabled && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              baseLinkClasses,
              pathname.startsWith("/feedback") ||
                pathname.startsWith("/incident-report") ||
                pathname.startsWith("/calendar")
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {showIcons && <HelpCircle className="h-5 w-5" />}
            <span>Support</span>
            <ChevronDown className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/feedback"
                  onClick={onNavigate}
                  className="flex items-center gap-2 w-full"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Feedback</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/incident-report"
                  onClick={onNavigate}
                  className="flex items-center gap-2 w-full"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>Incident Report</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/calendar"
                  onClick={onNavigate}
                  className="flex items-center gap-2 w-full"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
