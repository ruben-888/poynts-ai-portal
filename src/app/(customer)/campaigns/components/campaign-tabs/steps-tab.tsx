"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  ListChecks,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignStep } from "../manage-campaign";

interface StepsTabProps {
  campaignId?: string;
  stepsCount?: number;
}

const ACTION_TYPE_OPTIONS = [
  { value: "manual_verify", label: "Manual Verify" },
  { value: "form_submit", label: "Form Submit" },
  { value: "link_click", label: "Link Click" },
  { value: "video_watch", label: "Video Watch" },
  { value: "quiz_complete", label: "Quiz Complete" },
  { value: "checkin", label: "Check-in" },
  { value: "purchase", label: "Purchase" },
  { value: "referral", label: "Referral" },
  { value: "social_share", label: "Social Share" },
  { value: "file_upload", label: "File Upload" },
  { value: "custom_event", label: "Custom Event" },
];

const actionTypeColors: Record<string, string> = {
  manual_verify: "bg-purple-100 text-purple-800",
  form_submit: "bg-blue-100 text-blue-800",
  link_click: "bg-green-100 text-green-800",
  video_watch: "bg-orange-100 text-orange-800",
  quiz_complete: "bg-yellow-100 text-yellow-800",
  checkin: "bg-teal-100 text-teal-800",
  purchase: "bg-emerald-100 text-emerald-800",
  referral: "bg-pink-100 text-pink-800",
  social_share: "bg-indigo-100 text-indigo-800",
  file_upload: "bg-cyan-100 text-cyan-800",
  custom_event: "bg-slate-100 text-slate-800",
};

async function fetchSteps(campaignId: string): Promise<CampaignStep[]> {
  const response = await fetch(`/api/campaigns/${campaignId}/steps`);
  if (!response.ok) {
    throw new Error("Failed to fetch steps");
  }
  const result = await response.json();
  return result.data;
}

async function createStep(
  campaignId: string,
  data: Partial<CampaignStep>
): Promise<CampaignStep> {
  const response = await fetch(`/api/campaigns/${campaignId}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create step");
  }
  const result = await response.json();
  return result.data;
}

async function updateStep(
  campaignId: string,
  stepId: string,
  data: Partial<CampaignStep>
): Promise<CampaignStep> {
  const response = await fetch(`/api/campaigns/${campaignId}/steps/${stepId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update step");
  }
  const result = await response.json();
  return result.data;
}

async function deleteStep(campaignId: string, stepId: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${campaignId}/steps/${stepId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete step");
  }
}

async function reorderSteps(
  campaignId: string,
  stepIds: string[]
): Promise<CampaignStep[]> {
  const response = await fetch(`/api/campaigns/${campaignId}/steps/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step_ids: stepIds }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reorder steps");
  }
  const result = await response.json();
  return result.data;
}

export function StepsTab({ campaignId }: StepsTabProps) {
  const queryClient = useQueryClient();

  const [isStepDialogOpen, setIsStepDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editingStep, setEditingStep] = React.useState<CampaignStep | null>(
    null
  );
  const [deletingStep, setDeletingStep] = React.useState<CampaignStep | null>(
    null
  );

  // Form state
  const [nameInput, setNameInput] = React.useState("");
  const [descriptionInput, setDescriptionInput] = React.useState("");
  const [poyntsInput, setPoyntsInput] = React.useState(0);
  const [actionTypeInput, setActionTypeInput] = React.useState("manual_verify");
  const [isRequiredInput, setIsRequiredInput] = React.useState(true);

  const {
    data: steps = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campaign-steps", campaignId],
    queryFn: () => fetchSteps(campaignId!),
    enabled: !!campaignId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<CampaignStep>) => createStep(campaignId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-steps", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      stepId,
      data,
    }: {
      stepId: string;
      data: Partial<CampaignStep>;
    }) => updateStep(campaignId!, stepId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-steps", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (stepId: string) => deleteStep(campaignId!, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-steps", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setIsDeleteDialogOpen(false);
      setDeletingStep(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (stepIds: string[]) => reorderSteps(campaignId!, stepIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-steps", campaignId] });
    },
  });

  const handleOpenAddDialog = () => {
    setEditingStep(null);
    setNameInput("");
    setDescriptionInput("");
    setPoyntsInput(0);
    setActionTypeInput("manual_verify");
    setIsRequiredInput(true);
    setIsStepDialogOpen(true);
  };

  const handleOpenEditDialog = (step: CampaignStep) => {
    setEditingStep(step);
    setNameInput(step.name);
    setDescriptionInput(step.description || "");
    setPoyntsInput(step.poynts);
    setActionTypeInput(step.action_type);
    setIsRequiredInput(step.is_required ?? true);
    setIsStepDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsStepDialogOpen(false);
    setEditingStep(null);
    setNameInput("");
    setDescriptionInput("");
    setPoyntsInput(0);
    setActionTypeInput("manual_verify");
    setIsRequiredInput(true);
  };

  const handleSaveStep = () => {
    const data = {
      name: nameInput,
      description: descriptionInput || null,
      poynts: poyntsInput,
      action_type: actionTypeInput,
      is_required: isRequiredInput,
    };

    if (editingStep) {
      updateMutation.mutate({ stepId: editingStep.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteStep = (step: CampaignStep) => {
    setDeletingStep(step);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingStep) {
      deleteMutation.mutate(deletingStep.id);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    const stepIds = newSteps.map((s) => s.id);
    reorderMutation.mutate(stepIds);
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    const stepIds = newSteps.map((s) => s.id);
    reorderMutation.mutate(stepIds);
  };

  const getActionTypeLabel = (value: string) => {
    return (
      ACTION_TYPE_OPTIONS.find((opt) => opt.value === value)?.label || value
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (!campaignId) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Campaign Steps</h3>
          <p className="mt-2 text-muted-foreground">
            Save the campaign first to manage steps.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load steps</p>
      </div>
    );
  }

  const totalPoynts = steps.reduce((sum, step) => sum + step.poynts, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Campaign Steps</h3>
          <p className="text-sm text-muted-foreground">
            {steps.length} step{steps.length !== 1 ? "s" : ""} &middot;{" "}
            {totalPoynts} total poynts
          </p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No steps yet</h3>
              <p className="mt-2 text-muted-foreground">
                Add steps to define how members complete this campaign.
              </p>
              <Button onClick={handleOpenAddDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add First Step
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={step.id}>
              <CardHeader className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || reorderMutation.isPending}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {step.step_order}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveDown(index)}
                      disabled={
                        index === steps.length - 1 || reorderMutation.isPending
                      }
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{step.name}</CardTitle>
                      {step.is_required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    {step.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {step.description}
                      </CardDescription>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant="outline"
                        className={actionTypeColors[step.action_type] || ""}
                      >
                        {getActionTypeLabel(step.action_type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {step.poynts} poynt{step.poynts !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditDialog(step)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStep(step)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Step Dialog */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStep ? "Edit Step" : "Add New Step"}
            </DialogTitle>
            <DialogDescription>
              {editingStep
                ? "Update the step details below."
                : "Define a new step for this campaign."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="step-name">Name *</Label>
              <Input
                id="step-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g., Complete Health Assessment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-description">Description</Label>
              <Textarea
                id="step-description"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Describe what the member needs to do..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="step-action-type">Action Type *</Label>
                <Select
                  value={actionTypeInput}
                  onValueChange={setActionTypeInput}
                >
                  <SelectTrigger id="step-action-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-poynts">Poynts</Label>
                <Input
                  id="step-poynts"
                  type="number"
                  min={0}
                  value={poyntsInput}
                  onChange={(e) => setPoyntsInput(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="step-required"
                checked={isRequiredInput}
                onCheckedChange={setIsRequiredInput}
              />
              <Label htmlFor="step-required">Required step</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveStep}
              disabled={!nameInput.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingStep ? (
                "Save Changes"
              ) : (
                "Add Step"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingStep?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
