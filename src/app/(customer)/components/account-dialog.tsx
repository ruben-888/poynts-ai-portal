"use client";

import { useState } from "react";
import { Check, Plus, Trash2, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data for current members
const initialMembers = [
  {
    id: "1",
    name: "Xila Noyes",
    email: "mila@carepoynt.com",
    role: "admin",
    avatar: "/avatars/01.png",
  },
  {
    id: "2",
    name: "Alex Chen",
    email: "alex@carepoynt.com",
    role: "manager",
    avatar: "/avatars/02.png",
  },
];

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const [members, setMembers] = useState(initialMembers);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [pendingInvites, setPendingInvites] = useState<
    { email: string; role: string }[]
  >([]);
  const [activeView, setActiveView] = useState<"account" | "members">(
    "account",
  );

  const handleInvite = () => {
    if (inviteEmail) {
      setPendingInvites([
        ...pendingInvites,
        { email: inviteEmail, role: inviteRole },
      ]);
      setInviteEmail("");
      setInviteRole("member");
      setShowInviteForm(false);
    }
  };

  const cancelInvite = (email: string) => {
    setPendingInvites(
      pendingInvites.filter((invite) => invite.email !== email),
    );
  };

  const updateMemberRole = (memberId: string, newRole: string) => {
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0">
        <div className="flex h-[600px]">
          {/* Left sidebar */}
          <div className="flex flex-col w-[200px] border-r bg-muted/40">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle>Organization</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-px">
              <button
                onClick={() => setActiveView("account")}
                className={cn(
                  "flex items-center justify-start px-6 py-2 text-sm font-normal transition-colors",
                  "hover:bg-muted/50",
                  "border-l-2 border-transparent",
                  activeView === "account" && "border-primary bg-white",
                )}
              >
                Account
              </button>
              <button
                onClick={() => setActiveView("members")}
                className={cn(
                  "flex items-center justify-start px-6 py-2 text-sm font-normal transition-colors",
                  "hover:bg-muted/50",
                  "border-l-2 border-transparent",
                  activeView === "members" && "border-primary bg-white",
                )}
              >
                Account Managers
              </button>
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1 overflow-hidden">
            {activeView === "account" && (
              <div className="h-full overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Account Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your organization settings and preferences.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="orgName" className="text-sm font-medium">
                        Organization Name
                      </label>
                      <Input id="orgName" defaultValue="CarePoynt" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="orgEmail" className="text-sm font-medium">
                        Organization Email
                      </label>
                      <Input id="orgEmail" defaultValue="admin@carepoynt.com" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="plan" className="text-sm font-medium">
                        Subscription Plan
                      </label>
                      <Select defaultValue="enterprise">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "members" && (
              <div className="h-full overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Account Managers
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your account managers and their roles.
                    </p>
                  </div>

                  {/* Current Account Managers Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={member.role}
                              onValueChange={(value) =>
                                updateMemberRole(member.id, value)
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {member.id !== "1" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pending Invites */}
                  {pendingInvites.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">
                        Pending Manager Invites
                      </h4>
                      {pendingInvites.map((invite, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Pending</Badge>
                            <span>{invite.email}</span>
                            <span className="text-sm text-muted-foreground">
                              ({invite.role})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelInvite(invite.email)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Invite Form */}
                  {showInviteForm ? (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium"
                          >
                            Email address
                          </label>
                          <Input
                            id="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="role" className="text-sm font-medium">
                            Role
                          </label>
                          <Select
                            value={inviteRole}
                            onValueChange={setInviteRole}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowInviteForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleInvite}>
                          <Check className="mr-2 h-4 w-4" /> Send Invite
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowInviteForm(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Account Manager
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
