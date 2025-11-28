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
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client } from "./schema";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ManageClientDialogProps {
  mode?: "create" | "edit";
  client?: Client;
  children?: React.ReactNode;
  onMenuClose?: () => void; // Keeping for backward compatibility
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

export function ManageClientDialog({
  mode = "create",
  client,
  children,
  onMenuClose,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ManageClientDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<Client>>(client || {});
  const isEdit = mode === "edit";
  const queryClient = useQueryClient();
  const clientNameInputRef = React.useRef<HTMLInputElement>(null);

  // Use controlled or uncontrolled mode
  const isControlled =
    controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  // Query to get all clients for parent selection
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Mutation for updating client
  const updateClientMutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const response = await fetch("/api/clients", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update client");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
      toast.success("Client updated successfully");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutation for creating client
  const createClientMutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
      toast.success("Client created successfully");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Initialize form data when dialog opens or client changes
  React.useEffect(() => {
    if (open) {
      if (isEdit && client) {
        // For edit mode, populate with client data
        setFormData(client);
      } else {
        // For create mode, reset to blank values with parent set to #1
        setFormData({
          ent_name: "",
          ent_desc: "",
          ent_status: "active",
          ent_id_parent: "1", // Default to parent #1 instead of "none"
        });

        // Focus the client name input only when in create mode
        setTimeout(() => {
          if (clientNameInputRef.current) {
            clientNameInputRef.current.focus();
          }
        }, 100);
      }
    }
  }, [open, client, isEdit]);

  // Custom handler for dialog open change
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // When dialog opens, close the parent menu if provided
    if (newOpen && onMenuClose) {
      onMenuClose();
    }
  };

  // Filter out the current client from parent options to prevent circular references
  const availableParents = clients.filter(
    (c: Client) => c.ent_id !== client?.ent_id
  );

  const handleInputChange = (key: keyof Client, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only include fields that are actually in the form
    const formPayload = {
      ...(isEdit && { ent_id: formData.ent_id }),
      ent_name: formData.ent_name || "",
      ent_desc: formData.ent_desc || "",
      ent_status: formData.ent_status || "active",
      ent_id_parent:
        formData.ent_id_parent === "none" ? "1" : formData.ent_id_parent,
    };

    if (isEdit) {
      updateClientMutation.mutate(formPayload);
    } else {
      createClientMutation.mutate(formPayload);
    }
  };

  const isLoading =
    updateClientMutation.isPending || createClientMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Client" : "New Client"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Edit existing client or organization."
                : "Create a new client or organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="parentClient">Parent Client</label>
              <Select
                value={formData.ent_id_parent || "1"}
                onValueChange={(value) =>
                  handleInputChange("ent_id_parent", value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      clientsLoading ? "Loading..." : "Select a client"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableParents.map((parentClient: Client) => (
                    <SelectItem
                      key={parentClient.ent_id}
                      value={parentClient.ent_id}
                    >
                      {parentClient.ent_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="clientName">
                Client Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={formData.ent_name || ""}
                onChange={(e) => handleInputChange("ent_name", e.target.value)}
                required
                ref={clientNameInputRef}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                placeholder="Enter client description"
                className="resize-none"
                value={formData.ent_desc || ""}
                onChange={(e) => handleInputChange("ent_desc", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status">Client Status</label>
              <Select
                value={formData.ent_status || "active"}
                onValueChange={(value) =>
                  handleInputChange("ent_status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Update Client"
              ) : (
                "Create Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
