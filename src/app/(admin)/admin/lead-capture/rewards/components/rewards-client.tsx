"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { DataTable } from "@/components/data-table/data-table";

import { type AvailableReward } from "../../lib/schemas";
import { fetchConfig, updateConfig } from "../../lib/api";
import { createRewardsColumns } from "./rewards-columns";
import { RewardDialog } from "./reward-dialog";

export default function RewardsClient() {
  const queryClient = useQueryClient();
  const [rewards, setRewards] = useState<AvailableReward[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<AvailableReward | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Delete confirmation
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const { isLoading, isFetching } = useQuery({
    queryKey: ["lead-capture-rewards"],
    queryFn: async () => {
      const data = await fetchConfig<AvailableReward[]>("lead_capture.available_rewards");
      const arr = Array.isArray(data) ? data : [];
      setRewards(arr);
      setDirty(false);
      return arr;
    },
  });

  const handleEdit = (reward: AvailableReward, index: number) => {
    setEditingReward(reward);
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingReward(null);
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleSaveReward = (reward: AvailableReward) => {
    setRewards((prev) => {
      const next = [...prev];
      if (editingIndex !== null) {
        next[editingIndex] = reward;
      } else {
        next.push(reward);
      }
      return next;
    });
    setDirty(true);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      setRewards((prev) => prev.filter((_, i) => i !== deleteIndex));
      setDirty(true);
      setDeleteIndex(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateConfig("lead_capture.available_rewards", rewards);
      toast.success("Available rewards saved");
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["lead-capture-rewards"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save rewards");
    } finally {
      setSaving(false);
    }
  };

  // Add _index for column actions
  const tableData = rewards.map((r, i) => ({ ...r, _index: i }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Available Rewards</h1>
          <p className="text-muted-foreground">
            Manage rewards available for AI matching
            {dirty && <span className="ml-2 text-amber-500 font-medium">(unsaved changes)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Reward
          </Button>
          <Button onClick={handleSaveAll} disabled={!dirty || saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All
          </Button>
        </div>
      </div>

      <DataTable
        columns={createRewardsColumns(handleEdit, handleDelete)}
        data={tableData}
        searchColumn={{
          id: "name",
          placeholder: "Search rewards...",
        }}
        enableRowSelection={false}
        enableRefresh={true}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["lead-capture-rewards"] })}
        isRefreshing={isFetching}
      />

      <RewardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reward={editingReward}
        onSave={handleSaveReward}
      />

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this reward? This change won&apos;t take effect until you click &quot;Save All&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
