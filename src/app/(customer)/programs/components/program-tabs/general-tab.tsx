"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GeneralTabProps {
  isCreateMode: boolean;
  isSaving: boolean;
  nameInput: string;
  setNameInput: (value: string) => void;
  slugInput: string;
  setSlugInput: (value: string) => void;
  descriptionInput: string;
  setDescriptionInput: (value: string) => void;
  statusInput: string;
  setStatusInput: (value: string) => void;
  isDirty: boolean;
  onSave?: () => void;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function GeneralTab({
  isCreateMode,
  isSaving,
  nameInput,
  setNameInput,
  slugInput,
  setSlugInput,
  descriptionInput,
  setDescriptionInput,
  statusInput,
  setStatusInput,
  isDirty,
  onSave,
}: GeneralTabProps) {
  const handleNameChange = (value: string) => {
    setNameInput(value);
    // Auto-generate slug only in create mode and if slug hasn't been manually edited
    if (isCreateMode && slugInput === generateSlug(nameInput)) {
      setSlugInput(generateSlug(value));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Program Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={nameInput}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter program name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="program-slug"
          />
          <p className="text-xs text-muted-foreground">
            URL-friendly identifier. Auto-generated from name.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            placeholder="Enter program description"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={statusInput} onValueChange={setStatusInput}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isCreateMode && onSave && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onSave} disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
