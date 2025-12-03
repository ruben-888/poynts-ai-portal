"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ScheduleTabProps {
  isCreateMode: boolean;
  isSaving: boolean;
  startDateInput: string;
  setStartDateInput: (value: string) => void;
  endDateInput: string;
  setEndDateInput: (value: string) => void;
  isDirty: boolean;
  onSave?: () => void;
}

export function ScheduleTab({
  isCreateMode,
  isSaving,
  startDateInput,
  setStartDateInput,
  endDateInput,
  setEndDateInput,
  isDirty,
  onSave,
}: ScheduleTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            When the program becomes active. Leave empty for immediate start.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            When the program ends. Leave empty for ongoing programs.
          </p>
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
