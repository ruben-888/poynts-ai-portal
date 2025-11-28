"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Catalog } from "./schema";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteCatalogDialogProps {
  catalog: Catalog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function deleteCatalog(catalogId: number) {
  const response = await fetch(`/api/catalogs/${catalogId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete catalog");
  }

  return response.json();
}

export function DeleteCatalogDialog({
  catalog,
  open,
  onOpenChange,
}: DeleteCatalogDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteCatalog(catalog.id),
    onSuccess: (data) => {
      toast.success(data.message || "Catalog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete catalog");
    },
  });

  const handleConfirm = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Catalog</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this catalog? This action is not
            reversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="mb-4">
            <p className="mb-2 text-amber-600 font-medium">
              Warning: You are about to delete the following catalog:
            </p>
            <div className="bg-muted p-3 rounded-md">
              <div className="font-medium">{catalog.name}</div>
              <div className="text-sm text-muted-foreground">
                Client: {catalog.client.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {catalog.items_total} reward items
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the catalog and all references to its
            reward items. The underlying rewards will not be deleted and will
            remain available for other catalogs. This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete Catalog"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
