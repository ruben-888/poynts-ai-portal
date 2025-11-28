import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Ledger } from "../components/ledger-columns";

interface ApiResponse {
  data: Ledger[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

/**
 * Custom hook to fetch ledger entries using React Query
 * @returns Object containing ledger data, loading state, error state, and refetch function
 */
export function useLedgers() {
  const queryClient = useQueryClient();

  const fetchLedgers = async (): Promise<Ledger[]> => {
    try {
      const response = await axios.get<ApiResponse>(
        "/api/legacy/financial/ledger",
      );

      // Check if data exists in the response
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          "Failed to fetch ledger entries: Invalid response format",
        );
      }
    } catch (error) {
      console.error("Error fetching ledger entries:", error);
      throw new Error("Failed to fetch ledger entries");
    }
  };

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ledgers"],
    queryFn: fetchLedgers,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ledgers"] });
  };

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
  };
}
