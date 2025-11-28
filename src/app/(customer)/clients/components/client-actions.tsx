import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "./schema";
import { ManageClientDialog } from "./manage-client-dialog";
import { ViewCatalogModal } from "./catalog/view-catalog-modal";
import React, { useCallback } from "react";

interface ClientActionsProps {
  client: Client;
}

export function ClientActions({ client }: ClientActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [catalogOpen, setCatalogOpen] = React.useState(false);

  const handleEditClick = useCallback(() => {
    setDialogOpen(true);
    setDropdownOpen(false);
  }, []);

  const handleViewCatalogClick = useCallback(() => {
    setCatalogOpen(true);
    setDropdownOpen(false);
  }, []);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleViewCatalogClick}>
            View Catalog
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleEditClick}>
            Edit Client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManageClientDialog
        mode="edit"
        client={client}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ViewCatalogModal
        clientId={client.ent_id.toString()}
        clientName={client.ent_name}
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />
    </>
  );
}
