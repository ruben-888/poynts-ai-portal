"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Catalog } from "./schema";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Client {
  ent_id: number;
  ent_name: string;
}

interface ManageCatalogDialogProps {
  mode?: "create" | "edit" | "copy";
  catalog?: Catalog;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

async function getClients() {
  const response = await fetch(`/api/clients`);
  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }
  return response.json();
}

export function ManageCatalogDialog({
  mode = "create",
  catalog,
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ManageCatalogDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    name: string;
    client_id: number | string;
  }>({
    name: "",
    client_id: "",
  });
  const isEdit = mode === "edit";
  const isCopy = mode === "copy";
  const queryClient = useQueryClient();
  const catalogNameInputRef = React.useRef<HTMLInputElement>(null);

  // Use controlled or uncontrolled mode
  const isControlled =
    controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  // Query to get all clients for client selection
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Mutation for updating catalog
  const updateCatalogMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      name: string;
      client_id: number;
    }) => {
      const response = await fetch("/api/catalogs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update catalog");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      setOpen(false);
      toast.success("Catalog updated successfully");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutation for creating catalog
  const createCatalogMutation = useMutation({
    mutationFn: async (data: { name: string; client_id: number }) => {
      const response = await fetch("/api/catalogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create catalog");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      setOpen(false);
      toast.success("Catalog created successfully");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutation for copying catalog
  const copyCatalogMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      client_id: number;
      source_catalog_id: number;
    }) => {
      const response = await fetch("/api/catalogs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to copy catalog");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      setOpen(false);
      toast.success("Catalog copied successfully");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Initialize form data when dialog opens or catalog changes
  React.useEffect(() => {
    if (open) {
      if ((isEdit || isCopy) && catalog) {
        // For edit mode, populate with catalog data
        // For copy mode, populate with catalog data but append "copy" to name
        setFormData({
          name: isCopy ? `${catalog.name} copy` : catalog.name,
          client_id: catalog.client.id,
        });
      } else {
        // For create mode, reset to blank values
        setFormData({
          name: "",
          client_id: "",
        });

        // Focus the catalog name input only when in create mode
        setTimeout(() => {
          if (catalogNameInputRef.current) {
            catalogNameInputRef.current.focus();
          }
        }, 100);
      }
    }
  }, [open, catalog, isEdit, isCopy]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Catalog name is required");
      return;
    }

    if (!formData.client_id) {
      toast.error("Please select a client");
      return;
    }

    const formPayload = {
      ...(isEdit && catalog && { id: catalog.id }),
      name: formData.name.trim(),
      client_id: Number(formData.client_id),
      ...(isCopy && catalog && { source_catalog_id: catalog.id }),
    };

    if (isEdit) {
      updateCatalogMutation.mutate(formPayload as any);
    } else if (isCopy) {
      copyCatalogMutation.mutate(formPayload as any);
    } else {
      createCatalogMutation.mutate(formPayload);
    }
  };

  const isLoading =
    updateCatalogMutation.isPending ||
    createCatalogMutation.isPending ||
    copyCatalogMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit
                ? "Edit Catalog"
                : isCopy
                  ? "Copy Catalog"
                  : "New Catalog"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Edit existing catalog."
                : isCopy
                  ? "Create a copy of the existing catalog with all its items."
                  : "Create a new catalog for a client."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="catalogName">
                Catalog Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="catalogName"
                placeholder="Enter catalog name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                ref={catalogNameInputRef}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="client">
                Client <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.client_id.toString()}
                onValueChange={(value) => handleInputChange("client_id", value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      clientsLoading ? "Loading..." : "Select a client"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: Client) => (
                    <SelectItem
                      key={client.ent_id}
                      value={client.ent_id.toString()}
                    >
                      {client.ent_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit
                    ? "Updating..."
                    : isCopy
                      ? "Copying..."
                      : "Creating..."}
                </>
              ) : isEdit ? (
                "Update Catalog"
              ) : isCopy ? (
                "Copy Catalog"
              ) : (
                "Create Catalog"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
