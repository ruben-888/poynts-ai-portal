"use client";

import * as React from "react";
import { GiftCardBrand, GiftCard, GiftCardItem, CreateGiftCardResponse } from "./giftcards-client";
import { GiftCardAction } from "../hooks/use-gift-cards";
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
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  FileText,
  Scale,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
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
import { AvailableGiftCards } from "./available-gift-cards";
import { GiftCardDenominations } from "./gift-card-denominations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Transaction {
  id: number;
  result: string | null;
  date: string | null;
  offerId: number | null;
  giftcardId: number | null;
  cpid: string | null;
  rewardType: string | null;
  mode: string | null;
  entityType: string | null;
  entid: number | null;
  memberid: number | null;
  poynts: number | null;
  orderAmount: number | null;
  providerReferenceId: string | null;
  providerId: number | null;
  rewardName: string | null;
  providerRewardId: string | null;
  rebateCustomerAmount: number | null;
  cpTransactionReference: string | null;
  custTransactionReference: string | null;
  message: string | null;
  cpidx: string | null;
  source: string | null;
}

interface TransactionResponse {
  success: boolean;
  data: Transaction[];
}

interface ManageGiftCardProps {
  availableBrands: GiftCardBrand[];
  isEditOpen: boolean;
  setIsEditOpen: (isOpen: boolean) => void;
  selectedGiftCard: GiftCard | null;
  onRefresh?: () => void;
  onGiftCardChange?: (action: GiftCardAction) => void;
}

interface NewGiftCardData {
  value: number;
  poyntsValue: number;
  language: string;
  tags: string[];
  cpidx: string;
}

const giftCardSettings = {
  nav: [
    { name: "General", icon: Info },
    { name: "Cards", icon: CreditCard },
    { name: "Provider", icon: Building },
    { name: "Rebate Values", icon: Tag },
    { name: "Description", icon: FileText },
    { name: "Legal", icon: Scale },
    { name: "Recent Transactions", icon: ShoppingCart },
    { name: "Activity", icon: Clock, disabled: true },
  ],
  adminNav: [{ name: "Settings", icon: Settings }],
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
    status: "Processing",
  },
];

const recentActivity = [
  {
    id: "ACT-001",
    timestamp: "2024-03-15 14:30:00",
    event: "Inventory Updated",
    description: "Inventory increased by 100 units",
    actor: "System",
    severity: "info",
  },
  {
    id: "ACT-002",
    timestamp: "2024-03-15 10:15:00",
    event: "Status Change",
    description: "Gift card status changed to inactive",
    actor: "Admin User",
    severity: "warning",
  },
];

const SIDEBAR_ITEMS = [
  { id: "details", label: "Details" },
  { id: "gift-cards", label: "Gift Cards" },
  { id: "rebates", label: "Rebates" },
] as const;

type SidebarItem = (typeof SIDEBAR_ITEMS)[number]["id"];

// Tags functionality temporarily removed
// const PREDEFINED_TAGS = [
//   "Eat_Well",
//   "Rest_Well",
//   "Shop_Well",
//   "Live_Well",
//   "Gear_Up",
//   "Travel",
//   "Entertainment",
//   "Food_Delivery",
//   "Retail",
//   "Other"
// ] as const;

export function ManageGiftCard({
  availableBrands,
  isEditOpen,
  setIsEditOpen,
  selectedGiftCard,
  onRefresh,
  onGiftCardChange,
}: ManageGiftCardProps) {
  const [activeTab, setActiveTab] = React.useState("General");
  const [previousTab, setPreviousTab] = React.useState<string>("General");
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(
    null,
  );
  // Tags functionality temporarily removed
  // const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  // const [isTagInputOpen, setIsTagInputOpen] = React.useState(false)
  const [isProviderRebateEnabled, setIsProviderRebateEnabled] =
    React.useState(false);
  const [isCpidEnabled, setIsCpidEnabled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"edit" | "create">("edit");
  const [brandValue, setBrandValue] = React.useState<string>("");
  const [brandTagValue, setBrandTagValue] = React.useState<string>("");
  const [statusValue, setStatusValue] = React.useState<string>("");
  const [isGeneralFormChanged, setIsGeneralFormChanged] = React.useState(false);
  const [isRebateFormChanged, setIsRebateFormChanged] = React.useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [rebateValues, setRebateValues] = React.useState({
    providerPercentage: 0,
    basePercentage: 0,
    customerPercentage: 0,
    cpPercentage: 0,
  });
  const [formValues, setFormValues] = React.useState({
    value: "",
    poyntsValue: "",
    language: "EN",
  });
  const [isFormValid, setIsFormValid] = React.useState(false);
  const [valueError, setValueError] = React.useState<string | null>(null);
  const [poyntsError, setPoyntsError] = React.useState<string | null>(null);
  const [cpidError, setCpidError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Content tab state
  const [contentValues, setContentValues] = React.useState({
    description: "",
    shortDescription: "",
  });
  const [isContentFormChanged, setIsContentFormChanged] = React.useState(false);
  const [isSavingContent, setIsSavingContent] = React.useState(false);

  // Legal tab state
  const [legalValues, setLegalValues] = React.useState({
    terms: "",
    disclaimer: "",
  });
  const [isLegalFormChanged, setIsLegalFormChanged] = React.useState(false);
  const [isSavingLegal, setIsSavingLegal] = React.useState(false);

  const router = useRouter();

  // Add transaction query
  const { data: transactionData, isLoading: isLoadingTransactions } =
    useQuery<TransactionResponse>({
      queryKey: ["transactions", selectedGiftCard?.id],
      queryFn: async () => {
        if (!selectedGiftCard?.id) {
          return {
            success: true,
            data: [],
          };
        }

        try {
          const response = await fetch(
            `/api/legacy/transactions?reward_item_id=${selectedGiftCard.id}`,
          );
          if (!response.ok) {
            throw new Error("Failed to fetch transactions");
          }
          return await response.json();
        } catch (error) {
          console.error("Error fetching transactions:", error);
          return {
            success: false,
            data: [],
          };
        }
      },
      enabled: activeTab === "Recent Transactions" && !!selectedGiftCard?.id,
    });

  // Initialize form values when selectedGiftCard changes
  React.useEffect(() => {
    if (selectedGiftCard) {
      setBrandValue(selectedGiftCard.brand?.id?.toString() || "");
      setBrandTagValue(selectedGiftCard.brand?.brandTag || "");
      setStatusValue(selectedGiftCard.status || "");
      setIsGeneralFormChanged(false);

      // Initialize rebate values
      setRebateValues({
        providerPercentage:
          Number(selectedGiftCard.rebateInfo.providerPercentage || 0) * 100,
        basePercentage:
          Number(selectedGiftCard.rebateInfo.basePercentage || 0) * 100,
        customerPercentage:
          Number(selectedGiftCard.rebateInfo.customerPercentage || 0) * 100,
        cpPercentage:
          Number(selectedGiftCard.rebateInfo.cpPercentage || 0) * 100,
      });
      setIsRebateFormChanged(false);

      // Initialize content values from brand data
      setContentValues({
        description: selectedGiftCard.brand?.description || "",
        shortDescription: selectedGiftCard.brand?.shortDescription || "",
      });
      setIsContentFormChanged(false);

      // Initialize legal values from brand data
      setLegalValues({
        terms: selectedGiftCard.brand?.terms || "",
        disclaimer: selectedGiftCard.brand?.disclaimer || "",
      });
      setIsLegalFormChanged(false);
    }
  }, [selectedGiftCard]);

  // Check if general form has changed
  React.useEffect(() => {
    if (selectedGiftCard) {
      const originalBrand = selectedGiftCard.brand?.id?.toString() || "";
      const originalBrandTag = selectedGiftCard.brand?.brandTag || "";
      const originalStatus = selectedGiftCard.status || "";

      setIsGeneralFormChanged(
        (brandValue !== "" && brandValue !== originalBrand) ||
          brandTagValue !== originalBrandTag ||
          (statusValue !== "" && statusValue !== originalStatus),
      );
    }
  }, [brandValue, brandTagValue, statusValue, selectedGiftCard]);

  // Check if form is valid
  React.useEffect(() => {
    if (mode === "create") {
      const { value, poyntsValue, language } = formValues;
      const valueNum = parseFloat(value);
      const poyntsNum = parseInt(poyntsValue);

      // Check if value is within the min/max range of the selected gift card
      const minValue = selectedGiftCard?.minValue ?? 0;
      const maxValue = selectedGiftCard?.maxValue ?? Infinity;
      const isValueInRange =
        !isNaN(valueNum) && valueNum >= minValue && valueNum <= maxValue;

      // Set error message if value is out of range
      if (value !== "" && !isNaN(valueNum)) {
        if (valueNum < minValue) {
          setValueError(`Value must be at least $${minValue.toFixed(2)}`);
        } else if (valueNum > maxValue && maxValue !== Infinity) {
          setValueError(`Value cannot exceed $${maxValue.toFixed(2)}`);
        } else {
          setValueError(null);
        }
      } else if (value === "") {
        setValueError(null);
      } else {
        setValueError("Please enter a valid number");
      }

      const isValid =
        value !== "" &&
        !isNaN(valueNum) &&
        valueNum > 0 &&
        isValueInRange &&
        poyntsValue !== "" &&
        !isNaN(poyntsNum) &&
        poyntsNum >= 0 &&
        language !== "";

      setIsFormValid(isValid);
    }
  }, [formValues, mode, selectedGiftCard]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!selectedGiftCard && mode === "edit") return null;

  const handleCardSelect = (cardId: number, sourceTab: string) => {
    const card = selectedGiftCard?.giftCards.items.find(
      (item: GiftCardItem) => item.id === cardId,
    );
    setSelectedCardId(cardId.toString());
    // Tags functionality temporarily removed
    // setSelectedTags(card?.tags?.length ? [...card.tags] : [])
    setPreviousTab(sourceTab);
    setActiveTab("Cards");
    setMode("edit");
    setValueError(null);

    // Initialize form values when editing an existing card
    if (card) {
      setFormValues({
        value: card.value?.toString() || "",
        poyntsValue: card.poyntsValue?.toString() || "",
        language: card.language || "EN",
      });
      setIsFormValid(true); // Existing cards are considered valid
    }
  };

  const handleCreateNewCard = () => {
    // Prevent creating new cards for Fixed Value gift cards
    if (selectedGiftCard?.valueType !== "VARIABLE_VALUE") {
      return;
    }

    setSelectedCardId(null);
    // Tags functionality temporarily removed
    // setSelectedTags([])
    setPreviousTab("Cards"); // Set previous tab to Cards so we return to Cards grid view
    setMode("create");
    setActiveTab("Cards");
    setValueError(null);
    // Reset form values when creating a new card
    setFormValues({
      value: "",
      poyntsValue: "",
      language: "EN",
    });
    setIsFormValid(false);
  };

  const handleBackToList = () => {
    setSelectedCardId(null);
    // Tags functionality temporarily removed
    // setSelectedTags([])
    setActiveTab(previousTab);
    setIsCpidEnabled(false);
    if (mode === "create") {
      setMode("edit");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedGiftCard?.id) {
      console.error("No gift card item selected");
      return;
    }

    if (!selectedGiftCard?.brand?.id) {
      console.error("Brand information is missing");
      toast.error("Error: Brand information is missing. Please select a valid gift card.");
      return;
    }

    const cardData: NewGiftCardData = {
      value: Number(formValues.value),
      poyntsValue: Number(formValues.poyntsValue),
      language: formValues.language,
      // Tags functionality temporarily removed
      tags: [], // Keeping empty array to maintain interface compatibility
      cpidx: (document.getElementById("cpid") as HTMLInputElement)?.value || "",
    };

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create new gift card instance
        const payload = {
          brand_id: selectedGiftCard.brand.id,
          item_id: selectedGiftCard.id,
          cpid: cardData.cpidx,
          language: cardData.language,
          value: cardData.value,
          poynts: cardData.poyntsValue,
          reward_status: "active",
          inventory_type: "unlimited",
          inventory_remaining: 0,
          tags: cardData.tags.join(",") || "",
          priority: 1,
        };

        const response = await fetch("/api/rewards/giftcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = "Failed to create gift card";
          try {
            const errorData = await response.json();
            
            // Handle validation errors
            if (response.status === 400 && errorData.validationErrors) {
              // Clear previous errors
              setValueError(null);
              setPoyntsError(null);
              setCpidError(null);
              
              // Set specific field errors
              errorData.validationErrors.forEach((error: any) => {
                if (error.field === 'value') {
                  setValueError(error.message);
                } else if (error.field === 'poynts') {
                  setPoyntsError(error.message);
                } else if (error.field === 'cpid') {
                  setCpidError(error.message);
                }
              });
              
              // Don't throw, just return to show inline errors
              setIsSubmitting(false);
              return;
            }
            
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // If we can't parse the error response, use a generic message
            errorMessage = `Request failed with status ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        // Get the response data to update local state
        const responseData = await response.json();
        const newCardData: CreateGiftCardResponse = responseData.data;
        console.log("Gift card created successfully", newCardData);
        
        // Clear any validation errors on success
        setValueError(null);
        setPoyntsError(null);
        setCpidError(null);
        
        // Reset the form
        setFormValues({
          value: "",
          poyntsValue: "",
          language: "EN",
        });
        
        // Return to originating tab grid view
        setSelectedCardId(null);
        setMode("edit");
        setActiveTab(previousTab);
        
        // Update local state smoothly without full refresh
        if (onGiftCardChange) {
          onGiftCardChange({ type: 'create', data: newCardData });
        } else if (onRefresh) {
          // Fallback to refresh if smooth update callback is not available
          onRefresh();
        } else {
          // Last resort fallback to page refresh
          router.refresh();
        }
      } else {
        // Update existing gift card instance
        if (!selectedCardId) {
          console.error("No card selected for update");
          return;
        }

        const updatePayload = {
          value: cardData.value,
          poynts: cardData.poyntsValue,
          language: cardData.language,
          cpidx: cardData.cpidx,
          tags: cardData.tags.join(",") || "",
        };

        console.log("Updating card:", selectedCardId, updatePayload);

        const response = await fetch(`/api/rewards/giftcards/${selectedCardId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update gift card");
        }

        const updatedData = await response.json();
        
        toast.success("Gift card updated successfully");

        // Return to originating tab grid view (similar to after creating/deleting)
        setSelectedCardId(null);
        setMode("edit");
        setActiveTab(previousTab);

        // Update local state to reflect the changes
        if (onGiftCardChange) {
          onGiftCardChange({ 
            type: 'update', 
            id: parseInt(selectedCardId), 
            data: {
              value: cardData.value,
              poyntsValue: cardData.poyntsValue,
              language: cardData.language,
              cpidx: cardData.cpidx,
              tags: cardData.tags,
            }
          });
        }
      }
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save gift card"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tags functionality temporarily removed
  // const handleAddTag = (tag: string) => {
  //   if (!selectedTags.includes(tag)) {
  //     setSelectedTags(prevTags => [...prevTags, tag])
  //   }
  //   setIsTagInputOpen(false)
  // }

  // const handleRemoveTag = (tagToRemove: string) => {
  //   setSelectedTags(prevTags => prevTags.filter(tag => tag !== tagToRemove))
  // }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRebateInputChange = (field: string, value: string) => {
    const numValue = Number(value);
    setRebateValues((prev) => ({
      ...prev,
      [field]: numValue,
    }));

    // Check if any rebate value has changed
    if (selectedGiftCard) {
      const originalValues = {
        providerPercentage:
          Number(selectedGiftCard.rebateInfo.providerPercentage || 0) * 100,
        basePercentage:
          Number(selectedGiftCard.rebateInfo.basePercentage || 0) * 100,
        customerPercentage:
          Number(selectedGiftCard.rebateInfo.customerPercentage || 0) * 100,
        cpPercentage:
          Number(selectedGiftCard.rebateInfo.cpPercentage || 0) * 100,
      };

      const updatedValues = {
        ...rebateValues,
        [field]: numValue,
      };

      const hasChanged =
        originalValues.providerPercentage !==
          updatedValues.providerPercentage ||
        originalValues.basePercentage !== updatedValues.basePercentage ||
        originalValues.customerPercentage !==
          updatedValues.customerPercentage ||
        originalValues.cpPercentage !== updatedValues.cpPercentage;

      setIsRebateFormChanged(hasChanged);
    }
  };

  const handleContentInputChange = (field: string, value: string) => {
    setContentValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check if any content value has changed
    if (selectedGiftCard) {
      const originalValues = {
        description: selectedGiftCard.brand?.description || "",
        shortDescription: selectedGiftCard.brand?.shortDescription || "",
      };

      const updatedValues = {
        ...contentValues,
        [field]: value,
      };

      const hasChanged =
        originalValues.description !== updatedValues.description ||
        originalValues.shortDescription !== updatedValues.shortDescription;

      setIsContentFormChanged(hasChanged);
    }
  };

  const handleLegalInputChange = (field: string, value: string) => {
    setLegalValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check if any legal value has changed
    if (selectedGiftCard) {
      const originalValues = {
        terms: selectedGiftCard.brand?.terms || "",
        disclaimer: selectedGiftCard.brand?.disclaimer || "",
      };

      const updatedValues = {
        ...legalValues,
        [field]: value,
      };

      const hasChanged =
        originalValues.terms !== updatedValues.terms ||
        originalValues.disclaimer !== updatedValues.disclaimer;

      setIsLegalFormChanged(hasChanged);
    }
  };

  const handleDeleteGiftCard = async () => {
    if (!selectedCardId) {
      toast.error("No gift card selected for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rewards/giftcards/${selectedCardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete gift card");
      }

      // Close the delete confirmation dialog first
      setShowDeleteDialog(false);
      
      // Return to Cards tab grid view (similar to after creating a gift card)
      const deletedCardId = parseInt(selectedCardId || "0");
      setSelectedCardId(null);
      setMode("edit");
      setActiveTab(previousTab);
      
      // Update local state to remove the deleted card
      if (onGiftCardChange && deletedCardId) {
        onGiftCardChange({ type: 'delete', id: deletedCardId });
      }
      
      // Show success message
      toast.success("Gift card deleted successfully");
    } catch (error) {
      console.error("Error deleting gift card:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete gift card"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    // Don't render content for disabled tabs
    const isTabDisabled = giftCardSettings.nav.find(
      (item) => item.name === activeTab,
    )?.disabled;

    if (isTabDisabled) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Activity Tracking Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md">
            The activity tracking feature is currently under development and
            will be available in a future update.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "General":
        return (
          <div className="space-y-8">
            <div className="flex gap-8">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand Name</Label>
                  <Select
                    defaultValue={selectedGiftCard?.brand?.id?.toString() || ""}
                    onValueChange={(value) => setBrandValue(value)}
                  >
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...availableBrands]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                          >
                            {brand.name} ({brand.id})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_tag">Brand Tag</Label>
                  <Input
                    id="brand_tag"
                    value={brandTagValue}
                    onChange={(e) => setBrandTagValue(e.target.value)}
                    placeholder="Enter brand tag..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    defaultValue={selectedGiftCard?.status}
                    onValueChange={(value) => setStatusValue(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button
                    type="button"
                    disabled={!isGeneralFormChanged || isSavingGeneral}
                    onClick={async () => {
                      setIsSavingGeneral(true);

                      try {
                        const originalStatus = selectedGiftCard?.status || "";
                        const originalBrandTag = selectedGiftCard?.brand?.brandTag || "";
                        const hasStatusChanged = statusValue !== "" && statusValue !== originalStatus;
                        const hasBrandTagChanged = brandTagValue !== originalBrandTag;

                        // Update status if it changed
                        if (hasStatusChanged) {
                          if (!selectedGiftCard?.id || !statusValue) {
                            toast.error("No status selected to save");
                            setIsSavingGeneral(false);
                            return;
                          }

                          const response = await fetch(`/api/legacy/giftcard-items/${selectedGiftCard.id}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              status: statusValue,
                            }),
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Failed to update gift card status");
                          }
                        }

                        // Update brand tag if it changed
                        if (hasBrandTagChanged) {
                          if (!selectedGiftCard?.brand?.id) {
                            toast.error("No brand associated with this gift card");
                            setIsSavingGeneral(false);
                            return;
                          }

                          const response = await fetch(`/api/rewards/brands/${selectedGiftCard.brand.id}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              brandTag: brandTagValue,
                            }),
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Failed to update brand tag");
                          }
                        }

                        toast.success("Changes saved successfully");

                        // Update local state with saved values
                        if (onGiftCardChange && selectedGiftCard) {
                          onGiftCardChange({
                            type: 'update',
                            id: selectedGiftCard.id,
                            data: {
                              status: hasStatusChanged ? statusValue : selectedGiftCard.status,
                              brand: hasBrandTagChanged && selectedGiftCard.brand ? {
                                ...selectedGiftCard.brand,
                                brandTag: brandTagValue,
                              } : selectedGiftCard.brand,
                            }
                          });
                        }

                        // Reset form state
                        setIsGeneralFormChanged(false);

                        // No need to refresh - keeps popup open and preserves filters
                      } catch (error) {
                        console.error("Error updating general settings:", error);
                        toast.error(error instanceof Error ? error.message : "Failed to update general settings");
                      } finally {
                        setIsSavingGeneral(false);
                      }
                    }}
                  >
                    {isSavingGeneral ? (
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
              <div className="w-72 shrink-0">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6">
                    {selectedGiftCard?.brand?.imageUrls && 
                     selectedGiftCard.brand.imageUrls["300w-326ppi"] &&
                     typeof selectedGiftCard.brand.imageUrls["300w-326ppi"] === 'string' && (
                      <Image
                        src={selectedGiftCard.brand.imageUrls["300w-326ppi"]}
                        alt="Gift Card Preview"
                        width={300}
                        height={200}
                        className="w-full rounded-lg"
                      />
                    )}
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      Gift Card Preview
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            {selectedGiftCard?.giftCards.items && (
              <GiftCardDenominations
                giftCards={selectedGiftCard.giftCards.items}
                onCardSelect={(cardId) => handleCardSelect(cardId, "General")}
                onViewDetails={() => setActiveTab("Cards")}
              />
            )}
          </div>
        );
      case "Provider":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-[320px_1fr] gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Provider
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-medium">
                      {selectedGiftCard?.provider?.name} (
                      {selectedGiftCard?.provider?.code || "N/A"})
                    </div>
                    <Badge
                      variant={
                        selectedGiftCard?.provider?.status === "active"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedGiftCard?.provider?.status || "N/A"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Value Type
                  </Label>
                  <div className="text-lg font-medium">
                    {selectedGiftCard?.valueType === "FIXED_VALUE"
                      ? "Fixed Value"
                      : "Variable Value"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Reward Status
                  </Label>
                  <div className="text-lg font-medium">
                    {selectedGiftCard?.rewardStatus || "N/A"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Rebate Amount
                  </Label>
                  <div className="text-lg font-medium">
                    {(
                      Number(
                        selectedGiftCard?.rebateInfo?.providerPercentage || 0,
                      ) * 100
                    ).toFixed(2)}
                    %
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">UTID</Label>
                  <div className="text-lg font-medium">
                    {selectedGiftCard?.providerRewardId || "N/A"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Min Value
                  </Label>
                  <div className="text-lg font-medium">
                    {selectedGiftCard?.minValue
                      ? `$${selectedGiftCard.minValue}`
                      : "N/A"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Max Value
                  </Label>
                  <div className="text-lg font-medium">
                    {selectedGiftCard?.maxValue
                      ? `$${selectedGiftCard.maxValue}`
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Redemption Instructions
                </Label>
                <div className="rounded-lg border bg-muted/10 p-4 text-sm max-h-[500px] overflow-y-auto overflow-x-hidden">
                  {selectedGiftCard?.redemptionInstructions ? (
                    <div
                      className="break-words whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: selectedGiftCard.redemptionInstructions,
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground">No redemption instructions available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "Description":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content & Instructions</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <textarea
                    id="short_description"
                    value={contentValues.shortDescription}
                    onChange={(e) => handleContentInputChange("shortDescription", e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Brief description of the gift card..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_description">Description</Label>
                  <textarea
                    id="long_description"
                    value={contentValues.description}
                    onChange={(e) => handleContentInputChange("description", e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Detailed description of the gift card..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <Button
                variant="default"
                size="default"
                disabled={isSavingContent || !isContentFormChanged}
                onClick={async () => {
                  if (!selectedGiftCard?.brand?.id) {
                    toast.error("No brand selected");
                    return;
                  }

                  setIsSavingContent(true);

                  try {
                    const response = await fetch(`/api/rewards/brands/${selectedGiftCard.brand.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        description: contentValues.description,
                        shortDescription: contentValues.shortDescription,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || "Failed to update brand content");
                    }

                    toast.success("Brand content updated successfully");
                    setIsContentFormChanged(false);

                    // No need to refresh - brand description fields don't affect the grid display
                  } catch (error) {
                    console.error("Error updating brand content:", error);
                    toast.error(error instanceof Error ? error.message : "Failed to update brand content");
                  } finally {
                    setIsSavingContent(false);
                  }
                }}
              >
                {isSavingContent ? (
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
      case "Legal":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Legal Information
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms</Label>
                  <textarea
                    id="terms"
                    value={legalValues.terms}
                    onChange={(e) => handleLegalInputChange("terms", e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Terms and conditions..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disclaimer">Disclaimer</Label>
                  <textarea
                    id="disclaimer"
                    value={legalValues.disclaimer}
                    onChange={(e) => handleLegalInputChange("disclaimer", e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Legal disclaimers..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <Button
                variant="default"
                size="default"
                disabled={isSavingLegal || !isLegalFormChanged}
                onClick={async () => {
                  if (!selectedGiftCard?.brand?.id) {
                    toast.error("No brand selected");
                    return;
                  }

                  setIsSavingLegal(true);

                  try {
                    const response = await fetch(`/api/rewards/brands/${selectedGiftCard.brand.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        terms: legalValues.terms,
                        disclaimer: legalValues.disclaimer,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || "Failed to update brand legal information");
                    }

                    toast.success("Brand legal information updated successfully");
                    setIsLegalFormChanged(false);

                    // No need to refresh - brand legal fields don't affect the grid display
                  } catch (error) {
                    console.error("Error updating brand legal information:", error);
                    toast.error(error instanceof Error ? error.message : "Failed to update brand legal information");
                  } finally {
                    setIsSavingLegal(false);
                  }
                }}
              >
                {isSavingLegal ? (
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
      case "Cards":
        if (selectedCardId || mode === "create") {
          const selectedCard = selectedCardId
            ? selectedGiftCard?.giftCards.items.find(
                (card) => card.id.toString() === selectedCardId,
              )
            : undefined;

          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleBackToList}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={handleBackToList}
                      className="cursor-pointer"
                    >
                      {previousTab}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {mode === "create" ? "New Card" : "Card Details"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </div>
              <form className="space-y-8" onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="value">
                        ($) Value
                        {selectedGiftCard &&
                          selectedGiftCard.minValue !== undefined &&
                          selectedGiftCard.minValue !== null && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (${selectedGiftCard.minValue.toFixed(2)}
                              {selectedGiftCard &&
                              selectedGiftCard.maxValue !== undefined &&
                              selectedGiftCard.maxValue !== null &&
                              selectedGiftCard.maxValue !== Infinity
                                ? ` - $${selectedGiftCard.maxValue.toFixed(2)}`
                                : "+"}
                              )
                            </span>
                          )}
                      </Label>
                      <div className="relative">
                        <Input
                          id="value"
                          name="value"
                          type="number"
                          value={formValues.value}
                          step="0.01"
                          min={selectedGiftCard?.minValue ?? "0"}
                          max={
                            selectedGiftCard?.maxValue !== null &&
                            selectedGiftCard?.maxValue !== undefined &&
                            selectedGiftCard?.maxValue !== Infinity
                              ? selectedGiftCard.maxValue
                              : undefined
                          }
                          required
                          onChange={(e) => {
                            handleInputChange(e);
                            // Clear error when user types
                            if (valueError) setValueError(null);
                          }}
                          className={valueError ? "border-red-500 pr-10" : ""}
                        />
                        {valueError && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-red-500">
                              <Info className="h-4 w-4" />
                            </span>
                          </div>
                        )}
                      </div>
                      {valueError && (
                        <p className="text-xs text-red-500 mt-1">
                          {valueError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points">Poynts Value</Label>
                      <Input
                        id="points"
                        name="poyntsValue"
                        type="number"
                        value={formValues.poyntsValue}
                        min="0"
                        required
                        onChange={(e) => {
                          handleInputChange(e);
                          // Clear error when user types
                          if (poyntsError) setPoyntsError(null);
                        }}
                        className={poyntsError ? "border-red-500" : ""}
                      />
                      {poyntsError && (
                        <p className="text-xs text-red-500 mt-1">
                          {poyntsError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        defaultValue={selectedCard?.language || "EN"}
                        onValueChange={(value) =>
                          handleSelectChange("language", value)
                        }
                      >
                        <SelectTrigger id="language" name="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EN">English (EN)</SelectItem>
                          <SelectItem value="ES">Spanish (ES)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpid">CPIDX</Label>
                    <div className="relative">
                      {!isCpidEnabled && (
                        <button
                          type="button"
                          className="absolute inset-0 z-10 bg-transparent"
                          onClick={() => setIsCpidEnabled(true)}
                        />
                      )}
                      <Input
                        id="cpid"
                        name="cpid"
                        defaultValue={selectedCard?.cpidx || ""}
                        className={cn(
                          !isCpidEnabled && "opacity-50",
                          cpidError && "border-red-500"
                        )}
                        disabled={!isCpidEnabled}
                        onBlur={() => setIsCpidEnabled(false)}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Clear error when user types
                          if (cpidError) setCpidError(null);
                        }}
                      />
                    </div>
                    {cpidError && (
                      <p className="text-xs text-red-500 mt-1">
                        {cpidError}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToList}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!isFormValid || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          {mode === "create" ? "Creating..." : "Saving..."}
                        </>
                      ) : (
                        mode === "create" ? "Create Card" : "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {mode === "edit" && (
                <div className="mt-12 border-t pt-6">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
                    <h3 className="text-lg font-medium text-destructive">
                      Danger Zone
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Once you delete this gift card, there is no going back.
                      This action cannot be undone.
                    </p>
                    <div className="mt-4">
                      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => setShowDeleteDialog(true)}
                          >
                            Delete Gift Card
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Gift Card</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this gift card? This action cannot be undone.
                              {selectedCardId && selectedGiftCard && (() => {
                                const selectedCard = selectedGiftCard.giftCards.items.find(
                                  (card) => card.id.toString() === selectedCardId
                                );
                                return selectedCard ? (
                                  <>
                                    <br />
                                    <br />
                                    <strong>Gift Card:</strong> {selectedGiftCard.brand?.name || "Unknown"} - ${selectedCard.value}
                                    <br />
                                    <strong>CPID:</strong> {selectedCard.cpidx}
                                    <br />
                                    <strong>Poynts:</strong> {selectedCard.poyntsValue}
                                  </>
                                ) : null;
                              })()}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
                            <Button
                              onClick={handleDeleteGiftCard}
                              className="bg-destructive text-white hover:bg-destructive/90"
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Available Gift Cards</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedGiftCard?.valueType === "VARIABLE_VALUE"
                    ? "This is a Variable Value gift card. You can add new denominations."
                    : "This is a Fixed Value gift card. New denominations cannot be added."}
                </p>
              </div>
              {selectedGiftCard?.valueType === "VARIABLE_VALUE" ? (
                <Button onClick={handleCreateNewCard}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Card
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          disabled
                          className="cursor-not-allowed opacity-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Card
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        New cards can only be added to Variable Value gift cards
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <AvailableGiftCards
              giftCards={selectedGiftCard?.giftCards.items || []}
              onCardSelect={(cardId) => handleCardSelect(cardId, "Cards")}
            />
          </div>
        );
      case "Rebate Values":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Important Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      These rebate values are currently applied per card item
                      per provider. In a future update, these values will be
                      configurable per customer for more granular control.
                      Please note that any changes made here will only affect
                      transactions processed after saving.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rebate Configuration</h3>
              <form id="rebateForm" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-6 max-w-3xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Provider Rebate</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              The percentage share offered by the gift card
                              provider as part of the revenue split
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-32">
                        {!isProviderRebateEnabled && (
                          <button
                            type="button"
                            className="absolute inset-0 z-10 bg-transparent"
                            onClick={() => setIsProviderRebateEnabled(true)}
                          />
                        )}
                        <Input
                          type="number"
                          className={cn(
                            "w-full",
                            !isProviderRebateEnabled && "opacity-50",
                          )}
                          defaultValue={rebateValues.providerPercentage}
                          step="0.1"
                          disabled={!isProviderRebateEnabled}
                          onBlur={(e) => {
                            setIsProviderRebateEnabled(false);
                            handleRebateInputChange(
                              "providerPercentage",
                              e.target.value,
                            );
                          }}
                          id="providerPercentage"
                          name="providerPercentage"
                        />
                      </div>
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Base Rebate</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The number used for calculations</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-32"
                        defaultValue={rebateValues.basePercentage}
                        step="0.1"
                        onBlur={(e) =>
                          handleRebateInputChange(
                            "basePercentage",
                            e.target.value,
                          )
                        }
                        id="basePercentage"
                        name="basePercentage"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Customer Rebate</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The percentage the customer gets</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-32"
                        defaultValue={rebateValues.customerPercentage}
                        step="0.1"
                        onBlur={(e) =>
                          handleRebateInputChange(
                            "customerPercentage",
                            e.target.value,
                          )
                        }
                        id="customerPercentage"
                        name="customerPercentage"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>CP Rebate</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              The custom rebate that CarePoint, the company,
                              gets
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-32"
                        defaultValue={rebateValues.cpPercentage}
                        step="0.1"
                        onBlur={(e) =>
                          handleRebateInputChange(
                            "cpPercentage",
                            e.target.value,
                          )
                        }
                        id="cpPercentage"
                        name="cpPercentage"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="col-span-2 pt-4 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Reset to original values
                        setIsProviderRebateEnabled(false);
                        const form = document.getElementById(
                          "rebateForm",
                        ) as HTMLFormElement;
                        if (form) form.reset();

                        // Reset rebate values to original
                        if (selectedGiftCard) {
                          setRebateValues({
                            providerPercentage:
                              Number(
                                selectedGiftCard.rebateInfo
                                  .providerPercentage || 0,
                              ) * 100,
                            basePercentage:
                              Number(
                                selectedGiftCard.rebateInfo.basePercentage || 0,
                              ) * 100,
                            customerPercentage:
                              Number(
                                selectedGiftCard.rebateInfo
                                  .customerPercentage || 0,
                              ) * 100,
                            cpPercentage:
                              Number(
                                selectedGiftCard.rebateInfo.cpPercentage || 0,
                              ) * 100,
                          });
                          setIsRebateFormChanged(false);
                        }
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      className="w-32"
                      disabled={!isRebateFormChanged || isSavingGeneral}
                      onClick={async () => {
                        if (!selectedGiftCard?.id) {
                          toast.error("No gift card selected");
                          return;
                        }

                        setIsSavingGeneral(true);

                        try {
                          // Convert percentages to decimals (divide by 100)
                          const response = await fetch(`/api/legacy/giftcard-items/${selectedGiftCard.id}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              rebateInfo: {
                                providerPercentage: rebateValues.providerPercentage / 100,
                                basePercentage: rebateValues.basePercentage / 100,
                                customerPercentage: rebateValues.customerPercentage / 100,
                                cpPercentage: rebateValues.cpPercentage / 100,
                              },
                            }),
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Failed to update rebate values");
                          }

                          toast.success("Rebate values updated successfully");
                          setIsRebateFormChanged(false);

                          // No need to refresh - rebate values don't affect the grid display
                        } catch (error) {
                          console.error("Error updating rebate values:", error);
                          toast.error(error instanceof Error ? error.message : "Failed to update rebate values");
                        } finally {
                          setIsSavingGeneral(false);
                        }
                      }}
                    >
                      {isSavingGeneral ? (
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
              </form>
            </div>
          </div>
        );
      case "Recent Transactions":
        return (
          <div className="space-y-4">
            {isLoadingTransactions ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Poynts</TableHead>
                      <TableHead>Reference ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionData?.data &&
                    transactionData.data.length > 0 ? (
                      transactionData.data.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.id}
                          </TableCell>
                          <TableCell>
                            {transaction.date
                              ? new Date(transaction.date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                transaction.result === "success"
                                  ? "bg-green-50 text-green-700"
                                  : transaction.result === "pending"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {transaction.result || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            ${transaction.orderAmount?.toFixed(2) || "N/A"}
                          </TableCell>
                          <TableCell>{transaction.poynts || "N/A"}</TableCell>
                          <TableCell>
                            {transaction.providerReferenceId || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No transactions found for this gift card.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {transactionData?.data && transactionData.data.length > 0 && (
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <div>Showing {transactionData.data.length} transaction(s)</div>
              </div>
            )}
          </div>
        );
      case "Activity":
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
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.timestamp}</TableCell>
                        <TableCell>{activity.event}</TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{activity.actor}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              activity.severity === "info"
                                ? "bg-blue-50 text-blue-700"
                                : activity.severity === "warning"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {activity.severity}
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
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                  <SidebarMenu>
                    {giftCardSettings.nav.map((item, index) => (
                      <SidebarMenuItem
                        key={item.name}
                        className={index === 0 ? "mt-[30px]" : ""}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeTab}
                          onClick={() =>
                            !item.disabled && setActiveTab(item.name)
                          }
                          className={cn(
                            item.disabled && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <button className="w-full" disabled={item.disabled}>
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
                      {selectedGiftCard?.rewardName}{" "}
                      {selectedGiftCard?.id ? `(${selectedGiftCard.id})` : ""}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
