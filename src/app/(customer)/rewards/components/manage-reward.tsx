"use client";

import * as React from "react";
import {
  CreditCard,
  Info,
  Settings,
  DollarSign,
  Tag,
  Building,
  Clock,
  ShoppingCart,
  Database,
  GripVertical,
  MoreHorizontal,
  Pause,
  Play,
  ChevronRight,
  ArrowLeft,
  Loader2,
  X,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EditGiftCardSource } from "./giftcards/reward-sources/edit-source-giftcard";
import { useQueryClient } from "@tanstack/react-query";
import { ManageRewardSources } from "./giftcards/reward-sources/manage-reward-sources";
import { useGateValue } from "@/lib/hooks/use-feature-flags";
import { GroupedReward } from "./columns";
import { GiftCardSource } from "./types/gift-card-source";
import { useAuth } from "@clerk/nextjs";

const giftCardSettings = {
  nav: [
    { name: "General", icon: Info },
    { name: "Description", icon: Tag },
    { name: "Recent Transactions", icon: ShoppingCart },
    { name: "Catalogs", icon: Building },
    { name: "Reward Sources", icon: Database },
    { name: "Activity", icon: Clock },
  ],
};

export interface RewardDetail {
  cpid: string;
  type: "giftcard" | "offer";
  title: string;
  brand_name: string;
  language: string;
  value: number;
  poynts: number;
  source_count: number;
  tenant_id: string | Record<string, never>;
  reward_status: string;
  reward_availability: string;
  tags?: string | null;
  startdate?: string | null | Record<string, never>;
  enddate?: string | null | Record<string, never>;
  is_enabled: boolean;
  value_type?: string;
  description?: string;
  disclaimer?: string;
  terms?: string;
  items: {
    id: number;
    tenant_id: string | Record<string, never>;
    redemption_id: string | number;
    cpid: string;
    redemption_type: string;
    value: number | string;
    poynts: number | string;
    redem_value?: number;
    name: string | null;
    inventory_remaining: number;
    title: string;
    startdate?: string | null | Record<string, never>;
    enddate?: string | null | Record<string, never>;
    reward_status: string;
    language: string;
    reward_availability: string;
    utid?: string;
    value_type?: string;
    tags?: string | null;
    priority: number;
    provider_id?: number;
    cpidx: string;
    type: string;
    reward_image?: string;
    source_letter?: string;
    latency?: string | number;
    description?: string;
    disclaimer?: string;
    terms?: string;
    rebate_provider_percentage?: number;
    rebate_base_percentage?: number;
    rebate_customer_percentage?: number;
    rebate_cp_percentage?: number;
    related_cards?: {
      giftcard_id: number;
      reward_name: string;
      brand_name: string;
      cpidx: string;
      value: string;
      reward_status: string;
    }[];
  }[];
}

const exampleCatalogs = [
  {
    id: "cat-1",
    name: "Well Main 2.0",
    status: "active",
    items: 150,
    points: 1500,
    lastUpdated: "2024-03-15",
  },
  {
    id: "cat-2",
    name: "Bank of America 2.0",
    status: "active",
    items: 85,
    points: 1500,
    lastUpdated: "2024-03-14",
  },
  {
    id: "cat-3",
    name: "Oscar Health 2.0",
    status: "active",
    items: 120,
    points: 1500,
    lastUpdated: "2024-03-13",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700 border-green-300";
    case "degraded":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "unavailable":
      return "bg-red-100 text-red-700 border-red-300";
    case "not_available":
      return "bg-gray-100 text-gray-500 border-gray-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "available":
      return "⬤"; // Full circle
    case "degraded":
      return "◐"; // Half circle
    case "unavailable":
      return "○"; // Empty circle
    case "not_available":
      return "○"; // Empty circle
    default:
      return "○";
  }
};

const recentOrders = [
  {
    id: "ORD-123456",
    date: "2024-03-15",
    customer: "John Smith",
    amount: "$150.00",
    status: "Completed",
  },
  {
    id: "ORD-123457",
    date: "2024-03-14",
    customer: "Sarah Johnson",
    amount: "$150.00",
    status: "Completed",
  },
  {
    id: "ORD-123458",
    date: "2024-03-14",
    customer: "Mike Brown",
    amount: "$150.00",
    status: "Processing",
  },
  {
    id: "ORD-123459",
    date: "2024-03-13",
    customer: "Emily Davis",
    amount: "$150.00",
    status: "Completed",
  },
];

const recentActivity = [
  {
    id: "ACT-001",
    timestamp: "2024-03-15 14:30:00",
    event: "Source Restored",
    description: "Source B restored after maintenance",
    actor: "System",
    severity: "info",
  },
  {
    id: "ACT-002",
    timestamp: "2024-03-15 10:15:00",
    event: "Admin Disabled",
    description: "Gift card temporarily disabled due to pricing discrepancy",
    actor: "John Admin",
    severity: "warning",
  },
  {
    id: "ACT-003",
    timestamp: "2024-03-14 16:45:00",
    event: "Source Degraded",
    description: "Source B reported performance issues",
    actor: "System",
    severity: "warning",
  },
  {
    id: "ACT-004",
    timestamp: "2024-03-14 09:00:00",
    event: "Admin Enabled",
    description: "Gift card enabled after verification",
    actor: "Sarah Admin",
    severity: "success",
  },
  {
    id: "ACT-005",
    timestamp: "2024-03-13 11:20:00",
    event: "Source Down",
    description: "Source A reported connection failure",
    actor: "System",
    severity: "error",
  },
];

// Endpoint will provide tags from all rewards

interface ManageRewardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReward: RewardDetail | null;
}

// Add a function to fetch reward data by CPID
async function fetchRewardByCpid(cpid: string): Promise<RewardDetail> {
  const response = await fetch(`/api/rewards/${cpid}`);
  if (!response.ok) {
    throw new Error("Failed to fetch reward data");
  }
  return response.json();
}

// Interface for brand data from API
interface Brand {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  image?: string;
  tag?: string;
  key?: string;
}

// Function to fetch brands from API
async function fetchBrands(): Promise<Brand[]> {
  const response = await fetch("/api/rewards/brands");
  if (!response.ok) {
    throw new Error("Failed to fetch brands");
  }
  const data = await response.json();
  return data.data;
}

// Create a reusable TagInput component after the SortableTableRow component
interface TagInputProps {
  selectedTags: string[];
  onTagRemove: (tag: string) => void;
  onTagAdd: (tag: string) => void;
}

function TagInput({ selectedTags, onTagRemove, onTagAdd }: TagInputProps) {
  // Simplified & more robust tag input component
  const [inputValue, setInputValue] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Fetch available tags from API
  const { data: availableTags = [], isLoading: isTagsLoading } = useQuery({
    queryKey: ["reward-tags"],
    queryFn: async () => {
      const response = await fetch("/api/rewards/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      return data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Build a list of suggestions that match the current input and are not already selected
  const suggestions = React.useMemo(() => {
    if (!inputValue.trim()) return [];
    return availableTags
      .map((t: { name: string; id: string }) => t.name)
      .filter(
        (t: string) =>
          t.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(t)
      )
      .slice(0, 10);
  }, [inputValue, selectedTags, availableTags]);

  // Helper to add a new tag
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || selectedTags.includes(trimmed)) return;
    onTagAdd(trimmed);
    setInputValue("");
  };

  // Handle key presses inside the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && inputValue === "" && selectedTags.length) {
      onTagRemove(selectedTags[selectedTags.length - 1]);
    }
  };

  return (
    <div
      className="relative flex flex-wrap items-center gap-2 rounded-md border p-2"
      onClick={() => {
        // Focus the input when the container is clicked
        const input = document.getElementById("tag-input-field");
        input?.focus();
      }}
    >
      {selectedTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center">
          {tag}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => onTagRemove(tag)}
          />
        </Badge>
      ))}

      <input
        id="tag-input-field"
        className="min-w-[120px] flex-grow border-none bg-transparent text-sm outline-none"
        placeholder={selectedTags.length ? "Add tag..." : "Add tags..."}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow click selection
          setTimeout(() => setShowSuggestions(false), 100);
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {suggestions.map((s: string) => (
            <div
              key={s}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
              onMouseDown={(e) => e.preventDefault() /* keep focus */}
              onClick={() => addTag(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ManageReward({
  isOpen,
  onOpenChange,
  selectedReward,
}: ManageRewardProps) {
  const { has } = useAuth();

  const canManageRewards =
    has?.({
      permission: "org:rewards:manage",
    }) ?? false;

  // Feature flags
  const recentTransactionsEnabled = false;
  const activityViewEnabled = false;
  const rewardsRelatedCatalogsEnabled = useGateValue(
    "rewards_related_catalogs"
  );

  // Get query client for data invalidation
  const queryClient = useQueryClient();

  // Extract the base CPID (first 4 parts) to use for API fetching
  const baseCpid = selectedReward?.cpid || "";

  // Use TanStack Query to fetch reward data
  const {
    data: rewardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reward", baseCpid],
    queryFn: () => fetchRewardByCpid(baseCpid),
    enabled: isOpen && baseCpid !== "", // Only fetch when modal is open and we have a CPID
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use TanStack Query to fetch brands data
  const { data: brandsData, isLoading: isBrandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const [activeTab, setActiveTab] = React.useState("General");
  const [activeSidebar, setActiveSidebar] = React.useState("Details");
  const [isRewardSuspended, setIsRewardSuspended] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<
    (typeof recentOrders)[0] | null
  >(null);
  const [viewingOrderDetail, setViewingOrderDetail] = React.useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = React.useState(false);
  const [isSuspending, setIsSuspending] = React.useState(false);
  const [editingSourceId, setEditingSourceId] = React.useState<string | null>(
    null
  );
  const [showSuspendButton, setShowSuspendButton] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  // Form state for General tab
  const [poyntsInput, setPoyntsInput] = React.useState<string>("");
  const [initialGeneralData, setInitialGeneralData] = React.useState<{
    poynts: string;
    tags: string[];
  } | null>(null);

  // Helper to compare tag arrays (order-sensitive)
  const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((val, idx) => val === b[idx]);

  // Determine whether any changes have been made in the General tab
  const isGeneralDirty = React.useMemo(() => {
    if (!initialGeneralData) return false;
    const poyntsChanged = poyntsInput !== initialGeneralData.poynts;
    const tagsChanged = !arraysEqual(selectedTags, initialGeneralData.tags);
    return poyntsChanged || tagsChanged;
  }, [poyntsInput, selectedTags, initialGeneralData]);

  // Check if we have API data
  const hasApiData = !!rewardData;

  // Use data from API for General tab
  React.useEffect(() => {
    if (rewardData) {
      // Update UI based on reward status
      setIsRewardSuspended(rewardData.reward_status === "suspended");
      // Could add more state updates here as needed
    }
  }, [rewardData]);

  // Update to default to General if a disabled tab was previously selected
  React.useEffect(() => {
    if (
      (!recentTransactionsEnabled && activeTab === "Recent Transactions") ||
      (!activityViewEnabled && activeTab === "Activity")
    ) {
      setActiveTab("General");
    }
  }, [activeTab, recentTransactionsEnabled, activityViewEnabled]);

  // Use the data from API always for operation, selectedReward only for loading UI
  const displayReward = rewardData || (isLoading ? selectedReward : null);

  const handleSuspendConfirm = () => {
    setShowSuspendConfirm(false);
    setIsSuspending(true);

    setIsSuspending(false);
    setIsRewardSuspended(true);
  };

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => {
              setViewingOrderDetail(false);
              setSelectedOrder(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Button>
        </div>

        <div className="space-y-8">
          {/* Order Information */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Order ID
                  </div>
                  <div className="mt-1 text-base">{selectedOrder.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Customer
                  </div>
                  <div className="mt-1 text-base font-medium">
                    {selectedOrder.customer}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </div>
                  <div className="mt-1 text-base">{selectedOrder.date}</div>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </div>
                  <div className="mt-1 text-base font-medium">
                    {selectedOrder.amount}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </div>
                  <div className="mt-1">
                    <Badge
                      className={cn(
                        "capitalize",
                        selectedOrder.status === "Completed" &&
                          "bg-green-600 hover:bg-green-700 text-white",
                        selectedOrder.status === "Failed" &&
                          "bg-destructive hover:bg-destructive",
                        selectedOrder.status === "Processing" &&
                          "border-yellow-500 text-yellow-700"
                      )}
                    >
                      {selectedOrder.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <Separator className="my-2" />

          {/* Order Details */}
          <div>
            <h3 className="text-lg font-medium mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Reward Type
                  </div>
                  <div className="mt-1 text-base">Gift Card</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Reward ID
                  </div>
                  <div className="mt-1 text-base font-mono text-sm">
                    RWD-{Math.floor(Math.random() * 100000)}
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Points Used
                  </div>
                  <div className="mt-1 text-base">15,000 points</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Delivery Method
                  </div>
                  <div className="mt-1 text-base">Email</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div>
            <h3 className="text-lg font-medium mb-4">Transaction Details</h3>
            <div className="space-y-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium mb-2">
                  Transaction Reference
                </div>
                <div className="font-mono text-sm">
                  TXN-{Math.floor(Math.random() * 1000000)}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium mb-2">Payment Method</div>
                <div>Points Redemption</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium mb-2">Billing Address</div>
                <div>123 Main St, Anytown, CA 12345</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // No longer needed - handled by ManageRewardSources

  const handleEditSource = (sourceId: number) => {
    console.log("[ManageReward] Editing source with ID:", sourceId);
    setEditingSourceId(String(sourceId));
  };

  // Initialize form state from API data
  React.useEffect(() => {
    if (displayReward) {
      const tags = displayReward.tags
        ? displayReward.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      setSelectedTags(tags);

      const poyntsStr = displayReward.poynts?.toString() || "";
      setPoyntsInput(poyntsStr);

      setInitialGeneralData({ poynts: poyntsStr, tags });
    }
  }, [displayReward]);

  // Simplify tag handlers to work with our new TagInput component
  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Import the EditRewardSource component
  const renderContent = () => {
    // If editing a source, show Edit Reward Values content
    if (editingSourceId) {
      // Find the source item directly from rewardData
      const sourceItem = rewardData?.items?.find(
        (item) =>
          String(item.id) === editingSourceId ||
          String(item.source_letter) === editingSourceId
      );

      console.log("[ManageReward] Found source item:", sourceItem);
      console.log("[ManageReward] Looking for source ID:", editingSourceId);

      // Create a source object for the EditGiftCardSource component
      const selectedSource = sourceItem
        ? ({
            // IMPORTANT: The API expects the actual database ID
            id: Number(sourceItem.id), // Ensure id is a number
            name: sourceItem.source_letter || "",
            status: sourceItem.reward_availability || "available",
            cpid: sourceItem.cpid,
            cpidx: sourceItem.cpidx,
            latency:
              typeof sourceItem.latency === "number"
                ? sourceItem.latency
                : null,
            providerStatus: sourceItem.reward_status || "active",
            cardStatus: sourceItem.reward_status || "active",
            utid: String(sourceItem.utid || ""),
            rebate_provider_percentage: sourceItem.rebate_provider_percentage,
            rebate_base_percentage: sourceItem.rebate_base_percentage,
            rebate_customer_percentage: sourceItem.rebate_customer_percentage,
            rebate_cp_percentage: sourceItem.rebate_cp_percentage,
          } as GiftCardSource)
        : undefined;

      console.log("[ManageReward] Created selectedSource:", selectedSource);

      return (
        <EditGiftCardSource
          selectedSource={selectedSource}
          displayReward={rewardData || null}
          onCancel={() => setEditingSourceId(null)}
          onDataUpdated={() => {
            // Refresh the reward data
            if (baseCpid) {
              queryClient.invalidateQueries({
                queryKey: ["reward", baseCpid],
              });
            }
            // Also refresh the rewards list so the table reflects the changes
            queryClient.invalidateQueries({
              queryKey: ["rewards"],
            });
          }}
          onSave={(sourceId: number, formData: any) => {
            console.log("Saving source data:", sourceId, formData);

            // Just close the edit form and let the API refetch happen
            setEditingSourceId(null);

            // Refresh the reward data
            if (baseCpid) {
              queryClient.invalidateQueries({
                queryKey: ["reward", baseCpid],
              });
            }
            // Also refresh the rewards list so the table reflects the changes
            queryClient.invalidateQueries({
              queryKey: ["rewards"],
            });
          }}
        />
      );
    }

    switch (activeTab) {
      case "General":
        return (
          <div className="space-y-4">
            <div className="flex gap-8">
              <div className="flex-1 space-y-4">
                {/* <div className="space-y-2">
                  <Label htmlFor="cpid">CPID</Label>
                  <p className="text-sm">
                    {displayReward?.cpid || ""}
                  </p>
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <p className="text-sm">{displayReward?.brand_name || ""}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <p className="text-sm">
                    {displayReward?.reward_status || "Active"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm">
                    {displayReward?.language || "English"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Reward Value</Label>
                  <p className="text-sm">
                    ${displayReward?.value || ""}
                    {displayReward &&
                      displayReward.value_type === "FIXED_VALUE" && (
                        <span className="text-muted-foreground ml-1">
                          (Fixed)
                        </span>
                      )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rebate">Rebate</Label>
                  <p className="text-sm">1.25%</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poynts">Poynts</Label>

                  <Input
                    id="poynts"
                    type="number"
                    value={poyntsInput}
                    onChange={(e) => setPoyntsInput(e.target.value)}
                    disabled={!canManageRewards}
                    className={cn(
                      !canManageRewards &&
                        "opacity-60 cursor-not-allowed bg-background"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mb-1">
                    Note: poynts can be overriden at the catalog level
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <TagInput
                    selectedTags={selectedTags}
                    onTagRemove={handleTagRemove}
                    onTagAdd={handleTagAdd}
                  />
                </div>
              </div>
              <div className="w-72 shrink-0">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6">
                    {displayReward?.items?.[0]?.reward_image ? (
                      <Image
                        src={displayReward.items[0].reward_image}
                        alt={`${displayReward?.brand_name || "Gift Card"} Preview`}
                        width={300}
                        height={200}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-[200px] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mb-2 text-muted-foreground/40 mx-auto" />
                          <p className="text-sm text-muted-foreground font-medium">
                            No image available
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      Gift Card Preview
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  {showSuspendButton && (
                    <>
                      <Button
                        variant={isRewardSuspended ? "outline" : "destructive"}
                        className="w-full"
                        onClick={() => setShowSuspendConfirm(true)}
                        disabled={isRewardSuspended || isSuspending}
                      >
                        {isSuspending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Suspending...
                          </>
                        ) : isRewardSuspended ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Resume Reward
                          </>
                        ) : (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Suspend Reward
                          </>
                        )}
                      </Button>
                      {isRewardSuspended && (
                        <p className="mt-2 text-xs text-muted-foreground text-center">
                          Reward can only be unsuspended by a Reward admin
                        </p>
                      )}
                      {isRewardSuspended && (
                        <p className="mt-1 text-xs text-muted-foreground text-center">
                          This reward was suspended by Mila on{" "}
                          {new Date(
                            Date.now() - 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-start pt-4">
              <Button
                variant="default"
                size="default"
                disabled={isSaving || !canManageRewards || !isGeneralDirty}
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    // Create the payload
                    const payload = {
                      poynts: poyntsInput
                        ? Number(poyntsInput)
                        : displayReward?.poynts,
                      tags: selectedTags,
                    };

                    // Make the API call
                    const response = await fetch(`/api/rewards/${baseCpid}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                      // Update the snapshot so the Save button disables again
                      setInitialGeneralData({
                        poynts: poyntsInput,
                        tags: selectedTags,
                      });

                      // Refresh the reward data
                      queryClient.invalidateQueries({
                        queryKey: ["reward", baseCpid],
                      });
                      // Also refresh the rewards list so the table reflects the changes
                      queryClient.invalidateQueries({
                        queryKey: ["rewards"],
                      });
                    } else {
                      console.error("Failed to update reward");
                    }
                  } catch (error) {
                    console.error("Error updating reward:", error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
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
          </div>
        );
      case "Description":
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Description</h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    displayReward?.description ||
                    displayReward?.items?.[0]?.description ||
                    "<p>No description available.</p>",
                }}
              />
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Terms</h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    displayReward?.terms ||
                    displayReward?.items?.[0]?.terms ||
                    "<p>No terms available.</p>",
                }}
              />
            </div>

            {/* Disclaimer */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Disclaimer</h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    displayReward?.disclaimer ||
                    displayReward?.items?.[0]?.disclaimer ||
                    "<p>No disclaimer available.</p>",
                }}
              />
            </div>
          </div>
        );
      case "Reward Sources":
        return (
          <ManageRewardSources
            sources={
              (rewardData?.items || []).map((item, index) => {
                // Map each API item to a GiftCardSource object
                const source = {
                  // IMPORTANT: The API expects the actual database ID
                  id: item.id,
                  name: item.source_letter || String.fromCharCode(65 + index),
                  status: item.reward_availability || "available",
                  cpid: item.cpid,
                  cpidx: item.cpidx,
                  latency:
                    typeof item.latency === "number"
                      ? item.latency
                      : typeof item.latency === "string"
                        ? parseInt(item.latency)
                        : 100 + index * 50,
                  providerStatus: item.reward_status || "active",
                  cardStatus: item.reward_status || "active",
                  utid: String(item.utid || ""),
                } as GiftCardSource;
                return source;
              }) as any[]
            } // Type assertion to make this compatible with other GiftCardSource interface
            displayReward={rewardData || (null as any)} // Type assertion to handle GroupedReward mismatch temporarily
            onEditSource={handleEditSource}
            onSourcesReordered={() => {
              // Invalidate and refetch the reward data when sources are reordered
              if (baseCpid) {
                queryClient.invalidateQueries({
                  queryKey: ["reward", baseCpid],
                });
              }
            }}
            onSourceStatusChange={() => {
              // Invalidate both the individual reward and the main rewards grid
              if (baseCpid) {
                queryClient.invalidateQueries({
                  queryKey: ["reward", baseCpid],
                });
              }
              // Also invalidate the main rewards query to refresh the grid
              queryClient.invalidateQueries({
                queryKey: ["rewards"],
              });
            }}
          />
        );
      case "Availability":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Availability</h3>
              <div className="grid gap-4">
                <div
                  className={`flex items-center justify-between rounded-lg border p-4 ${getStatusColor(displayReward?.reward_availability || "available")}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      {getStatusIcon(
                        displayReward?.reward_availability || "available"
                      )}
                    </span>
                    <span className="font-medium">
                      {displayReward?.reward_availability
                        ? displayReward.reward_availability
                            .charAt(0)
                            .toUpperCase() +
                          displayReward.reward_availability.slice(1)
                        : "Available"}
                    </span>
                  </div>
                  <div className="text-sm">Response time: 145ms</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Status Legend</h3>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-700">⬤</span>
                  <span className="text-sm text-muted-foreground">
                    Available - Service is operational and responding normally
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-700">◐</span>
                  <span className="text-sm text-muted-foreground">
                    Degraded - Service is operational but experiencing issues
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-700">○</span>
                  <span className="text-sm text-muted-foreground">
                    Unavailable - Service is not responding or offline
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Recent Availability Events
              </h3>
              <div className="rounded-lg border divide-y">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-700">
                        Service Available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Service restored after maintenance
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      2 mins ago
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-700">
                        Service Unavailable
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled maintenance started
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      15 mins ago
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-700">
                        Service Degraded
                      </p>
                      <p className="text-sm text-muted-foreground">
                        High latency detected
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      1 hour ago
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-700">
                        Service Available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Normal operations resumed
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "Recent Transactions":
        if (!recentTransactionsEnabled) return null;
        if (viewingOrderDetail) {
          return renderOrderDetail();
        }
        return (
          <div className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            order.status === "Completed"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedOrder(order);
                            setViewingOrderDetail(true);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      case "Catalogs":
        return (
          <div className="space-y-6">
            {!rewardsRelatedCatalogsEnabled ? null : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available in Catalogs</h3>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Catalog Name</TableHead>
                        <TableHead>Poynts</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exampleCatalogs.map((catalog) => (
                        <TableRow key={catalog.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {displayReward?.items?.[0]?.reward_image ? (
                                <Image
                                  src={displayReward.items[0].reward_image}
                                  alt={catalog.name}
                                  width={30}
                                  height={20}
                                  className="object-contain"
                                />
                              ) : (
                                <div className="w-[30px] h-[20px] flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              {catalog.name}
                            </div>
                          </TableCell>
                          <TableCell>{catalog.points}</TableCell>
                          <TableCell>{catalog.lastUpdated}</TableCell>
                          <TableCell>
                            <div className="relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    Edit poynts
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Remove from catalog
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        );
      case "Activity":
        if (!activityViewEnabled) return null;
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Activity</h3>
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="whitespace-nowrap">
                          {activity.timestamp}
                        </TableCell>
                        <TableCell>{activity.event}</TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{activity.actor}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              activity.severity === "success"
                                ? "bg-green-50 text-green-700"
                                : activity.severity === "warning"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : activity.severity === "error"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {activity.event}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">Gift Card Configuration</DialogTitle>
        <DialogDescription className="sr-only">
          Configure your gift card settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="pt-4">
                    {giftCardSettings.nav
                      .filter(
                        (item) =>
                          (item.name !== "Recent Transactions" ||
                            recentTransactionsEnabled) &&
                          (item.name !== "Activity" || activityViewEnabled) &&
                          (item.name !== "Catalogs" ||
                            rewardsRelatedCatalogsEnabled)
                      )
                      .map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={item.name === activeTab}
                            onClick={() => {
                              setActiveTab(item.name);
                              setEditingSourceId(null);
                            }}
                          >
                            <button className="w-full">
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[680px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Gift Cards</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {isLoading ? (
                        <>
                          <span className="inline-block mr-2">
                            {selectedReward?.brand_name} $
                            {selectedReward?.value} Gift Card
                          </span>
                          <Loader2 className="inline-block h-3 w-3 animate-spin text-muted-foreground" />
                        </>
                      ) : rewardData ? (
                        `${rewardData.brand_name} $${rewardData.value} ${rewardData.type === "giftcard" ? "Gift Card" : "Offer"} (${rewardData.cpid})`
                      ) : (
                        "Gift Card"
                      )}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading reward details...
                    </p>
                  </div>
                </div>
              ) : isError ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-destructive font-medium">
                      Error loading reward details
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>

      {/* Confirmation Dialog for Suspending Reward */}
      <Dialog open={showSuspendConfirm} onOpenChange={setShowSuspendConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend Gift Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this gift card? This will prevent
              any new purchases of this gift card until it is restored by a
              Reward admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSuspendConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendConfirm}>
              Yes, Suspend Gift Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
