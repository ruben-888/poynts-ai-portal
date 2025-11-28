import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { JournalEntry } from "../types";

interface ApiResponse {
  success: boolean;
  data: JournalEntry[];
  count: number;
  timestamp: string;
  error?: string;
}

export function useJournalEntries() {
  const [data, setData] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJournalEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>(
        "/api/legacy/financial/journal-entries",
      );
      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(
          response.data.error || "Failed to fetch journal entries",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);

  const mutate = useCallback(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
