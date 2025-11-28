"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus, Copy, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

// Define the type for API response
interface CredentialApiResponse {
  data: {
    type: string;
    value: string;
    obfuscatedValue: string;
  }[];
}

// Define the type for our credential data
interface Credential {
  id: string;
  name: string;
  apiKey: string;
  created: Date;
  lastUsed: Date | null;
  createdBy: string;
  permissions: string;
}

// Fetch credentials from the API
const fetchCredentials = async (): Promise<CredentialApiResponse> => {
  const { data } = await axios.get(
    "http://localhost:3000/api/legacy/credentials",
  );
  return data;
};

export default function CredentialsClient() {
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [currentCredential, setCurrentCredential] = useState<Credential | null>(
    null,
  );
  const [newCredentialKey, setNewCredentialKey] = useState<string>("");

  // Edit form
  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  // Fetch credentials data using React Query
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["credentials"],
    queryFn: fetchCredentials,
  });

  // Transform API data to our Credential interface
  const credentials = useMemo(() => {
    if (!apiData?.data) return [];

    return apiData.data.map((cred, index) => ({
      id: String(index + 1),
      name: `${cred.type.charAt(0).toUpperCase() + cred.type.slice(1)} API Key`,
      apiKey: cred.obfuscatedValue,
      created: new Date(), // Placeholder until API provides this
      lastUsed: index % 2 === 0 ? new Date() : null, // Placeholder
      createdBy: "John Doe", // Placeholder
      permissions: "all", // Placeholder
    }));
  }, [apiData]);

  // Define actions for the credentials table
  const credentialActions = [
    {
      label: "Edit",
      onClick: (row: any) => {
        console.log("Edit credential row:", row);
        if (!row || !row.original) {
          console.error("Invalid row or missing original data");
          toast.error("Unable to edit credential", {
            description: "Could not retrieve credential data.",
          });
          return;
        }

        // Try to get the name directly from the row using getValue if possible
        let name = "";
        try {
          // First try to get name using the row's getValue method
          if (typeof row.getValue === "function") {
            name = row.getValue("name") || "";
          }
          // Fallback to accessing original directly
          else if (row.original && typeof row.original.name === "string") {
            name = row.original.name;
          }
        } catch (err) {
          console.error("Error retrieving name:", err);
          name = "";
        }

        const credential = row.original as Credential;
        console.log("Credential to edit:", credential);

        setCurrentCredential(credential);
        form.setValue("name", name);

        setIsEditDialogOpen(true);
      },
      shortcut: "⌘E",
    },
    {
      label: "Revoke",
      onClick: (rowData: any) => {
        console.log("Preparing to revoke credential:", rowData);
        if (!rowData) {
          console.error("Invalid credential data");
          toast.error("Unable to revoke credential", {
            description: "Could not retrieve credential data.",
          });
          return;
        }

        // The DataTableRowActions component passes row.original directly to onClick
        const credential = rowData as Credential;
        setCurrentCredential(credential);
        setIsRevokeDialogOpen(true);
      },
      isDestructive: true,
      shortcut: "⌘R",
    },
  ];

  // Function to handle row double-click
  const handleRowDoubleClick = (row: any) => {
    // Use the same edit logic as in the actions
    const editAction = credentialActions.find(
      (action) => action.label === "Edit",
    );
    if (editAction) {
      editAction.onClick(row);
    }
  };

  // Function to handle credential creation
  const handleCreateCredential = () => {
    // Generate a mock API key (in real implementation this would come from the server)
    const newApiKey = `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setNewCredentialKey(newApiKey);
    setIsCreateDialogOpen(true);
  };

  // Function to handle copying to clipboard
  const handleCopyCredential = () => {
    navigator.clipboard.writeText(newCredentialKey);
    toast.success("Copied to clipboard", {
      description: "The API credential has been copied to your clipboard.",
    });
  };

  // Function to handle saving edited credential
  const onSaveEdit = form.handleSubmit((data) => {
    if (!currentCredential) return;

    console.log("Updated credential name:", data.name);
    toast.success("Credential Updated", {
      description: "The credential name has been updated successfully.",
    });
    setIsEditDialogOpen(false);
  });

  // Function to handle credential revocation
  const handleRevokeCredential = () => {
    if (!currentCredential) return;

    console.log("Revoking credential:", currentCredential);
    // In a real implementation, this would call an API to revoke the credential

    toast.success("Credential Revoked", {
      description: "The API credential has been revoked successfully.",
    });
    setIsRevokeDialogOpen(false);
    // Optionally refresh the credentials list
    refetch();
  };

  // Define columns for the credentials table
  const columns: ColumnDef<Credential>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "apiKey",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="API Key" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("apiKey")}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "created",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created") as Date;
        return <div>{format(date, "PPP")}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "lastUsed",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Used" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("lastUsed") as Date | null;
        return <div>{date ? format(date, "PPP") : "Never"}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Permissions" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("permissions")}</Badge>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} actions={credentialActions} />
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Credentials</h2>
          <p className="text-muted-foreground">
            Manage your API credentials for integrating with the Care Poynt
            platform.
          </p>
        </div>
        <Button onClick={handleCreateCredential}>
          <Plus className="mr-2 h-4 w-4" /> New API Credential
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={credentials}
        disablePagination={true} // Disable pagination
        enableRefresh={false}
        isRefreshing={isLoading}
        onRefresh={() => refetch()}
        onRowDoubleClick={handleRowDoubleClick}
        showViewOptions={false}
        showActionsButton={false}
      />

      {/* Create New Credential Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New API Credential</DialogTitle>
            <DialogDescription>
              A new API credential has been created. Copy it now as you
              won&apos;t be able to view it again.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>
              This is the only time you&apos;ll see this credential. Make sure
              to copy it to a secure location.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="newCredential">API Key</Label>
              <div className="flex items-center">
                <Input
                  id="newCredential"
                  value={newCredentialKey}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="ml-2"
                  onClick={handleCopyCredential}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Credential Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Credential</DialogTitle>
            <DialogDescription>
              Update the name for this API credential.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSaveEdit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credential Name</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormDescription>
                      A descriptive name helps identify this credential&apos;s
                      purpose.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentCredential && (
                <div>
                  <Label>API Key</Label>
                  <Input
                    value={currentCredential.apiKey}
                    disabled
                    className="font-mono mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    API key cannot be changed.
                  </p>
                </div>
              )}

              <DialogFooter className="sm:justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Revoke Credential Confirmation Dialog */}
      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke API Credential</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API credential? This action
              cannot be undone and will invalidate any integrations using this
              credential.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Revoking this credential will immediately invalidate it. Any
              services using this credential will stop working.
            </AlertDescription>
          </Alert>

          {currentCredential && (
            <div className="mt-4">
              <Label>API Key to Revoke</Label>
              <Input
                value={currentCredential.apiKey}
                disabled
                className="font-mono mt-1"
              />
            </div>
          )}

          <DialogFooter className="sm:justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRevokeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRevokeCredential}
            >
              Revoke Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
