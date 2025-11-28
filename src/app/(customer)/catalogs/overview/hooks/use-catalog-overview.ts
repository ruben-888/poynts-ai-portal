import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { GroupedRewardWithCatalogs, RewardsApiResponse, FilterOption, Enterprise } from "../types"
import { useTenant } from "@/components/context/tenant-provider"

// Function to fetch catalog overview data
async function getCatalogOverview(orgId: string): Promise<GroupedRewardWithCatalogs[]> {
  try {
    const response = await axios.get<RewardsApiResponse>(
      `/api/catalogs/overview?org_id=${orgId}`
    );
    
    if (!response.data?.data) {
      throw new Error("Invalid API response format");
    }
    
    return response.data.data;
  } catch (error) {
    console.error("Error fetching catalog overview:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch catalog overview"
    );
  }
}

export function useCatalogOverview() {
  // Get the current viewing organization from context
  const { currentOrgId } = useTenant();

  // Fetch catalog overview data
  const {
    data: rewards,
    isLoading,
    isError,
    error,
  } = useQuery<GroupedRewardWithCatalogs[]>({
    queryKey: ["catalog-overview", currentOrgId],
    queryFn: () => getCatalogOverview(currentOrgId),
  });

  // Filter states
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectedBrandValues, setSelectedBrandValues] = useState<Set<string>>(new Set());
  const [selectedRewardTypes, setSelectedRewardTypes] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Reset the resetting state when no filters are active
  useEffect(() => {
    if (!searchValue && selectedBrandValues.size === 0 && selectedCustomers.size === 0 && selectedRewardTypes.size === 0) {
      setIsResetting(false);
    }
  }, [searchValue, selectedBrandValues, selectedCustomers, selectedRewardTypes]);

  // Extract unique brands from rewards data for facet filter
  const brandOptions = useMemo<FilterOption[]>(() => {
    if (!rewards) return [];
    return Array.from(new Set(rewards.map(reward => reward.brand_name)))
      .filter(Boolean)
      .map((brand) => ({
        value: brand,
        label: brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase(),
      }));
  }, [rewards]);

  // Reward type options for facet filter
  const rewardTypeOptions = useMemo<FilterOption[]>(() => {
    return [
      { value: "giftcard", label: "Gift Cards" },
      { value: "offer", label: "Offers" },
    ];
  }, []);

  // Extract unique enterprises from rewards data for facet filter
  const customerOptions = useMemo<FilterOption[]>(() => {
    if (!rewards) return [];
    const enterpriseMap = new Map<number, string>();
    
    rewards.forEach(reward => {
      reward.catalogs.forEach(catalog => {
        enterpriseMap.set(catalog.enterprise_id, catalog.enterprise_name);
      });
    });
    
    return Array.from(enterpriseMap.entries())
      .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
      .map(([id, name]) => ({
        value: id.toString(),
        label: name,
      }));
  }, [rewards]);

  // Extract all unique enterprises with catalogs from rewards data
  const allEnterprises = useMemo<Enterprise[]>(() => {
    if (!rewards) return [];
    const enterpriseMap = new Map<number, Enterprise>();
    
    rewards.forEach(reward => {
      reward.catalogs.forEach(catalog => {
        enterpriseMap.set(catalog.enterprise_id, {
          id: catalog.enterprise_id,
          name: catalog.enterprise_name,
        });
      });
    });
    
    return Array.from(enterpriseMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rewards]);
  
  const filteredEnterprises = useMemo(() => {
    return allEnterprises.filter(enterprise => 
      selectedCustomers.size === 0 || selectedCustomers.has(enterprise.id.toString())
    );
  }, [allEnterprises, selectedCustomers]);
  
  const filteredRewards = useMemo(() => {
    if (!rewards) return [];
    return rewards.filter(reward => {
      // Brand filter - if no brands selected, show all; if brands selected, only show selected brands
      const matchesBrand = selectedBrandValues.size === 0 || selectedBrandValues.has(reward.brand_name);
      
      // Reward type filter - if no types selected, show all; if types selected, only show selected types
      const matchesType = selectedRewardTypes.size === 0 || selectedRewardTypes.has(reward.type);
      
      // Search filter
      const matchesSearch = searchValue === "" || 
        reward.cpid.toLowerCase().includes(searchValue.toLowerCase()) ||
        reward.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        reward.brand_name.toLowerCase().includes(searchValue.toLowerCase());
      
      return matchesBrand && matchesType && matchesSearch;
    });
  }, [rewards, selectedBrandValues, selectedRewardTypes, searchValue]);

  // Pre-compute catalog lookup map for O(1) access
  const catalogLookupMap = useMemo(() => {
    const map = new Map<string, Map<number, { membership: any; isActive: boolean; value: number; poynts: number; brandName: string }>>();

    filteredRewards.forEach(reward => {
      const rewardMap = new Map<number, { membership: any; isActive: boolean; value: number; poynts: number; brandName: string }>();
      reward.catalogs.forEach(catalog => {
        rewardMap.set(catalog.enterprise_id, {
          membership: catalog,
          isActive: reward.reward_status === 'active',
          value: reward.value,
          poynts: reward.poynts,
          brandName: reward.brand_name,
        });
      });
      map.set(reward.cpid, rewardMap);
    });

    return map;
  }, [filteredRewards]);

  // Group rewards by brand - pre-sorted
  const groupedRewards = useMemo(() => {
    const groups: Record<string, GroupedRewardWithCatalogs[]> = {};
    filteredRewards.forEach(reward => {
      if (!groups[reward.brand_name]) {
        groups[reward.brand_name] = [];
      }
      groups[reward.brand_name].push(reward);
    });

    // Pre-sort brands and convert to array for stable rendering
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([brandName, rewards]) => ({
        brandName,
        rewards,
      }));
  }, [filteredRewards]);

  // Reset function
  const resetFilters = () => {
    setIsResetting(true);
    setSearchValue("");
    setSelectedBrandValues(new Set());
    setSelectedRewardTypes(new Set());
    setSelectedCustomers(new Set());
  };

  return {
    // Data
    rewards,
    isLoading,
    isError,
    error,
    filteredRewards,
    groupedRewards,
    allEnterprises,
    filteredEnterprises,
    catalogLookupMap,

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
  };
}
