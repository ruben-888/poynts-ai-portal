"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Download, CheckCircle, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { downloadTableAsCSV } from "@/lib/utils"
import { FacetFilter } from "./facet-filter"
import { useCatalogOverview } from "../hooks/use-catalog-overview"


export function OverviewClient() {
  const {
    // Data
    rewards,
    isLoading,
    isError,
    error,
    filteredRewards,
    groupedRewards,
    filteredEnterprises,
    catalogLookupMap,
    allEnterprises,

    // Filter options
    brandOptions,
    rewardTypeOptions,
    customerOptions,

    // Filter states
    selectedCustomers,
    setSelectedCustomers,
    selectedBrandValues,
    setSelectedBrandValues,
    selectedRewardTypes,
    setSelectedRewardTypes,
    searchValue,
    setSearchValue,
    isResetting,

    // Actions
    resetFilters,
  } = useCatalogOverview();

  // CSV Export function
  const handleCSVExport = () => {
    if (!rewards || !allEnterprises.length) return;
    
    // Create CSV data structure
    const csvData = filteredRewards.map(reward => {
      const row: Record<string, string | number> = {
        "CPID": reward.cpid,
        "Title": reward.title,
        "Brand": reward.brand_name,
        "Type": reward.type === "giftcard" ? "Gift Card" : "Offer",
        "Status": reward.reward_status,
        "Value": reward.value,
        "Points": reward.poynts,
      };
      
      // Add enterprise columns with 1/0 values
      filteredEnterprises.forEach(enterprise => {
        const isInCatalog = reward.catalogs.some(
          catalog => catalog.enterprise_id === enterprise.id && reward.reward_status === 'active'
        );
        row[enterprise.name] = isInCatalog ? 1 : 0;
      });
      
      return row;
    });
    
    // Create column definitions for CSV export
    const columns = [
      { accessorKey: "CPID", header: "CPID" },
      { accessorKey: "Title", header: "Title" },
      { accessorKey: "Brand", header: "Brand" },
      { accessorKey: "Type", header: "Type" },
      { accessorKey: "Status", header: "Status" },
      { accessorKey: "Value", header: "Value" },
      { accessorKey: "Points", header: "Points" },
      ...filteredEnterprises.map(enterprise => ({
        accessorKey: enterprise.name,
        header: enterprise.name,
      })),
    ];
    
    downloadTableAsCSV(csvData, columns, "catalog-overview");
  };

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {error?.message}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">Catalog Overview</h2>
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            Compare reward availability across different customer catalogs
          </p>
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <>
          {/* Skeleton Toolbar */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-64" /> {/* Search input */}
              <Skeleton className="h-8 w-20" />  {/* Brands filter */}
              <Skeleton className="h-8 w-16" />  {/* Type filter */}
              <Skeleton className="h-8 w-24" />  {/* Customers filter */}
            </div>
            <Skeleton className="h-8 w-28" />    {/* Export button */}
          </div>
          
          {/* Skeleton Table */}
          <div className="flex-1 rounded-lg border overflow-hidden">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 border-r w-[255px] min-w-[255px] max-w-[255px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] bg-background">
                      Reward Name
                    </TableHead>
                    {/* Skeleton column headers */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <TableHead key={i} className="text-center min-w-[140px] bg-background">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Skeleton rows */}
                  {Array.from({ length: 15 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="sticky left-0 z-20 border-r font-medium w-[255px] min-w-[255px] max-w-[255px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] bg-background">
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      {Array.from({ length: 8 }).map((_, colIndex) => (
                        <TableCell key={colIndex} className="text-center min-w-[140px]">
                          <div className="flex justify-center">
                            <Skeleton className="h-5 w-5 rounded-full" />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Toolbar similar to DataTable */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rewards..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-8"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchValue("")}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FacetFilter
                title="Brands"
                options={brandOptions}
                selectedValues={selectedBrandValues}
                onChange={setSelectedBrandValues}
              />
              <FacetFilter
                title="Type"
                options={rewardTypeOptions}
                selectedValues={selectedRewardTypes}
                onChange={setSelectedRewardTypes}
              />
              <FacetFilter
                title="Customers"
                options={customerOptions}
                selectedValues={selectedCustomers}
                onChange={setSelectedCustomers}
              />
              {(searchValue || selectedBrandValues.size > 0 || selectedRewardTypes.size > 0 || selectedCustomers.size > 0) && !isResetting && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-muted-foreground hover:text-foreground"
                  onClick={resetFilters}
                >
                  Reset <X className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={handleCSVExport}
                disabled={!rewards || filteredRewards.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Scrollable table container */}
          <div className="flex-1 rounded-lg border overflow-hidden">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead 
                      className="sticky left-0 z-20 border-r w-[255px] min-w-[255px] max-w-[255px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] bg-background"
                    >
                      Reward Name
                    </TableHead>
                    {filteredEnterprises.map((enterprise) => (
                      <TableHead 
                        key={enterprise.id} 
                        className="text-center min-w-[140px] bg-background"
                      >
                        {enterprise.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedRewards.flatMap(({ brandName, rewards: brandRewards }) => [
                    // Brand header row
                    <TableRow key={`brand-${brandName}`} className="bg-muted hover:bg-muted">
                      <TableCell
                        colSpan={filteredEnterprises.length + 1}
                        className="sticky left-0 z-20 bg-muted border-r font-semibold py-1 w-[255px] min-w-[255px] max-w-[255px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                      >
                        {brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase()}
                      </TableCell>
                    </TableRow>,
                    // Rewards under this brand
                    ...brandRewards.map((reward, index) => (
                      <TableRow key={`${brandName}-${reward.cpid}-${index}`}>
                        <TableCell
                          className="sticky left-0 z-20 border-r font-medium w-[255px] min-w-[255px] max-w-[255px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] bg-background"
                        >
                          {reward.cpid}
                        </TableCell>
                        {filteredEnterprises.map((enterprise) => {
                          // Use pre-computed lookup map for O(1) access
                          const catalogData = catalogLookupMap.get(reward.cpid)?.get(enterprise.id);

                          return (
                            <TableCell
                              key={enterprise.id}
                              className="text-center min-w-[140px]"
                            >
                              <div className="flex justify-center">
                                {catalogData ? (
                                  catalogData.isActive ? (
                                    <HoverCard>
                                      <HoverCardTrigger asChild>
                                        <CheckCircle className="h-5 w-5 text-green-600 cursor-pointer" />
                                      </HoverCardTrigger>
                                      <HoverCardContent className="w-48" side="top">
                                        <div className="space-y-2">
                                          <h4 className="text-sm font-semibold">{catalogData.brandName}</h4>
                                          <div className="text-sm text-muted-foreground">
                                            <div className="flex justify-between">
                                              <span>Value:</span>
                                              <span>${catalogData.value}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Poynts:</span>
                                              <span>{catalogData.poynts.toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  ) : (
                                    <span className="text-muted-foreground text-xl">—</span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground text-xl">—</span>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ])}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
