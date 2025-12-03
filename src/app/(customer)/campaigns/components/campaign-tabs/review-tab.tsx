"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReviewTabProps {
  nameInput: string;
  slugInput: string;
  descriptionInput: string;
  statusInput: string;
  typeInput: string;
  totalPoyntsInput: number;
  imageUrlInput: string;
  maxParticipantsInput: string;
  requiresVerificationInput: boolean;
  startDateInput: string;
  endDateInput: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-indigo-100 text-indigo-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-slate-100 text-slate-800",
};

const typeColors: Record<string, string> = {
  acquisition: "bg-purple-100 text-purple-800",
  engagement: "bg-orange-100 text-orange-800",
  adherence: "bg-cyan-100 text-cyan-800",
  aspiration: "bg-pink-100 text-pink-800",
};

export function ReviewTab({
  nameInput,
  slugInput,
  descriptionInput,
  statusInput,
  typeInput,
  totalPoyntsInput,
  imageUrlInput,
  maxParticipantsInput,
  requiresVerificationInput,
  startDateInput,
  endDateInput,
}: ReviewTabProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review Your Campaign</h3>
        <p className="text-sm text-muted-foreground">
          Please review the details below before creating your campaign.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic campaign details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{nameInput || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slug</p>
              <p className="text-sm font-mono">{slugInput || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge variant="outline" className={statusColors[statusInput]}>
                {statusInput.charAt(0).toUpperCase() + statusInput.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <Badge variant="outline" className={typeColors[typeInput]}>
                {typeInput.charAt(0).toUpperCase() + typeInput.slice(1)}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <p className="text-sm">{descriptionInput || "No description"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Points and participation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Poynts
              </p>
              <p className="text-sm font-medium">
                {totalPoyntsInput.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Max Participants
              </p>
              <p className="text-sm">
                {maxParticipantsInput || "Unlimited"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Requires Verification
              </p>
              <p className="text-sm">
                {requiresVerificationInput ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Campaign Image
              </p>
              <p className="text-sm truncate">
                {imageUrlInput || "No image"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Campaign dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Start Date
              </p>
              <p className="text-sm">{formatDate(startDateInput)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                End Date
              </p>
              <p className="text-sm">{formatDate(endDateInput)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
