"use client";

import * as React from "react";
import { GripVertical, ChevronRight, Loader2, Pause, Play } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@clerk/nextjs";
import { DetailedOfferData } from "../types";
import { useQueryClient } from "@tanstack/react-query";

// Define the interfaces for offer sources
interface OfferSource {
  id: number; // This should be the database ID for API calls
  name: string;
  status: string;
  cpid: string;
  cpidx: string;
  latency: number | null;
  providerStatus: string;
  cardStatus: string;
  utid?: string;
}

interface SourcePriority {
  id: number;
  name: string;
  latency: number | null;
}

interface SortableSourceItemProps {
  source: SourcePriority;
}

// Sortable source item for the checkbox list
function SortableSourceItem({ source }: SortableSourceItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: source.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-lg border p-4 mb-2"
    >
      <div className="flex items-center gap-4">
        <button
          className="cursor-grab touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground/50" />
        </button>
        <div className="flex items-center gap-3">
          <span className="font-medium">Source {source.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">{source.latency}ms</div>
        <Checkbox checked={true} className="ml-2" />
      </div>
    </div>
  );
}

// Sortable table row component
function SortableTableRow({
  source,
  suspendedSources,
  processingSources,
  toggleSourceSuspension,
  onEditSource,
  sourcePriorityEnabled,
  canSuspendSources,
  canActivateSources,
  canEditSources,
}: {
  source: OfferSource;
  suspendedSources: Set<number>;
  processingSources: Set<number>;
  toggleSourceSuspension: (sourceId: number) => void;
  onEditSource: (id: number) => void;
  sourcePriorityEnabled: boolean;
  canSuspendSources: boolean;
  canActivateSources: boolean;
  canEditSources: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: source.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "auto",
    position: isDragging ? ("relative" as const) : ("static" as const),
  };

  // Check if button should be disabled based on permissions
  const isSuspendButtonDisabled =
    processingSources.has(source.id) ||
    source.cardStatus.toLowerCase() === "inactive" ||
    (suspendedSources.has(source.id)
      ? !canActivateSources
      : !canSuspendSources);

  return (
    <TableRow
      ref={sourcePriorityEnabled ? setNodeRef : undefined}
      style={sourcePriorityEnabled ? style : undefined}
      className={isDragging ? "bg-muted opacity-80" : undefined}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          {sourcePriorityEnabled ? (
            <button
              className="cursor-grab touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ) : null}
          <div className="w-full text-center">{source.name}</div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">
        {source.cpidx || source.cpid}
      </TableCell>
      <TableCell>
        {source.status.toLowerCase().charAt(0).toUpperCase() +
          source.status.toLowerCase().slice(1)}
      </TableCell>
      <TableCell>
        {source.cardStatus.toLowerCase().charAt(0).toUpperCase() +
          source.cardStatus.toLowerCase().slice(1)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSourceSuspension(source.id)}
                className="flex items-center gap-1"
                disabled={isSuspendButtonDisabled}
              >
                {processingSources.has(source.id) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Processing...</span>
                  </>
                ) : suspendedSources.has(source.id) ? (
                  <>
                    <Play className="h-4 w-4 text-green-600" />
                    <span className="text-xs">Activate</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 text-amber-600" />
                    <span className="text-xs">Suspend</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {processingSources.has(source.id)
                ? "Processing request..."
                : source.cardStatus.toLowerCase() === "inactive"
                  ? "Cannot suspend/activate inactive sources"
                  : suspendedSources.has(source.id)
                    ? `Activate this source${!canActivateSources ? " (this feature is not activated for your role)" : ""}`
                    : `Suspend this source${!canSuspendSources ? " (this feature is not activated for your role)" : ""}`}
            </TooltipContent>
          </Tooltip>

          {canEditSources && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSource(source.id)}
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">Edit</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit CPIDx for this offer source</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface ManageOfferSourcesProps {
  sources: OfferSource[];
  displayOffer: DetailedOfferData | null;
  onEditSource: (sourceId: number) => void;
  onSourcesReordered?: (newSources: OfferSource[]) => void;
}

export function ManageOfferSources({
  sources: initialSources,
  displayOffer,
  onEditSource,
  onSourcesReordered,
}: ManageOfferSourcesProps) {
  const { has, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  const canSuspendSources =
    has?.({
      permission: "org:reward:suspend",
    }) ?? false;

  const canActivateSources =
    has?.({
      permission: "org:reward:unsuspend",
    }) ?? false;

  const canEditSources =
    has?.({
      permission: "org:cpadmin:access",
    }) ?? false;

  // State for drag and drop source priority
  const [availableSources, setAvailableSources] =
    React.useState<OfferSource[]>(initialSources);
  const [sortableSourcePriorities, setSortableSourcePriorities] =
    React.useState<SourcePriority[]>(
      initialSources.map((source) => ({
        id: source.id,
        name: source.name,
        latency: source.latency,
      }))
    );
  const [suspendedSources, setSuspendedSources] = React.useState<Set<number>>(
    new Set(
      initialSources
        .filter((s) => s.cardStatus === "suspended")
        .map((s) => s.id)
    )
  );
  const [processingSources, setProcessingSources] = React.useState<Set<number>>(
    new Set()
  );
  const [sourcePriorityEnabled, setSourcePriorityEnabled] = React.useState(
    initialSources.length > 1
  );
  const [isSavingPriority, setIsSavingPriority] = React.useState(false);
  const [showSourceSuspendConfirm, setShowSourceSuspendConfirm] =
    React.useState(false);
  const [sourceToSuspend, setSourceToSuspend] = React.useState<number | null>(
    null
  );

  // Update sources when props change
  React.useEffect(() => {
    setAvailableSources(initialSources);
    setSortableSourcePriorities(
      initialSources.map((source) => ({
        id: source.id,
        name: source.name,
        latency: source.latency,
      }))
    );
    setSuspendedSources(
      new Set(
        initialSources
          .filter((s) => s.cardStatus === "suspended")
          .map((s) => s.id)
      )
    );
    setSourcePriorityEnabled(initialSources.length > 1);
  }, [initialSources]);

  // DnD sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Return empty columns if auth is not loaded or user is not signed in
  if (!isLoaded) {
    return null;
  }

  // Handle drag end for source priority reordering
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortableSourcePriorities((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id === Number(active.id)
        );
        const newIndex = items.findIndex((item) => item.id === Number(over.id));
        return arrayMove(items, oldIndex, newIndex);
      });

      // Also update the availableSources order to match
      setAvailableSources((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id === Number(active.id)
        );
        const newIndex = items.findIndex((item) => item.id === Number(over.id));
        const newSources = arrayMove(items, oldIndex, newIndex);

        // Notify parent component about reordering if callback provided
        if (onSourcesReordered) {
          onSourcesReordered(newSources);
        }

        return newSources;
      });

      // Show saving indicator
      setIsSavingPriority(true);
      setTimeout(() => setIsSavingPriority(false), 1000); // Mock save delay
    }
  }

  // Check if a source is the only active source
  const isOnlyActiveSource = (sourceId: number) => {
    const activeSources = availableSources.filter(
      (source) => !suspendedSources.has(source.id) && source.id !== sourceId
    );
    return activeSources.length === 0;
  };

  // Toggle source suspension state
  const toggleSourceSuspension = async (sourceId: number) => {
    // If already suspended, just activate it
    if (suspendedSources.has(sourceId)) {
      setProcessingSources((prev) => new Set(prev).add(sourceId));

      try {
        // Get the source's CPIDX value for logging
        const sourceData = availableSources.find((s) => s.id === sourceId);
        const cpidx = sourceData?.cpidx || sourceData?.cpid || "";

        // Call the API to activate the offer source
        if (!displayOffer?.id) {
          throw new Error("Offer id is missing – cannot activate source");
        }

        const activateRes = await fetch(
          `/api/rewards/offers/${displayOffer.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reward_status: "active",
            }),
          }
        );

        if (!activateRes.ok) {
          throw new Error("Failed to activate offer source");
        }

        // Invalidate queries so UI uses fresh data
        queryClient.invalidateQueries({
          queryKey: ["offer", displayOffer.id.toString()],
        });
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        queryClient.invalidateQueries({ queryKey: ["rewards"] });

        // Update local state after successful API call
        setSuspendedSources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sourceId);
          return newSet;
        });

        // Update the source status in the UI
        const sourceIndex = availableSources.findIndex(
          (s) => s.id === sourceId
        );
        if (sourceIndex !== -1) {
          const newSources = [...availableSources];
          newSources[sourceIndex] = {
            ...newSources[sourceIndex],
            cardStatus: "active",
          };
          setAvailableSources(newSources);
        }
      } catch (error) {
        console.error("Error activating offer source:", error);
      } finally {
        setProcessingSources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sourceId);
          return newSet;
        });
      }
    } else {
      // For suspend, show confirm dialog
      setSourceToSuspend(sourceId);
      setShowSourceSuspendConfirm(true);
    }
  };

  // Handle source suspension confirmation
  const handleSourceSuspendConfirm = async () => {
    if (!sourceToSuspend) return;

    setShowSourceSuspendConfirm(false);
    setProcessingSources((prev) => new Set(prev).add(sourceToSuspend));

    try {
      // Get the source's CPIDX value for logging
      const sourceData = availableSources.find((s) => s.id === sourceToSuspend);
      const cpidx = sourceData?.cpidx || sourceData?.cpid || "";

      // Call the API to suspend the offer source
      if (!displayOffer?.id) {
        throw new Error("Offer id is missing – cannot suspend source");
      }

      const suspendRes = await fetch(`/api/rewards/offers/${displayOffer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reward_status: "suspended",
        }),
      });

      if (!suspendRes.ok) {
        throw new Error("Failed to suspend offer source");
      }

      // Invalidate queries so UI uses fresh data
      queryClient.invalidateQueries({
        queryKey: ["offer", displayOffer.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });

      // Update local state after successful API call
      setSuspendedSources((prev) => {
        const newSet = new Set(prev);
        newSet.add(sourceToSuspend);
        return newSet;
      });

      // Update the source status in the UI
      const sourceIndex = availableSources.findIndex(
        (s) => s.id === sourceToSuspend
      );
      if (sourceIndex !== -1) {
        const newSources = [...availableSources];
        newSources[sourceIndex] = {
          ...newSources[sourceIndex],
          cardStatus: "suspended",
        };
        setAvailableSources(newSources);
      }
    } catch (error) {
      console.error("Error suspending offer source:", error);
    } finally {
      setProcessingSources((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sourceToSuspend);
        return newSet;
      });
      setSourceToSuspend(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Offer Sources</h4>
            {isSavingPriority && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving priority order...</span>
              </div>
            )}
          </div>
          {sourcePriorityEnabled && (
            <div className="text-sm text-muted-foreground mb-2">
              Drag sources to reorder priority
            </div>
          )}
          <div className="rounded-lg border">
            {sourcePriorityEnabled ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>CPIDx</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext
                      items={availableSources.map((source) => source.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {availableSources.map((source) => (
                        <SortableTableRow
                          key={source.id}
                          source={source}
                          suspendedSources={suspendedSources}
                          processingSources={processingSources}
                          toggleSourceSuspension={toggleSourceSuspension}
                          onEditSource={onEditSource}
                          sourcePriorityEnabled={sourcePriorityEnabled}
                          canSuspendSources={canSuspendSources}
                          canActivateSources={canActivateSources}
                          canEditSources={canEditSources}
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>CPIDx</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableSources.map((source) => (
                    <SortableTableRow
                      key={source.id}
                      source={source}
                      suspendedSources={suspendedSources}
                      processingSources={processingSources}
                      toggleSourceSuspension={toggleSourceSuspension}
                      onEditSource={onEditSource}
                      sourcePriorityEnabled={false}
                      canSuspendSources={canSuspendSources}
                      canActivateSources={canActivateSources}
                      canEditSources={canEditSources}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Suspending Source */}
      <Dialog
        open={showSourceSuspendConfirm}
        onOpenChange={setShowSourceSuspendConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend Offer Source</DialogTitle>
            {/* Simple text messages only inside DialogDescription */}
            {sourceToSuspend && !isOnlyActiveSource(sourceToSuspend) && (
              <DialogDescription>
                Are you sure you want to suspend this source? The offer will
                still be available through other active sources.
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Move complex content outside of DialogDescription */}
          {sourceToSuspend && (
            <div className="py-2">
              {isOnlyActiveSource(sourceToSuspend) && (
                <div className="mb-4">
                  <p className="mb-2 text-amber-600 font-medium">
                    Warning: This is the only active source for this offer.
                  </p>
                  <p>
                    Suspending this source will make the offer unavailable in
                    all client catalogs.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowSourceSuspendConfirm(false);
                setSourceToSuspend(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSourceSuspendConfirm}>
              Yes, Suspend Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
