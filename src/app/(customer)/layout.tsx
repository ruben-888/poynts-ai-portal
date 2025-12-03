import * as React from "react";
import { MainNav } from "./components/main-nav";
import { OrganizationSwitcher } from "./components/organization-switcher";
import { UserNav } from "./components/user-nav";
import { MobileNav } from "./components/mobile-nav";
import { TenantProvider } from "@/components/context/tenant-provider";

export default async function SecureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <div className="flex-col flex">
        {/* Desktop Navigation */}
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            {/* Mobile Navigation Trigger - only show on small screens */}
            <div className="md:hidden">
              <MobileNav />
            </div>

            {/* Desktop Navigation - hide on small screens */}
            <div className="hidden md:flex w-full">
              <OrganizationSwitcher />
              <MainNav className="mx-6" />
              <div className="ml-auto flex items-center space-x-4">
                <UserNav />
              </div>
            </div>

            {/* Mobile Right Side - show UserNav on mobile */}
            <div className="md:hidden ml-auto">
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">{children}</div>
      </div>
    </TenantProvider>
  );
}
