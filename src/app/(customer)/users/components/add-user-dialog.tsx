"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  organizationId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ROLE_OPTIONS = [
  { label: "Basic", value: "org:basic" },
  { label: "Rewards Admin", value: "org:rewards_admin" },
  { label: "Super Admin", value: "org:super_admin" },
];

async function getOrganizations() {
  const response = await fetch("/api/users/organizations");
  if (!response.ok) {
    throw new Error("Failed to fetch organizations");
  }
  return response.json();
}

export function AddUserDialog() {
  const [open, setOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isCreated, setIsCreated] = React.useState(false);
  const { has, isLoaded, orgId } = useAuth();

  const canAccessCPUltraAdmin =
    isLoaded && has({ permission: "org:cpadmin:access" });

  // Fetch organizations if user has CP Ultra admin access
  const { data: organizationsData } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
    enabled: canAccessCPUltraAdmin,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      organizationId: orgId || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCreating(true);
    
    try {
      const response = await fetch("/api/users/create-org-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }
      
      setIsCreating(false);
      setIsCreated(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setOpen(false);
        form.reset();
        setIsCreated(false);
        // Refresh the users list by reloading the page
        window.location.reload();
      }, 1500);
    } catch (error) {
      setIsCreating(false);
      console.error("Error creating user:", error);
      alert(error instanceof Error ? error.message : "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isCreated ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-lg font-medium">The user is now created</div>
          </div>
        ) : isCreating ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div className="text-lg font-medium">Creating user...</div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter the details for the new user.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {canAccessCPUltraAdmin && organizationsData?.data && (
                  <FormField
                    control={form.control}
                    name="organizationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an organization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {organizationsData.data.map((org: any) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    Add new user
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
