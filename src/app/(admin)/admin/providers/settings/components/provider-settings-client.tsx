"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, DollarSign, Settings, Activity, Coins, PiggyBank, RefreshCw, Wallet } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils";

// Define the balance type
interface Balance {
  source: string;
  poynts: number;
  money_est: number;
  money_real: number;
  rebate_bank: number;
  rebate_accum: number;
}

// Define the API response type
interface ApiResponse {
  tango_orders: number;
  amazon_orders: number;
  poynts_holding: number;
  poynts_tango: number;
  poynts_amazon: number;
  poynts_blackhawk: number;
  poynts_total: number;
  amazon_money: number;
  tango_money: number;
  blackhawk_money: number;
  amazon_money_est: number;
  tango_money_est: number;
  blackhawk_money_est: number;
  new_format: Balance[];
}

// Function to fetch balances
const fetchBalances = async (): Promise<ApiResponse> => {
  const response = await fetch("/api/legacy/balances");
  if (!response.ok) {
    throw new Error("Failed to fetch balances");
  }
  return response.json();
};

export default function ProvidersSettingsClient() {
  const [providers, setProviders] = useState({
    sourceA: true,
    sourceB: true,
    sourceC: true,
  });

  const [currentRoute, setCurrentRoute] = useState("SOURCE A");
  
  // State to store processed balance data
  const [balanceData, setBalanceData] = useState<Balance[]>([]);
  
  // Dialog state
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<{
    key: keyof typeof providers;
    name: string;
    description: string;
  } | null>(null);

  // Get the query client for invalidating queries
  const queryClient = useQueryClient();

  // Fetch balances using React Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["balances"],
    queryFn: fetchBalances,
  });

  // Process the data when it changes
  useEffect(() => {
    if (data && data.new_format) {
      console.log("API Response:", data);
      // Extract the new_format array from the API response
      setBalanceData(data.new_format);
    }
  }, [data]);

  // Function to handle refresh button click
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["balances"] });
  };

  const handleProviderToggle = (provider: keyof typeof providers) => {
    // If trying to disable a provider, show warning dialog
    if (providers[provider]) {
      const providerInfo = {
        sourceA: { name: "Source A Provider", description: "Primary gift card provider" },
        sourceB: { name: "Source B Provider", description: "Secondary gift card provider" },
        sourceC: { name: "Source C Provider", description: "Tertiary gift card provider" }
      };
      
      setPendingProvider({
        key: provider,
        name: providerInfo[provider].name,
        description: providerInfo[provider].description
      });
      setShowWarningDialog(true);
      return;
    }
    
    // If enabling a provider, allow it immediately
    setProviders(prev => ({
      ...prev,
      [provider]: true
    }));
    
    console.log(`Enabling ${provider}`);
  };

  const confirmProviderDisable = () => {
    if (pendingProvider) {
      setProviders(prev => ({
        ...prev,
        [pendingProvider.key]: false
      }));
      
      console.log(`Disabling ${pendingProvider.key}`);
      
      // Update routing status (placeholder logic)
      if (pendingProvider.key === 'sourceA') {
        setCurrentRoute("SOURCE B");
      }
    }
    
    setShowWarningDialog(false);
    setPendingProvider(null);
  };

  const cancelProviderDisable = () => {
    setShowWarningDialog(false);
    setPendingProvider(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold text-foreground">Provider Management</h1>
          </div>
          <p className="text-lg text-muted-foreground">Monitor real-time balances and control gift card provider routing</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading || isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading || isFetching ? "animate-spin" : ""}`}
          />
          <span className="sr-only">Refresh data</span>
        </Button>
      </div>

      {/* Financial Widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading state
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Loading...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))
        ) : error ? (
          // Error state
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-red-500">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Failed to load balance information. Please try again later.</p>
            </CardContent>
          </Card>
        ) : (
          // Data loaded successfully
          balanceData.map((balance: Balance) => (
            <Card key={balance.source} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded-bl">
                Source {balance.source}
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {/* Provider {balance.source} */}
                </CardTitle>
                {/* <Wallet className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> Est. Money
                    </p>
                    <div className="text-xl font-bold">
                      ${formatNumber(balance.money_est)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> Real Money
                    </p>
                    <div className="text-xl font-bold">
                      ${formatNumber(balance.money_real)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Coins className="h-3 w-3 mr-1" /> Poynts
                    </p>
                    <div className="text-xl font-bold">
                      {formatNumber(balance.poynts)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <PiggyBank className="h-3 w-3 mr-1" /> Rebate Bank
                    </p>
                    <div className="text-xl font-bold">
                      ${formatNumber(balance.rebate_bank)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Provider Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Provider Status Controls
          </CardTitle>
          <CardDescription>
            Enable or disable individual gift card providers. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source A */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Source A Provider</h3>
                  <p className="text-sm text-muted-foreground">Primary gift card provider</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={providers.sourceA ? "default" : "secondary"}>
                    {providers.sourceA ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={providers.sourceA}
                    onCheckedChange={() => handleProviderToggle('sourceA')}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                <div>
                  <span className="font-medium text-muted-foreground">Last Transaction:</span>
                  <div className="font-mono">Dec 17, 2024 2:14 PM</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Transactions (Last Hour):</span>
                  <div className="font-semibold text-green-600">247</div>
                </div>
              </div>
            </div>
          </div>

          {/* Source B */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Source B Provider</h3>
                  <p className="text-sm text-muted-foreground">Secondary gift card provider</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={providers.sourceB ? "default" : "secondary"}>
                    {providers.sourceB ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={providers.sourceB}
                    onCheckedChange={() => handleProviderToggle('sourceB')}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                <div>
                  <span className="font-medium text-muted-foreground">Last Transaction:</span>
                  <div className="font-mono">Dec 17, 2024 2:11 PM</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Transactions (Last Hour):</span>
                  <div className="font-semibold text-green-600">132</div>
                </div>
              </div>
            </div>
          </div>

          {/* Source C */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Source C Provider</h3>
                  <p className="text-sm text-muted-foreground">Tertiary gift card provider</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={providers.sourceC ? "default" : "secondary"}>
                    {providers.sourceC ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={providers.sourceC}
                    onCheckedChange={() => handleProviderToggle('sourceC')}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                <div>
                  <span className="font-medium text-muted-foreground">Last Transaction:</span>
                  <div className="font-mono">Dec 17, 2024 1:58 PM</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Transactions (Last Hour):</span>
                  <div className="font-semibold text-green-600">89</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              WARNING: Disable Provider
            </DialogTitle>
            <DialogDescription className="text-base">
              You are about to disable a critical gift card provider. This action will have immediate effects on your system.
            </DialogDescription>
          </DialogHeader>
          
          {pendingProvider && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  This will disable ALL traffic for gift card orders from {pendingProvider.name}
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  All incoming gift card requests will be redirected away from this provider until it is re-enabled.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Provider Details:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Provider:</span>
                    <div className="text-muted-foreground">{pendingProvider.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <div className="text-muted-foreground">{pendingProvider.description}</div>
                  </div>
                  <div>
                    <span className="font-medium">Current Status:</span>
                    <div className="text-green-600 font-semibold">ENABLED</div>
                  </div>
                  <div>
                    <span className="font-medium">After Change:</span>
                    <div className="text-red-600 font-semibold">DISABLED</div>
                  </div>
                </div>

                {/* Show balance info if available */}
                {balanceData.find(b => b.source.toLowerCase() === pendingProvider.key.replace('source', '').toLowerCase()) && (
                  <div className="mt-4">
                    <h5 className="font-semibold mb-2">Current Balance Information:</h5>
                    {(() => {
                      const balance = balanceData.find(b => b.source.toLowerCase() === pendingProvider.key.replace('source', '').toLowerCase());
                      return balance ? (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>Poynts: <span className="font-mono">{formatNumber(balance.poynts)}</span></div>
                            <div>Real Money: <span className="font-mono">${formatNumber(balance.money_real)}</span></div>
                            <div>Est. Money: <span className="font-mono">${formatNumber(balance.money_est)}</span></div>
                            <div>Rebate Bank: <span className="font-mono">${formatNumber(balance.rebate_bank)}</span></div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                  ⚠️ This change will take effect immediately and may impact active customer transactions.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelProviderDisable}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmProviderDisable}>
              Yes, Disable Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
