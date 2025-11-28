"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function CustomOrganizationSwitcher() {
  const { theme } = useTheme();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-4">
      <OrganizationSwitcher
        hidePersonal
        appearance={{
          elements: {
            organizationSwitcherTrigger: "py-2",
            organizationPreviewTextContainer: {
              fontSize: "14px",
            },
            organizationSwitcherPopoverCard: {
              width: "320px",
            },
            // Disable organization creation
            organizationSwitcherPopoverActionButton__createOrganization: {
              display: "none",
            },
          },
        }}
      />
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  );
}
