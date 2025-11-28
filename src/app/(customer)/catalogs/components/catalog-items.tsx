"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { X, MoreHorizontal, Loader2, ChevronDown, ChevronRight, Package, Search, Check, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { ManageReward } from "@/app/(customer)/rewards/components/manage-reward";
import {
  ManageOffer,
  OfferDetail,
} from "@/app/(customer)/rewards/components/manage-offer";
import { DataTable } from "@/components/data-table/data-table";
import Image from "next/image";
import { AddItemsButton } from "./add-items-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/ui/editable-cell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const catalogItemSchema = z.object({
  cpid: z.string(),
  reward_type: z.string(),
  title: z.string(),
  rank: z.number(),
  item_id: z.string(),
  entid: z.number(),
  ent_name: z.string().nullable().transform(val => val || "Unknown Brand"),
  brand: z.string(),
  language: z.string(),
  status: z.string(),
  availability: z.string(),
  inventory: z.number(),
  inventory_type: z.string(),
  poynts_reward: z.number(),
  poynts_catalog: z.number(),
  value: z.number(),
  registry_rank: z.number(),
  cpidx: z.string(),
  reward_id: z.number(),
  priority: z.number(),
  tags: z.string().nullable(),
  reward_image: z.string().optional(),
});

const catalogItemsResponseSchema = z.object({
  data: z.array(catalogItemSchema),
});

type CatalogItem = z.infer<typeof catalogItemSchema>;

async function getCatalogItems(catalogId: string) {
  const response = await fetch(`/api/catalogs/${catalogId}/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch catalog items");
  }
  const responseData = await response.json();
  const parsedResponse = catalogItemsResponseSchema.parse(responseData);
  return parsedResponse.data;
}

async function removeItemFromCatalog(catalogId: string, itemId: string) {
  const response = await fetch(`/api/catalogs/${catalogId}/items/${itemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove item from catalog");
  }

  return response.json();
}

async function updateItemRank(
  catalogId: string,
  itemId: string,
  newRank: number
) {
  const response = await fetch(`/api/catalogs/${catalogId}/items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rank: newRank }),
  });

  if (!response.ok) {
    throw new Error("Failed to update item rank");
  }

  return response.json();
}

async function updateItemCatalogPoints(
  catalogId: string,
  itemId: string,
  newPoynts: number
) {
  const response = await fetch(`/api/catalogs/${catalogId}/items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ poynts_catalog: newPoynts }),
  });

  if (!response.ok) {
    throw new Error("Failed to update catalog points");
  }

  return response.json();
}

interface CatalogItemsProps {
  catalogId: string;
  onClose?: () => void;
  catalogName?: string;
  canManageCatalogs: boolean;
}

// Add this component before the main CatalogItems component
function ActionsCell({
  item,
  canManageCatalogs,
  catalogName,
  handleRemoveItem,
  handleEditReward,
}: {
  item: CatalogItem;
  canManageCatalogs: boolean;
  catalogName?: string;
  handleRemoveItem: (itemId: string) => void;
  handleEditReward: (item: CatalogItem) => void;
}) {
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);

  const handleConfirmRemove = () => {
    handleRemoveItem(item.item_id);
    setShowRemoveDialog(false);
  };

  return (
    <>
      {canManageCatalogs && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditReward(item)}>
              Edit reward
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowRemoveDialog(true)}
              className="text-red-600"
            >
              Remove from catalog
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item from Catalog</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>&ldquo;{item.title}&rdquo;</strong> from the{" "}
              {catalogName ? (
                <strong>&ldquo;{catalogName}&rdquo;</strong>
              ) : (
                "selected"
              )}{" "}
              catalog? This action can be undone by adding the item back to the
              catalog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Remove from Catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Component for displaying brand-grouped view
interface BrandGroup {
  brand: string;
  items: CatalogItem[];
  totalItems: number;
  valueRange: { min: number; max: number };
  activeCount: number;
  totalPoynts: number;
  brandImage?: string;
}

// FacetFilter component (copied from view-catalog-modal.tsx)
interface FacetFilterProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues: Set<string>;
  onChange: (values: Set<string>) => void;
}

function FacetFilter({ title, options, selectedValues, onChange }: FacetFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newValues = new Set(selectedValues);
                      if (isSelected) {
                        newValues.delete(option.value);
                      } else {
                        newValues.add(option.value);
                      }
                      onChange(newValues);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange(new Set())}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BrandGroupedView({ 
  items, 
  canManageCatalogs,
  handleUpdateRank,
  handleUpdateCatalogPoints,
}: { 
  items: CatalogItem[];
  canManageCatalogs: boolean;
  handleUpdateRank: (itemId: string, newRank: number) => Promise<void>;
  handleUpdateCatalogPoints: (itemId: string, newPoynts: number) => Promise<void>;
}) {
  const [expandedBrands, setExpandedBrands] = React.useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = React.useState<Set<string>>(new Set());

  // Type options for facet filter
  const typeOptions = React.useMemo(() => [
    { value: 'giftcard', label: 'Gift Cards' },
    { value: 'offer', label: 'Offers' }
  ], []);

  // Extract unique brands for facet filter
  const brandOptions = React.useMemo(() => {
    if (!items.length) return [];
    const brands = new Set<string>();
    
    items.forEach(item => {
      brands.add(item.ent_name);
    });
    
    return Array.from(brands)
      .filter(Boolean)
      .sort()
      .map(brand => ({
        value: brand,
        label: brand,
      }));
  }, [items]);

  // Filter items based on search, type, and brand filters
  const filteredItems = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Type filter - if no types selected, show all; if types selected, only show selected types
    const showGiftCards = selectedTypes.size === 0 || selectedTypes.has('giftcard');
    const showOffers = selectedTypes.size === 0 || selectedTypes.has('offer');
    
    return items.filter((item) => {
      // Type filter
      const matchesType = (item.reward_type === 'giftcard' && showGiftCards) || 
                         (item.reward_type === 'offer' && showOffers);
      
      // Brand filter
      const matchesBrand = selectedBrands.size === 0 || selectedBrands.has(item.ent_name);
      
      // Search filter
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.cpid.toLowerCase().includes(query) ||
        item.ent_name.toLowerCase().includes(query);
      
      return matchesType && matchesBrand && matchesSearch;
    });
  }, [items, searchQuery, selectedTypes, selectedBrands]);

  // Group items by brand
  const brandGroups = React.useMemo(() => {
    const groups: Record<string, BrandGroup> = {};

    filteredItems.forEach((item) => {
      const brand = item.brand || item.ent_name || "Unknown Brand";
      
      if (!groups[brand]) {
        groups[brand] = {
          brand,
          items: [],
          totalItems: 0,
          valueRange: { min: Infinity, max: -Infinity },
          activeCount: 0,
          totalPoynts: 0,
          brandImage: undefined,
        };
      }

      groups[brand].items.push(item);
      groups[brand].totalItems += 1;
      groups[brand].valueRange.min = Math.min(
        groups[brand].valueRange.min,
        item.value
      );
      groups[brand].valueRange.max = Math.max(
        groups[brand].valueRange.max,
        item.value
      );
      if (item.status === "active") {
        groups[brand].activeCount += 1;
      }
      groups[brand].totalPoynts += item.poynts_catalog;
      
      // Use the first item's image as brand image
      if (!groups[brand].brandImage && item.reward_image) {
        groups[brand].brandImage = item.reward_image;
      }
    });

    // Sort items within each brand by rank
    Object.values(groups).forEach((group) => {
      group.items.sort((a, b) => a.rank - b.rank);
    });

    // Convert to array and sort by brand name
    return Object.values(groups).sort((a, b) =>
      a.brand.localeCompare(b.brand)
    );
  }, [filteredItems]);

  const toggleBrand = (brand: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  };

  const toggleAllBrands = () => {
    if (expandedBrands.size === brandGroups.length) {
      setExpandedBrands(new Set());
    } else {
      setExpandedBrands(new Set(brandGroups.map((g) => g.brand)));
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-9 pr-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <FacetFilter
            title="Type"
            options={typeOptions}
            selectedValues={selectedTypes}
            onChange={setSelectedTypes}
          />
          <FacetFilter
            title="Brands"
            options={brandOptions}
            selectedValues={selectedBrands}
            onChange={setSelectedBrands}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAllBrands}
          className="text-xs"
        >
          {expandedBrands.size === brandGroups.length
            ? "Collapse All"
            : "Expand All"}
        </Button>
      </div>

      {brandGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No rewards match your filter
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filter selection to see more results.
          </p>
        </div>
      ) : (
        brandGroups.map((group) => (
          <Card key={group.brand} className="overflow-hidden">
            <Collapsible
              open={expandedBrands.has(group.brand)}
              onOpenChange={() => toggleBrand(group.brand)}
            >
            <CollapsibleTrigger className="w-full">
              <CardHeader className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedBrands.has(group.brand) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-3">
                      {group.brandImage ? (
                        <Image
                          src={group.brandImage}
                          alt={group.brand}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 bg-muted rounded">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="font-medium text-base">{group.brand}</h3>
                        <p className="text-sm text-muted-foreground">
                          {group.totalItems} {group.totalItems === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-medium">
                        ${group.valueRange.min === group.valueRange.max
                          ? group.valueRange.min
                          : `${group.valueRange.min} - ${group.valueRange.max}`}
                      </p>
                      <p className="text-xs text-muted-foreground">Value Range</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0 border-t">
                <div className="divide-y">
                  {group.items.map((item) => (
                    <div
                      key={item.item_id}
                      className="px-6 py-3 flex items-center justify-between hover:bg-accent/25 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {item.cpid}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {item.language}
                            </span>
                            {item.tags && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.tags}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-20">
                          <span className="text-xs text-muted-foreground">Value:</span>
                          <span className="text-sm font-medium">${item.value}</span>
                        </div>
                        <div className="flex items-center gap-2 w-32">
                          <span className="text-xs text-muted-foreground">Poynts:</span>
                          <EditableCell
                            value={item.poynts_catalog}
                            onUpdate={(value) =>
                              handleUpdateCatalogPoints(item.item_id, value as number)
                            }
                            canEdit={canManageCatalogs}
                            type="number"
                            inputClassName="w-20"
                            displayFormatter={(value) => (
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{value}</span>
                                {item.poynts_catalog !== item.poynts_reward && (
                                  <span className="text-red-500 line-through text-xs">
                                    ({item.poynts_reward})
                                  </span>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        <div className="flex items-center gap-2 w-20">
                          <span className="text-xs text-muted-foreground">Rank:</span>
                          <EditableCell
                            value={item.rank}
                            onUpdate={(value) =>
                              handleUpdateRank(item.item_id, value as number)
                            }
                            canEdit={canManageCatalogs}
                            type="number"
                            inputClassName="w-12"
                            displayFormatter={(value) => (
                              <span className="text-sm font-medium">{value}</span>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
        ))
      )}
    </div>
  );
}

export function CatalogItems({
  catalogId,
  onClose,
  catalogName,
  canManageCatalogs,
}: CatalogItemsProps) {
  const [items, setItems] = React.useState<CatalogItem[]>([]);
  const [manageRewardOpen, setManageRewardOpen] = React.useState(false);
  const [selectedReward, setSelectedReward] =
    React.useState<CatalogItem | null>(null);
  // State for managing the offer dialog
  const [isOfferDialogOpen, setIsOfferDialogOpen] = React.useState(false);
  const [selectedOffer, setSelectedOffer] = React.useState<OfferDetail | null>(
    null
  );
  // State for view mode
  const [viewMode, setViewMode] = React.useState<"list" | "brand">("brand");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["catalog-items", catalogId],
    queryFn: () => getCatalogItems(catalogId),
    enabled: !!catalogId,
  });

  React.useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  const handleRemoveItem = React.useCallback(
    async (itemId: string) => {
      try {
        await removeItemFromCatalog(catalogId, itemId);
        setItems((currentItems) =>
          currentItems.filter((item) => item.item_id !== itemId)
        );
      } catch (error) {
        console.error("Failed to remove item from catalog:", error);
        // TODO: Show error toast to user
      }
    },
    [catalogId]
  );

  const handleEditReward = React.useCallback((item: CatalogItem) => {
    if (item.reward_type === "offer") {
      // Convert CatalogItem to OfferDetail format
      const offerDetail = {
        cpid: item.cpid,
        type: "offer" as const,
        title: item.title,
        brand_name: item.ent_name,
        language: item.language,
        value: item.value,
        poynts: item.poynts_reward,
        source_count: 1,
        tenant_id: "",
        reward_status: item.status,
        reward_availability: item.availability,
        tags: item.tags || "",
        is_enabled: item.status === "active",
        // Include the items array with redemption_id so ManageOffer can fetch detailed data
        items: [
          {
            id: 0, // Not used for fetching
            redemption_id: item.reward_id, // Use the actual reward ID, not the catalog item ID
            tenant_id: "",
            cpid: item.cpid,
            redemption_type: "offer",
            value: item.value,
            poynts: item.poynts_reward,
            name: item.title,
            inventory_remaining: item.inventory,
            title: item.title,
            reward_status: item.status,
            language: item.language,
            reward_availability: item.availability,
            priority: item.priority,
            cpidx: item.cpidx,
            type: item.reward_type,
            reward_image: item.reward_image,
          },
        ],
      } as unknown as OfferDetail;

      setSelectedOffer(offerDetail);
      setIsOfferDialogOpen(true);
    } else {
      // Handle gift cards (default case)
      setSelectedReward(item);
      setManageRewardOpen(true);
    }
  }, []);

  const handleUpdateRank = React.useCallback(
    async (itemId: string, newRank: number) => {
      try {
        await updateItemRank(catalogId, itemId, newRank);
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.item_id === itemId ? { ...item, rank: newRank } : item
          )
        );
      } catch (error) {
        console.error("Failed to update item rank:", error);
        // TODO: Show error toast to user
      }
    },
    [catalogId]
  );

  const handleUpdateCatalogPoints = React.useCallback(
    async (itemId: string, newPoynts: number) => {
      try {
        await updateItemCatalogPoints(catalogId, itemId, newPoynts);
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.item_id === itemId
              ? { ...item, poynts_catalog: newPoynts }
              : item
          )
        );
      } catch (error) {
        console.error("Failed to update catalog points:", error);
        // TODO: Show error toast to user
      }
    },
    [catalogId]
  );

  const handleItemsAdded = () => {
    // This will trigger a refetch of the catalog items
    // The useQuery will automatically update when the query is invalidated
  };

  // Define table columns
  const columns = React.useMemo<ColumnDef<CatalogItem>[]>(
    () => [
      {
        id: "image",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center">
              {item.reward_image ? (
                <Image
                  src={item.reward_image}
                  alt={item.title}
                  width={32}
                  height={32}
                  className="rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded">
                  <span className="text-xs text-muted-foreground">
                    {item.reward_type === "giftcard" ? "GC" : "OF"}
                  </span>
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "cpid",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="CPID" />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "reward_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "rank",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rank" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <EditableCell
              value={item.rank}
              onUpdate={(value) =>
                handleUpdateRank(item.item_id, value as number)
              }
              canEdit={canManageCatalogs}
              type="number"
              inputClassName="w-16"
            />
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "ent_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Brand" />
        ),
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "poynts_catalog",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Poynts" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <EditableCell
              value={item.poynts_catalog}
              onUpdate={(value) =>
                handleUpdateCatalogPoints(item.item_id, value as number)
              }
              canEdit={canManageCatalogs}
              type="number"
              inputClassName="w-20"
              displayFormatter={(value) => (
                <>
                  {value}
                  {item.poynts_catalog !== item.poynts_reward && (
                    <span className="text-red-500 line-through ml-1">
                      ({item.poynts_reward})
                    </span>
                  )}
                </>
              )}
            />
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex items-center">
              <span
                className={`px-2 py-1 rounded-sm text-xs font-medium ${
                  status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        enableSorting: true,
      },
      {
        accessorKey: "availability",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Availability" />
        ),
        cell: ({ row }) => {
          const availability = row.original.availability;
          return (
            <div className="flex items-center">
              <span
                className={`px-2 py-1 rounded-sm text-xs font-medium ${
                  availability === "available"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {availability.charAt(0).toUpperCase() + availability.slice(1)}
              </span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        enableSorting: true,
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Value" />
        ),
        cell: ({ row }) => {
          const value = row.original.value;
          return <span>${value}</span>;
        },
        enableSorting: true,
      },
      {
        accessorKey: "language",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Language" />
        ),
        cell: ({ row }) => {
          const language = row.original.language;
          return <span className="font-mono text-sm">{language}</span>;
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        enableSorting: true,
      },
      {
        accessorKey: "tags",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tags" />
        ),
        cell: ({ row }) => {
          const tags = row.original.tags;
          if (!tags) return null;
          return (
            <div className="text-sm text-muted-foreground">
              {tags
                .split(",")
                .map((tag) => tag.trim())
                .join(", ")}
            </div>
          );
        },
        filterFn: (row, id, value) => {
          const tags = row.original.tags;
          if (!tags) return value.length === 0;
          const itemTags = tags.split(",").map((tag) => tag.trim());
          return value.some((filterTag: string) =>
            itemTags.includes(filterTag)
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <ActionsCell
              item={item}
              canManageCatalogs={canManageCatalogs}
              catalogName={catalogName}
              handleRemoveItem={handleRemoveItem}
              handleEditReward={handleEditReward}
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [
      canManageCatalogs,
      catalogName,
      handleUpdateRank,
      handleUpdateCatalogPoints,
      handleRemoveItem,
      handleEditReward,
    ]
  );

  // Create filter options from data
  const filterOptions = React.useMemo(() => {
    if (!items.length)
      return {
        rewardTypes: [],
        brands: [],
        tags: [],
        statuses: [],
        availabilities: [],
        languages: [],
      };

    const rewardTypes = Array.from(
      new Set(items.map((item) => item.reward_type))
    ).map((type) => ({ label: type, value: type }));

    const brands = Array.from(new Set(items.map((item) => item.ent_name))).map(
      (brand) => ({ label: brand, value: brand })
    );

    const statuses = Array.from(new Set(items.map((item) => item.status))).map(
      (status) => ({
        label: status === "active" ? "Visible" : "Hidden",
        value: status,
      })
    );

    const availabilities = Array.from(
      new Set(items.map((item) => item.availability))
    ).map((availability) => ({
      label: availability.charAt(0).toUpperCase() + availability.slice(1),
      value: availability,
    }));

    const languages = Array.from(
      new Set(items.map((item) => item.language))
    ).map((language) => ({ label: language, value: language }));

    const allTags = new Set<string>();
    items.forEach((item) => {
      if (item.tags) {
        item.tags.split(",").forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) allTags.add(trimmed);
        });
      }
    });
    const tags = Array.from(allTags)
      .sort()
      .map((tag) => ({ label: tag, value: tag }));

    return { rewardTypes, brands, tags, statuses, availabilities, languages };
  }, [items]);

  // Define filters for the DataTable
  const dataTableFilters = React.useMemo(
    () => [
      {
        id: "reward_type",
        title: "Type",
        options: filterOptions.rewardTypes,
      },
      {
        id: "ent_name",
        title: "Brand",
        options: filterOptions.brands,
      },
      {
        id: "status",
        title: "Status",
        options: filterOptions.statuses,
      },
      {
        id: "tags",
        title: "Tags",
        options: filterOptions.tags,
      },
    ],
    [filterOptions]
  );

  // Calculate total unique brands count (unaffected by filtering)
  const totalBrandsCount = React.useMemo(() => {
    if (!items.length) return 0;
    const uniqueBrands = new Set(items.map((item) => item.ent_name));
    return uniqueBrands.size;
  }, [items]);

  // Create custom actions for the toolbar
  const customActions = (
    <AddItemsButton
      catalogId={catalogId}
      onItemsAdded={handleItemsAdded}
      currentItems={items}
      disabled={!canManageCatalogs}
    />
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-8 pb-4">
          <div>
            <h3 className="text-lg font-medium">{catalogName} Catalog</h3>
          </div>
          <div className="flex items-center gap-2">
            <AddItemsButton
              catalogId={catalogId}
              onItemsAdded={handleItemsAdded}
              currentItems={items}
              disabled={!canManageCatalogs}
            />
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="px-8 pt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading catalog items...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-8 pb-4">
        <div>
          <h3 className="text-lg font-medium">{catalogName} Catalog</h3>
          {catalogName && (
            <p className="text-sm text-muted-foreground">
              {items.length} Reward Items • {totalBrandsCount} Brands
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "brand")}>
            <TabsList>
              <TabsTrigger value="brand">Brand View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </Tabs>
          {customActions}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8">
        {viewMode === "list" ? (
          <DataTable
            data={items}
            columns={columns}
            searchableColumns={[
              {
                id: "title",
                displayName: "Title",
              },
              {
                id: "cpid",
                displayName: "CPID",
              },
            ]}
            searchPlaceholder="Search catalog items..."
            filters={dataTableFilters}
            enableCSVExport={true}
            csvFilename={`${catalogName ? catalogName.toLowerCase().replace(/\s+/g, "-") : "catalog"}-items-export`}
            disablePagination={false}
            initialPageSize={20}
            enableRowSelection={false}
            showActionsButton={false}
            initialColumnVisibility={{
              reward_type: false,
              ent_name: false,
              status: false,
              availability: false,
              value: false,
              language: false,
              tags: false,
            }}
          />
        ) : (
          <BrandGroupedView 
            items={items} 
            canManageCatalogs={canManageCatalogs}
            handleUpdateRank={handleUpdateRank}
            handleUpdateCatalogPoints={handleUpdateCatalogPoints}
          />
        )}
      </div>

      <ManageReward
        isOpen={manageRewardOpen}
        onOpenChange={setManageRewardOpen}
        selectedReward={
          selectedReward
            ? {
                cpid: selectedReward.cpid,
                brand_name: selectedReward.ent_name,
                reward_status: selectedReward.status,
                language: selectedReward.language,
                value: selectedReward.value,
                poynts: selectedReward.poynts_reward,
                tags: selectedReward.tags || "",
                title: selectedReward.title,
                type:
                  selectedReward.reward_type.toLowerCase() === "gift card"
                    ? "giftcard"
                    : "offer",
                items: [],
                source_count: 1,
                tenant_id: "",
                reward_availability: "available",
                is_enabled: selectedReward.status === "active",
              }
            : null
        }
      />

      <ManageOffer
        isOpen={isOfferDialogOpen}
        onOpenChange={setIsOfferDialogOpen}
        selectedOffer={selectedOffer}
        isCreateMode={false}
      />
    </div>
  );
}
