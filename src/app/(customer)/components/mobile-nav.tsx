"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MainNav } from "./main-nav";
import TeamSwitcher from "./team-switcher";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>
            <TeamSwitcher />
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 pl-6">
          <MainNav
            showIcons={true}
            className="flex-col items-start space-y-3 space-x-0"
            onNavigate={() => setOpen(false)}
            isMobile={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
