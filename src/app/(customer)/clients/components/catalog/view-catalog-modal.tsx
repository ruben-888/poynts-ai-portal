"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
  Check,
  PlusCircle,
  X,
  FlaskConical,
  Grid3X3,
  FileText,
  ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import JsonViewer from "@/components/json-viewer";
import { SourceCircles } from "./source-circle";
import { cn } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CatalogResponse } from "@/app/api/clients/(routes)/[client_id]/catalog/schema";
import type { SourcesResponse } from "@/app/api/rewards/(routes)/sources/schema";

interface ViewCatalogModalProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
}

async function fetchCatalog(clientId: string): Promise<CatalogResponse> {
  const response = await fetch(`/api/clients/${clientId}/catalog`);
  if (!response.ok) {
    throw new Error("Failed to fetch catalog");
  }
  return response.json();
}

async function fetchSources(cpids: string[]): Promise<SourcesResponse> {
  const response = await fetch(`/api/rewards/sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cpids }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch sources");
  }
  return response.json();
}

// Facet filter component for brands
interface FacetFilterProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues: Set<string>;
  onChange: (values: Set<string>) => void;
}

function FacetFilter({
  title,
  options,
  selectedValues,
  onChange,
}: FacetFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
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
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newSelected = new Set(selectedValues);
                      if (isSelected) {
                        newSelected.delete(option.value);
                      } else {
                        newSelected.add(option.value);
                      }
                      onChange(newSelected);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
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

export function ViewCatalogModal({
  clientId,
  clientName,
  isOpen,
  onClose,
}: ViewCatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{
    type: "giftcard" | "offer";
    id: string;
    name: string;
    denominations: string[];
  } | null>(null);
  const [sortBy, setSortBy] = useState<"display_order" | "alphabetical">(
    "display_order",
  );
  const [selectedDenomination, setSelectedDenomination] = useState<string>("");
  const [customDenomination, setCustomDenomination] = useState<string>("");
  const [isTestMode, setIsTestMode] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ["catalog", clientId],
    queryFn: () => fetchCatalog(clientId),
    enabled: isOpen,
  });

  // Extract all CPIDs from catalog data
  const allCpids = useMemo(() => {
    if (!data) return [];
    const cpids: string[] = [];

    // Get CPIDs from gift cards
    data.giftcard?.forEach((brand) => {
      brand.items.forEach((item) => {
        if (item.cpid) {
          cpids.push(item.cpid);
        }
      });
    });

    // Get CPIDs from offers
    data.offer?.forEach((offer) => {
      if (offer.cpid) {
        cpids.push(offer.cpid);
      }
    });

    return [...new Set(cpids)]; // Remove duplicates
  }, [data]);

  // Fetch source information for all CPIDs
  const { data: sourcesData, isLoading: isLoadingSources } = useQuery({
    queryKey: ["sources", allCpids],
    queryFn: () => fetchSources(allCpids),
    enabled: isOpen && allCpids.length > 0,
  });

  // Create a map for quick source lookup
  const sourcesMap = useMemo(() => {
    if (!sourcesData?.sources) return new Map();
    const map = new Map();
    sourcesData.sources.forEach((item) => {
      map.set(item.cpid, item.sources);
    });
    return map;
  }, [sourcesData]);

  // Extract unique brands for facet filter
  const brandOptions = useMemo(() => {
    if (!data) return [];
    const brands = new Set<string>();

    // Get brands from gift cards
    data.giftcard?.forEach((brand) => {
      brands.add(brand.brandName);
    });

    // Get brands from offers
    data.offer?.forEach((offer) => {
      brands.add(offer.brandName);
    });

    return Array.from(brands)
      .filter(Boolean)
      .sort()
      .map((brand) => ({
        value: brand,
        label: brand,
      }));
  }, [data]);

  // Type options for facet filter
  const typeOptions = useMemo(
    () => [
      { value: "giftcard", label: "Gift Cards" },
      { value: "offer", label: "Offers" },
    ],
    [],
  );

  // Generic filter and sort helper function
  const filterAndSort = <T,>(
    items: T[],
    config: {
      getBrandName: (item: T) => string;
      getSearchFields: (item: T) => string[];
      getDisplayOrder: (item: T) => string | null | undefined;
      getAlphabeticalSortField: (item: T) => string;
    },
  ): T[] => {
    const query = searchQuery.toLowerCase().trim();

    return items
      .filter((item) => {
        // Brand filter - if no brands selected, show all; if brands selected, only show selected brands
        const matchesBrand =
          selectedBrands.size === 0 ||
          selectedBrands.has(config.getBrandName(item));

        // Search filter
        const matchesSearch =
          !query ||
          config
            .getSearchFields(item)
            .some((field) => field.toLowerCase().includes(query));

        return matchesBrand && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "display_order") {
          const aDisplayOrder = parseInt(config.getDisplayOrder(a) || "999999");
          const bDisplayOrder = parseInt(config.getDisplayOrder(b) || "999999");
          return aDisplayOrder - bDisplayOrder;
        } else {
          // Sort alphabetically
          return config
            .getAlphabeticalSortField(a)
            .localeCompare(config.getAlphabeticalSortField(b));
        }
      });
  };

  // Filter data based on search query, brand selection, and type selection
  const filteredData = useMemo(() => {
    if (!data) return data;

    // Type filter - if no types selected, show all; if types selected, only show selected types
    const showGiftCards =
      selectedTypes.size === 0 || selectedTypes.has("giftcard");
    const showOffers = selectedTypes.size === 0 || selectedTypes.has("offer");

    return {
      ...data,
      giftcard: showGiftCards
        ? filterAndSort(data.giftcard, {
            getBrandName: (brand) => brand.brandName,
            getSearchFields: (brand) => [brand.brandName, brand.rewardName],
            getDisplayOrder: (brand) => brand.items[0]?.display_order,
            getAlphabeticalSortField: (brand) => brand.brandName,
          })
        : [],
      offer: showOffers
        ? filterAndSort(data.offer, {
            getBrandName: (offer) => offer.brandName,
            getSearchFields: (offer) => [offer.title, offer.brandName],
            getDisplayOrder: (offer) => offer.display_order,
            getAlphabeticalSortField: (offer) => offer.title,
          })
        : [],
    };
  }, [data, searchQuery, selectedBrands, selectedTypes, sortBy]);

  return (
    // Ensure we only trigger `onClose` when the dialog is actually being closed.
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Catalog for {clientName}</DialogTitle>
          {!isLoading && !error && data && (
            <p className="text-muted-foreground text-sm mt-2">
              {data.giftcard.reduce(
                (sum, brand) => sum + brand.items.length,
                0,
              ) + data.offer.length}{" "}
              Total Rewards •{" "}
              {data.giftcard.reduce(
                (sum, brand) => sum + brand.items.length,
                0,
              )}{" "}
              Gift Cards • {data.offer.length} Offers
            </p>
          )}
        </DialogHeader>

        <div className="min-h-[60vh]">
          {isLoading && (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-[60vh] text-red-500">
              Failed to load catalog. Please try again.
            </div>
          )}

          {data && (
            <Tabs defaultValue="catalog" className="w-full">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
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
                <div className="flex items-center gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value: "display_order" | "alphabetical") =>
                      setSortBy(value)
                    }
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="display_order">
                        Sort by display order
                      </SelectItem>
                      <SelectItem value="alphabetical">
                        Sort alphabetically
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <TabsList className="grid w-auto grid-cols-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger value="catalog" className="px-3">
                            <Grid3X3 className="h-4 w-4" />
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Catalog View</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger value="json" className="px-3">
                            <FileText className="h-4 w-4" />
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>JSON View</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="catalog" className="mt-4">
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-6">
                    {/* No results message */}
                    {searchQuery &&
                      filteredData &&
                      filteredData?.giftcard.length === 0 &&
                      filteredData?.offer.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No rewards found matching &quot;{searchQuery}&quot;
                        </div>
                      )}

                    {/* Gift Cards Section */}
                    {filteredData && filteredData?.giftcard.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Gift Cards
                        </h3>
                        <div className="space-y-3">
                          {filteredData?.giftcard.map((brand) => {
                            const allTags = Array.from(
                              new Set(
                                brand.items.flatMap((item) =>
                                  item.tag_name
                                    .split(",")
                                    .map((tag) => tag.trim()),
                                ),
                              ),
                            );
                            const minPoints = Math.min(
                              ...brand.items.map((item) =>
                                parseInt(item.redem_value),
                              ),
                            );
                            const maxPoints = Math.max(
                              ...brand.items.map((item) =>
                                parseInt(item.redem_value),
                              ),
                            );

                            return (
                              <Card key={brand.brand_id}>
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                      <Image
                                        src={brand.images["80w-326ppi"]}
                                        alt={brand.brandName}
                                        width={80}
                                        height={80}
                                        className="rounded-md"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <CardTitle className="text-base">
                                            {brand.brandName}
                                          </CardTitle>
                                          <p className="text-sm text-muted-foreground">
                                            {brand.rewardName}
                                          </p>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                          {allTags.map((tag) => (
                                            <Badge
                                              key={tag}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {tag}
                                            </Badge>
                                          ))}
                                          {Array.from(
                                            new Set(
                                              brand.items.map(
                                                (item) => item.language,
                                              ),
                                            ),
                                          ).map((lang) => (
                                            <Badge
                                              key={lang}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {lang.toUpperCase()}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="flex flex-wrap gap-2">
                                            <TooltipProvider>
                                              {brand.items.map((item) => (
                                                <Tooltip key={item.giftcard_id}>
                                                  <TooltipTrigger>
                                                    <Badge
                                                      variant="secondary"
                                                      className="cursor-pointer"
                                                    >
                                                      ${item.value}
                                                    </Badge>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>
                                                      {parseInt(
                                                        item.redem_value,
                                                      ).toLocaleString()}{" "}
                                                      poynts
                                                    </p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              ))}
                                            </TooltipProvider>
                                          </div>
                                          <span className="text-sm font-medium text-muted-foreground">
                                            {minPoints === maxPoints
                                              ? `${minPoints.toLocaleString()} poynts`
                                              : `${minPoints.toLocaleString()} - ${maxPoints.toLocaleString()} poynts`}
                                          </span>
                                        </div>
                                        <div className="flex-shrink-0">
                                          <SourceCircles
                                            sources={
                                              sourcesMap.get(
                                                brand.items[0]?.cpid,
                                              ) || []
                                            }
                                            isLoading={isLoadingSources}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Offers Section */}
                    {filteredData && filteredData?.offer.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Offers</h3>
                        <div className="space-y-3">
                          {filteredData?.offer.map((offer) => {
                            const tags = offer.tag_name
                              .split(",")
                              .map((tag) => tag.trim());

                            return (
                              <Card key={offer.offer_id}>
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    {offer.imageUrl && (
                                      <div className="flex-shrink-0">
                                        <Image
                                          src={offer.imageUrl}
                                          alt={offer.title}
                                          width={80}
                                          height={80}
                                          className="rounded-md"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <CardTitle className="text-base">
                                            {offer.title}
                                          </CardTitle>
                                          <p className="text-sm text-muted-foreground">
                                            {offer.brandName}
                                          </p>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                          <button
                                            onClick={() => {
                                              setSelectedReward({
                                                type: "offer",
                                                id: offer.offer_id,
                                                name: `${offer.title} - ${offer.brandName}`,
                                                denominations: [offer.value],
                                              });
                                              setTestDialogOpen(true);
                                            }}
                                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mr-2"
                                          >
                                            <FlaskConical className="h-3 w-3 mr-1" />
                                            Test
                                          </button>
                                          {tags.map((tag) => (
                                            <Badge
                                              key={tag}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {tag}
                                            </Badge>
                                          ))}
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {offer.language.toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                      <p className="text-sm mb-2">
                                        {offer.description}
                                      </p>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="default">
                                            ${offer.value}
                                          </Badge>
                                          <span className="text-sm font-medium">
                                            {parseInt(
                                              offer.redem_value,
                                            ).toLocaleString()}{" "}
                                            poynts
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            {offer.inventory_type}
                                          </span>
                                        </div>
                                        <div className="flex-shrink-0">
                                          <SourceCircles
                                            sources={
                                              sourcesMap.get(offer.cpid) || []
                                            }
                                            isLoading={isLoadingSources}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <ScrollArea className="h-[60vh]">
                  <JsonViewer jsonObject={data} />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Run Test Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              This will run a test transaction on the provider&apos;s API like
              an actual transaction through our API for &quot;
              {selectedReward?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            {/* Denomination Selection */}
            <div className="space-y-2">
              <Label htmlFor="denomination">Select Denomination</Label>
              <Select
                value={selectedDenomination}
                onValueChange={setSelectedDenomination}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a denomination" />
                </SelectTrigger>
                <SelectContent>
                  {selectedReward?.denominations.map((denom) => (
                    <SelectItem key={denom} value={denom}>
                      ${denom}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Denomination Input */}
            {selectedDenomination === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customAmount">Custom Amount</Label>
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="Enter custom amount"
                  value={customDenomination}
                  onChange={(e) => setCustomDenomination(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {/* Test Mode Switch */}
            <div className="space-y-2">
              <Label htmlFor="testMode">Transaction Mode</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="testMode"
                  checked={isTestMode}
                  onCheckedChange={setIsTestMode}
                  disabled={true}
                />
                <Label htmlFor="testMode" className="text-sm">
                  {isTestMode ? "Test Mode" : "Live Mode"}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Test only mode is authorized. Live mode is disabled for
                security.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedDenomination("");
                setCustomDenomination("");
                setSelectedReward(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const amount =
                  selectedDenomination === "custom"
                    ? customDenomination
                    : selectedDenomination;
                console.log(`Running test for ${selectedReward?.type}:`, {
                  reward: selectedReward,
                  amount,
                  mode: isTestMode ? "test" : "live",
                });
                setTestDialogOpen(false);
                setSelectedDenomination("");
                setCustomDenomination("");
                setSelectedReward(null);
              }}
              disabled={
                !selectedDenomination ||
                (selectedDenomination === "custom" && !customDenomination)
              }
            >
              Run Test Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
