"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DetailsTabProps {
  isCreateMode: boolean;
  isSaving: boolean;
  typeInput: string;
  setTypeInput: (value: string) => void;
  totalPoyntsInput: number;
  setTotalPoyntsInput: (value: number) => void;
  imageUrlInput: string;
  setImageUrlInput: (value: string) => void;
  maxParticipantsInput: string;
  setMaxParticipantsInput: (value: string) => void;
  requiresVerificationInput: boolean;
  setRequiresVerificationInput: (value: boolean) => void;
  programIdInput: string;
  setProgramIdInput: (value: string) => void;
  programs: { id: string; name: string }[];
  isDirty: boolean;
  onSave?: () => void;
}

export function DetailsTab({
  isCreateMode,
  isSaving,
  typeInput,
  setTypeInput,
  totalPoyntsInput,
  setTotalPoyntsInput,
  imageUrlInput,
  setImageUrlInput,
  maxParticipantsInput,
  setMaxParticipantsInput,
  requiresVerificationInput,
  setRequiresVerificationInput,
  programIdInput,
  setProgramIdInput,
  programs,
  isDirty,
  onSave,
}: DetailsTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">
            Campaign Type <span className="text-red-500">*</span>
          </Label>
          <Select value={typeInput} onValueChange={setTypeInput}>
            <SelectTrigger>
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acquisition">Acquisition</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="adherence">Adherence</SelectItem>
              <SelectItem value="aspiration">Aspiration</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The type of campaign determines its purpose and behavior.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalPoynts">Total Poynts</Label>
          <Input
            id="totalPoynts"
            type="number"
            min="0"
            value={totalPoyntsInput}
            onChange={(e) => setTotalPoyntsInput(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Total points available for this campaign.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Campaign Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="https://example.com/image.png"
          />
          <p className="text-xs text-muted-foreground">
            URL for the campaign banner or image.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Max Participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            min="0"
            value={maxParticipantsInput}
            onChange={(e) => setMaxParticipantsInput(e.target.value)}
            placeholder="Unlimited"
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of members who can enroll. Leave empty for unlimited.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="program">Linked Program</Label>
          <Select
            value={programIdInput || "__none__"}
            onValueChange={(value) =>
              setProgramIdInput(value === "__none__" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="No program linked" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No program linked</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Optionally link this campaign to a program.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="requiresVerification">Requires Verification</Label>
            <p className="text-xs text-muted-foreground">
              Require admin verification before awarding points.
            </p>
          </div>
          <Switch
            id="requiresVerification"
            checked={requiresVerificationInput}
            onCheckedChange={setRequiresVerificationInput}
          />
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
