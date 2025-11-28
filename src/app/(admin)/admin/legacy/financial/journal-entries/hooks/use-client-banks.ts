"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Define the bank interface based on the API response
export interface ClientBank {
  id: number;
  name: string;
  provider: {
    id: number;
    name: string;
    code: string;
  } | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success?: boolean;
  data?: ClientBank[];
  error?: string;
}

/**
 * Hook to fetch a list of all client banks
 */
export function useClientBanks() {
  const [data, setData] = useState<ClientBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClientBanks = useCallback(async () => {
    try {
      setIsLoading(true);
      // Using the endpoint provided in the requirements
      const response = await axios.get<ClientBank[]>(
        "/api/legacy/financial/client_banks",
      );

      // The API returns the array directly without a wrapper object
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("An error occurred fetching client banks"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientBanks();
  }, [fetchClientBanks]);

  const mutate = useCallback(() => {
    fetchClientBanks();
  }, [fetchClientBanks]);

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single client bank by ID
 * @param id - The ID of the client bank to fetch
 */
export function useClientBank(id: string | number) {
  const [data, setData] = useState<ClientBank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClientBank = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch all client banks and find the one with the matching ID
      const response = await axios.get<ClientBank[]>(
        "/api/legacy/financial/client_banks",
      );

      const bank = response.data.find((bank) => bank.id === Number(id));

      if (bank) {
        setData(bank);
      } else {
        setError(new Error(`Client bank with ID ${id} not found`));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`An error occurred fetching client bank with ID ${id}`),
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientBank();
  }, [fetchClientBank]);

  return {
    data,
    isLoading,
    error,
  };
}
