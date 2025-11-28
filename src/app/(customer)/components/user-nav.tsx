"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useClerk, useUser, SignOutButton, useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";

// Temporary flag to hide notification bell (COMING SOON feature)
// TODO: Set this to true when notification feature is ready to launch
const SHOW_NOTIFICATIONS = false;

// Notification type for type safety
type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
};

// Mock notifications data
const notifications: Notification[] = [
  {
    id: "1",
    title: "Amazon Gift Card Status",
    description: "Your $50 Amazon gift card is ready for redemption",
    time: "2 mins ago",
  },
  {
    id: "2",
    title: "Nike Reward Update",
    description: "Nike $100 gift card has been processed",
    time: "1 hour ago",
  },
];

function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="cursor-pointer p-3"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground">
                {notification.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.time}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserNav() {
  const { theme, setTheme } = useTheme();
  const { openUserProfile } = useClerk();
  const { user } = useUser();

  const { has, sessionClaims } = useAuth();

  // console.log("currentUser-sessionClaims", sessionClaims);

  if (!has) return null;

  const canAccessCPAdmin =
    sessionClaims?.org_slug === "carepoynt" &&
    has({ permission: "org:cpadmin:access" });

  // console.log("canAccessCPAdmin", canAccessCPAdmin);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative"
      >
        {theme === "dark" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
      {/* Notification bell temporarily hidden - COMING SOON */}
      {SHOW_NOTIFICATIONS && <NotificationDropdown />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-7 w-7 rounded-full">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
              <AvatarFallback>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => openUserProfile()}>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            {canAccessCPAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">
                  Platform Admin
                  <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            )}
            {canAccessCPAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/users">Platform Users</Link>
              </DropdownMenuItem>
            )}
            {/* <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <SignOutButton redirectUrl="/login">
            <DropdownMenuItem>
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
