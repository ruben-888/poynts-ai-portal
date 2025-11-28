"use client";

import * as React from "react";
import { GripVertical, ChevronRight, Loader2, Pause, Play, Check, AlertCircle } from "lucide-react";
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
import { GroupedReward } from "../../columns";
import { useAuth } from "@clerk/nextjs";

// Define the interfaces
interface GiftCardSource {
  id: number; // This should be the database ID (giftcard_id) for API calls
  name: string;
  status: string;
  cpid: string;
  cpidx: string;
  latency: number | null;
  providerStatus: string;
  cardStatus: string;
  utid?: string;
  redemption_registries_id?: string | null; // Keep track of the original field for reference
}

// Define a simple interface for related cards
interface RelatedCard {
  giftcard_id: number;
  reward_name: string;
  brand_name: string;
  cpidx: string;
  value: string;
  reward_status: string;
}

// Interface for rewards items that might have related cards
interface RewardItem {
  id: number;
  source_letter?: string;
  related_cards?: RelatedCard[];
  [key: string]: any; // Allow any other properties
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
  source: GiftCardSource;
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
          {source.name}
          {source.utid ? (
            <span className="text-muted-foreground"> ({source.utid})</span>
          ) : (
            ""
          )}
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
              <TooltipContent>
                Edit reward values for this source
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface ManageRewardSourcesProps {
  sources: GiftCardSource[];
  displayReward: GroupedReward | null;
  onEditSource: (sourceId: number) => void;
  onSourcesReordered?: (newSources: GiftCardSource[]) => void;
  onSourceStatusChange?: () => void;
}

export function ManageRewardSources({
  sources: initialSources,
  displayReward,
  onEditSource,
  onSourcesReordered,
  onSourceStatusChange,
}: ManageRewardSourcesProps) {
  const { has, isLoaded } = useAuth();

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
    React.useState<GiftCardSource[]>(initialSources);
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
  const [showReorderConfirmation, setShowReorderConfirmation] = React.useState(false);
  const [showReorderError, setShowReorderError] = React.useState(false);
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
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Calculate the new order first, before any state updates
      const oldIndex = availableSources.findIndex(
        (item) => item.id === Number(active.id)
      );
      const newIndex = availableSources.findIndex(
        (item) => item.id === Number(over.id)
      );
      // Calculate the new source order
      const newSources = arrayMove(availableSources, oldIndex, newIndex);
      // Update sortable priorities to match
      const newPriorities = newSources.map((source) => ({
        id: source.id,
        name: source.name,
        latency: source.latency,
      }));

      // Update both states with the calculated values
      setSortableSourcePriorities(newPriorities);
      setAvailableSources(newSources);

      // Show saving indicator
      setIsSavingPriority(true);
      setShowReorderError(false);

      try {
        // Prepare priority updates - priority 1 is highest (top of list)
        const updates = newSources.map((source, index) => ({
          giftcard_id: source.id,
          priority: index + 1
        }));

        // Call API to save the new priorities
        const response = await fetch('/api/rewards/sources-priority', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updates }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to update priorities');
        }

        // Show confirmation message
        setShowReorderConfirmation(true);

        // Hide confirmation after 2 seconds
        setTimeout(() => {
          setShowReorderConfirmation(false);
        }, 2000);

        // Notify parent component about reordering if callback provided
        if (onSourcesReordered) {
          onSourcesReordered(newSources);
        }
      } catch (error) {
        console.error('Error updating source priorities:', error);

        // Show error message
        setShowReorderError(true);

        // Hide error after 3 seconds
        setTimeout(() => {
          setShowReorderError(false);
        }, 3000);

        // Revert the changes on error by resetting to initial sources
        setAvailableSources(initialSources);
        setSortableSourcePriorities(
          initialSources.map((source) => ({
            id: source.id,
            name: source.name,
            latency: source.latency,
          }))
        );
      } finally {
        setIsSavingPriority(false);
      }
    }
  }

  // Check if a source is the only active source
  const isOnlyActiveSource = (sourceId: number) => {
    const activeSources = availableSources.filter(
      (source) => !suspendedSources.has(source.id) && source.id !== sourceId
    );
    return activeSources.length === 0;
  };

  // Get related cards for a specific source
  const getRelatedCards = (sourceId: number): RelatedCard[] => {
    // If no display reward, return empty array
    if (!displayReward) return [];

    // Safely access related cards
    try {
      // Use any type for intermediary step to bypass TypeScript type checking
      const items = displayReward.items as any;

      // If no items, return empty array
      if (!items || !Array.isArray(items)) return [];

      // Look for the target item
      for (const item of items) {
        // Skip if no id or id doesn't match
        if (!item || typeof item.id === "undefined") continue;

        // Check for ID match
        if (Number(item.id) === sourceId) {
          // If item has related cards, return them
          if (item.related_cards && Array.isArray(item.related_cards)) {
            return item.related_cards;
          }
        }
      }
      return [];
    } catch (error) {
      console.error("Error getting related cards:", error);
      return [];
    }
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

        // Call the API to activate the source
        const response = await fetch(
          `/api/rewards/redemption-items?id=${sourceId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "active", cpidx }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to activate source: ${response.statusText}`);
        }

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

        // Call the callback to refresh the main grid
        if (onSourceStatusChange) {
          onSourceStatusChange();
        }
      } catch (error) {
        console.error("Error activating source:", error);
        // Optionally show error notification to user
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

      // Call the API to suspend the source
      const response = await fetch(
        `/api/rewards/redemption-items?id=${sourceToSuspend}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "suspended", cpidx }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to suspend source: ${response.statusText}`);
      }

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

      // Call the callback to refresh the main grid
      if (onSourceStatusChange) {
        onSourceStatusChange();
      }
    } catch (error) {
      console.error("Error suspending source:", error);
      // Optionally show error notification to user
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
            <h4 className="font-medium">Reward Sources</h4>
            {isSavingPriority && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving priority order...</span>
              </div>
            )}
            {showReorderConfirmation && !isSavingPriority && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Priority order updated</span>
              </div>
            )}
            {showReorderError && !isSavingPriority && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to update priority order</span>
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
            <DialogTitle>Suspend Reward Source</DialogTitle>
            {/* Simple text messages only inside DialogDescription */}
            {sourceToSuspend && !isOnlyActiveSource(sourceToSuspend) && (
              <DialogDescription>
                Are you sure you want to suspend this source? The reward will
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
                    Warning: This is the only active source for this reward.
                  </p>
                  <p>
                    Suspending this source will make the reward unavailable in
                    all client catalogs.
                  </p>
                </div>
              )}
              {/* Show related cards if they exist */}
              {getRelatedCards(sourceToSuspend).length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-amber-600 font-medium">
                    Suspending this item will suspend the following related
                    cards:
                  </p>
                  <div className="mt-2 border-t pt-2 space-y-3">
                    {getRelatedCards(sourceToSuspend).map((card) => (
                      <div key={card.giftcard_id} className="text-sm">
                        <div className="font-medium">
                          {card.reward_name} - ${card.value}
                        </div>
                        <div className="text-xs font-mono mt-1">
                          {card.cpidx}
                        </div>
                      </div>
                    ))}
                  </div>
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
