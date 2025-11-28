"use client";

import * as React from "react";
import {
  Info,
  Tag,
  ShoppingCart,
  Building,
  Clock,
  Database,
  ArrowLeft,
  Loader2,
  X,
  Package,
  Scale,
  FileText,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useGateValue } from "@statsig/react-bindings";

// Import the new sub-components
import {
  GeneralTab,
  ContentTab,
  DetailsTab,
  LegalTab,
  InventoryTab,
  ManageOfferSources,
  OfferDetail,
  DetailedOfferData,
  DetailedOfferResponse,
} from "./offers";
import { ReviewTab } from "./offers/review-tab";
import { EditOfferSource } from "./offers/reward-sources/edit-source-offer";
import { generateCpidx } from "./offers/cpidx-utils";

// Re-export types for other components to use
export type {
  OfferDetail,
  DetailedOfferData,
  DetailedOfferResponse,
} from "./offers";

const offerSettings = {
  nav: [
    { name: "General", icon: Info },
    { name: "Details", icon: Tag },
    { name: "Description", icon: FileText },
    { name: "Legal", icon: Scale },
    { name: "Review", icon: CheckCircle },
    { name: "Inventory", icon: Package },
    { name: "Reward Sources", icon: Database },
    { name: "Recent Transactions", icon: ShoppingCart },
    { name: "Catalogs", icon: Building },
    { name: "Activity", icon: Clock },
  ],
};

// Define wizard steps for create mode
const wizardSteps = [
  { name: "General", key: "General", required: true },
  { name: "Details", key: "Details", required: false },
  { name: "Description", key: "Description", required: true },
  { name: "Legal", key: "Legal", required: false },
  { name: "Review", key: "Review", required: false },
];

interface ManageOfferProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOffer: OfferDetail | null;
  isCreateMode?: boolean;
}

// Updated function to fetch offer data by redemption ID
async function fetchOfferByRedemptionId(
  redemptionId: string
): Promise<DetailedOfferData> {
  const response = await fetch(`/api/rewards/offers/${redemptionId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch offer data");
  }
  const result: DetailedOfferResponse = await response.json();
  return result.data;
}

export function ManageOffer({
  isOpen,
  onOpenChange,
  selectedOffer,
  isCreateMode = false,
}: ManageOfferProps) {
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
  const rewardsOffersInventoryEnabled = useGateValue(
    "rewards_offers_inventory"
  );

  // Get query client for data invalidation
  const queryClient = useQueryClient();

  // Extract the base CPID (first 4 parts) to use for API fetching
  const baseCpid = selectedOffer?.cpid || "";

  // Get the redemption ID from selectedOffer - assuming it's available in the items array
  const redemptionId =
    selectedOffer?.items?.[0]?.redemption_id?.toString() ||
    selectedOffer?.items?.[0]?.id?.toString() ||
    "";

  // Use TanStack Query to fetch offer data (only in edit mode)
  const {
    data: offerData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["offer", redemptionId],
    queryFn: () => fetchOfferByRedemptionId(redemptionId),
    enabled: isOpen && redemptionId !== "" && !isCreateMode, // Only fetch when modal is open, we have a redemption ID, and not in create mode
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [activeTab, setActiveTab] = React.useState("General");
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [editingSourceId, setEditingSourceId] = React.useState<string | null>(
    null
  );

  // Wizard state management
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const isWizardMode = isCreateMode;

  // Form state for General tab
  const [poyntsInput, setPoyntsInput] = React.useState<string>("");
  const [titleInput, setTitleInput] = React.useState<string>("");
  const [valueInput, setValueInput] = React.useState<string>("");
  const [brandNameInput, setBrandNameInput] = React.useState<string>("");
  const [languageInput, setLanguageInput] = React.useState<string>("EN");

  // Form state for Details tab
  const [statusInput, setStatusInput] = React.useState<string>("active");
  const [redemptionUrlInput, setRedemptionUrlInput] =
    React.useState<string>("");
  const [imageUrlInput, setImageUrlInput] = React.useState<string>("");
  const [startDateInput, setStartDateInput] = React.useState<string>("");
  const [endDateInput, setEndDateInput] = React.useState<string>("");
  const [instructionsInput, setInstructionsInput] = React.useState<string>("");
  const [shortDescriptionInput, setShortDescriptionInput] =
    React.useState<string>("");
  const [termsInput, setTermsInput] = React.useState<string>("");
  const [disclaimerInput, setDisclaimerInput] = React.useState<string>("");
  const [customIdInput, setCustomIdInput] = React.useState<string>("");
  const [rewardValueInput, setRewardValueInput] = React.useState<string>("");
  const [rebateValueInput, setRebateValueInput] = React.useState<string>("");
  const [inventoryTypeInput, setInventoryTypeInput] =
    React.useState<string>("single");
  const [usageLimitInput, setUsageLimitInput] = React.useState<string>("");
  const [limitTypeInput, setLimitTypeInput] =
    React.useState<string>("unlimited");
  const [singleCodeInput, setSingleCodeInput] = React.useState<string>("");
  const [multipleCodesInput, setMultipleCodesInput] =
    React.useState<string>("");

  const [longDescriptionInput, setLongDescriptionInput] =
    React.useState<string>("");

  // Store the generated CPIDx
  const [generatedCpidx, setGeneratedCpidx] = React.useState<string>("");

  const [initialGeneralData, setInitialGeneralData] = React.useState<{
    poynts: string;
    tags: string[];
    title: string;
    value: string;
    brand_name: string;
    language: string;
    status: string;
    imageUrl: string;
  } | null>(null);

  const [initialInventoryData, setInitialInventoryData] = React.useState<{
    inventoryType: string;
    limitType: string;
    usageLimit: string;
    singleCode: string;
    multipleCodes: string;
  } | null>(null);

  const [initialLegalData, setInitialLegalData] = React.useState<{
    terms: string;
    disclaimer: string;
  } | null>(null);

  const [initialContentData, setInitialContentData] = React.useState<{
    shortDescription: string;
    longDescription: string;
    instructions: string;
  } | null>(null);

  const [initialDetailsData, setInitialDetailsData] = React.useState<{
    language: string;
    redemptionUrl: string;
    customId: string;
    rebateValue: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  // Helper to compare tag arrays (order-sensitive)
  const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((val, idx) => val === b[idx]);

  // Helper to validate remote URLs (only HTTP/HTTPS)
  const isValidRemoteUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid (optional field)
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Wizard validation functions
  const canProceedFromStep = (stepIndex: number): boolean => {
    const step = wizardSteps[stepIndex];
    switch (step.key) {
      case "General":
        return (
          brandNameInput.trim() !== "" &&
          titleInput.trim() !== "" &&
          poyntsInput.trim() !== "" &&
          valueInput.trim() !== "" &&
          isValidRemoteUrl(imageUrlInput)
        );
      case "Description":
        return (
          longDescriptionInput.trim() !== ""
        );
      case "Details":
      case "Legal":
      case "Review":
        return true; // Optional steps / Review step
      default:
        return false;
    }
  };

  const canProceedToNext = (): boolean => {
    return canProceedFromStep(currentStep);
  };

  // Wizard navigation handlers
  const handleNextStep = async () => {
    if (!canProceedToNext()) return;

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep === wizardSteps.length - 1) {
      // Last step - create the offer
      await handleCreateOffer();
    } else {
      // Move to next step
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActiveTab(wizardSteps[nextStep].name);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActiveTab(wizardSteps[prevStep].name);
    }
  };

  // Final save function for creating offers
  const handleCreateOffer = async () => {
    try {
      setIsSaving(true);

      // Validate image URL before proceeding
      if (!isValidRemoteUrl(imageUrlInput)) {
        console.error("Invalid image URL");
        setIsSaving(false);
        return;
      }

      // Generate CPIDx if we have the required fields
      const cpidx = brandNameInput.length >= 5 ? generateCpidx({
        brandName: brandNameInput,
        language: languageInput,
        value: valueInput
      }) : "";

      // Collect all form data
      const payload = {
        type: "offer",
        title: titleInput,
        value: valueInput ? Number(valueInput) : 0,
        poynts: poyntsInput ? Number(poyntsInput) : 0,
        tags: selectedTags,
        reward_status: statusInput,
        reward_availability: "AVAILABLE",
        is_enabled: true,
        brand_name: brandNameInput,
        imageUrl: imageUrlInput,
        cpidx: cpidx, // Pass the generated CPIDx
        // Description tab data
        shortDescription: encodeURIComponent(shortDescriptionInput),
        longDescription: encodeURIComponent(longDescriptionInput),
        instructions: encodeURIComponent(instructionsInput),
        // Details tab data (use backend-expected keys)
        language: languageInput,
        redemptionUrl: redemptionUrlInput,
        customId: customIdInput,
        rebateValue: rebateValueInput ? Number(rebateValueInput) : 0,
        startDate: startDateInput || null,
        endDate: endDateInput || null,
        // Legal tab data
        terms: encodeURIComponent(termsInput),
        disclaimer: encodeURIComponent(disclaimerInput),
        // Inventory tab data
        inventoryType: inventoryTypeInput,
        singleCode: singleCodeInput,
        multipleCodes: multipleCodesInput,
      };

      // Use the correct endpoint for offer creation (POST to /api/offers)
      const response = await fetch("/api/rewards/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Close the dialog and refresh the rewards list
        onOpenChange(false);
        queryClient.invalidateQueries({
          queryKey: ["rewards"],
        });

        // Reset wizard state
        setCurrentStep(0);
        setCompletedSteps([]);
        setActiveTab("General");
      } else {
        console.error("Failed to create offer");
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add validation: check required fields across tabs (applies to both create and edit modes)
  const areRequiredFieldsFilled = React.useMemo(() => {
    return (
      brandNameInput.trim() !== "" &&
      titleInput.trim() !== "" &&
      poyntsInput.trim() !== "" &&
      valueInput.trim() !== "" &&
      longDescriptionInput.trim() !== ""
    );
  }, [
    brandNameInput,
    titleInput,
    poyntsInput,
    valueInput,
    longDescriptionInput,
  ]);

  // Determine whether any changes have been made in the General tab
  const isGeneralDirty = React.useMemo(() => {
    if (isCreateMode) {
      // In create mode, form is dirty if any required fields are filled
      return (
        titleInput.trim() !== "" ||
        poyntsInput.trim() !== "" ||
        valueInput.trim() !== "" ||
        brandNameInput.trim() !== "" ||
        statusInput !== "active" ||
        imageUrlInput.trim() !== ""
      );
    }
    if (!initialGeneralData) return false;
    const poyntsChanged = poyntsInput !== initialGeneralData.poynts;
    const tagsChanged = !arraysEqual(selectedTags, initialGeneralData.tags);
    const titleChanged = titleInput !== initialGeneralData.title;
    const valueChanged = valueInput !== initialGeneralData.value;
    const brandNameChanged = brandNameInput !== initialGeneralData.brand_name;
    const languageChanged = languageInput !== initialGeneralData.language;
    const statusChanged = statusInput !== initialGeneralData.status;
    const imageUrlChanged = imageUrlInput !== initialGeneralData.imageUrl;
    return (
      poyntsChanged ||
      tagsChanged ||
      titleChanged ||
      valueChanged ||
      brandNameChanged ||
      languageChanged ||
      statusChanged ||
      imageUrlChanged
    );
  }, [
    poyntsInput,
    selectedTags,
    titleInput,
    valueInput,
    brandNameInput,
    languageInput,
    statusInput,
    imageUrlInput,
    initialGeneralData,
    isCreateMode,
  ]);

  // Determine whether any changes have been made in the Inventory tab
  const isInventoryDirty = React.useMemo(() => {
    if (isCreateMode) {
      // In create mode, form is dirty if any fields are filled
      return (
        inventoryTypeInput !== "single" ||
        limitTypeInput !== "unlimited" ||
        usageLimitInput.trim() !== "" ||
        singleCodeInput.trim() !== "" ||
        multipleCodesInput.trim() !== ""
      );
    }
    if (!initialInventoryData) return false;
    return (
      inventoryTypeInput !== initialInventoryData.inventoryType ||
      limitTypeInput !== initialInventoryData.limitType ||
      usageLimitInput !== initialInventoryData.usageLimit ||
      singleCodeInput !== initialInventoryData.singleCode ||
      multipleCodesInput !== initialInventoryData.multipleCodes
    );
  }, [
    inventoryTypeInput,
    limitTypeInput,
    usageLimitInput,
    singleCodeInput,
    multipleCodesInput,
    initialInventoryData,
    isCreateMode,
  ]);

  // Determine whether any changes have been made in the Legal tab
  const isLegalDirty = React.useMemo(() => {
    if (isCreateMode) {
      // In create mode, form is dirty if any fields are filled
      return termsInput.trim() !== "" || disclaimerInput.trim() !== "";
    }
    if (!initialLegalData) return false;
    return (
      termsInput !== initialLegalData.terms ||
      disclaimerInput !== initialLegalData.disclaimer
    );
  }, [termsInput, disclaimerInput, initialLegalData, isCreateMode]);

  // Determine whether any changes have been made in the Content tab
  const isContentDirty = React.useMemo(() => {
    if (isCreateMode) {
      // In create mode, form is dirty if any fields are filled
      return (
        shortDescriptionInput.trim() !== "" ||
        longDescriptionInput.trim() !== "" ||
        instructionsInput.trim() !== ""
      );
    }
    if (!initialContentData) return false;
    return (
      shortDescriptionInput !== initialContentData.shortDescription ||
      longDescriptionInput !== initialContentData.longDescription ||
      instructionsInput !== initialContentData.instructions
    );
  }, [
    shortDescriptionInput,
    longDescriptionInput,
    instructionsInput,
    initialContentData,
    isCreateMode,
  ]);

  // Determine whether any changes have been made in the Details tab
  const isDetailsDirty = React.useMemo(() => {
    if (isCreateMode) {
      // In create mode, form is dirty if any fields are filled
      return (
        languageInput !== "EN" ||
        redemptionUrlInput.trim() !== "" ||
        customIdInput.trim() !== "" ||
        rebateValueInput.trim() !== "" ||
        startDateInput.trim() !== "" ||
        endDateInput.trim() !== ""
      );
    }
    if (!initialDetailsData) return false;
    return (
      languageInput !== initialDetailsData.language ||
      redemptionUrlInput !== initialDetailsData.redemptionUrl ||
      customIdInput !== initialDetailsData.customId ||
      rebateValueInput !== initialDetailsData.rebateValue ||
      startDateInput !== initialDetailsData.startDate ||
      endDateInput !== initialDetailsData.endDate
    );
  }, [
    languageInput,
    redemptionUrlInput,
    customIdInput,
    rebateValueInput,
    startDateInput,
    endDateInput,
    initialDetailsData,
    isCreateMode,
  ]);

  // Helper function to format dates for HTML date inputs
  const formatDateForInput = (date: any): string => {
    if (!date) return "";
    // Handle empty objects that come from serialization (legacy support)
    if (typeof date === "object" && Object.keys(date).length === 0) return "";
    if (typeof date === "string") {
      // Handle ISO date strings from API
      if (date.includes("T")) {
        return date.split("T")[0];
      }
      // Handle YYYY-MM-DD format directly
      return date;
    }
    if (date instanceof Date) return date.toISOString().split("T")[0];
    return "";
  };

  // Use the data from API always for operation, selectedOffer only for loading UI
  const displayOffer = offerData || (isLoading ? selectedOffer : null);

  // Update to default to General if a disabled tab was previously selected
  React.useEffect(() => {
    if (
      (!recentTransactionsEnabled && activeTab === "Recent Transactions") ||
      (!activityViewEnabled && activeTab === "Activity") ||
      (!rewardsOffersInventoryEnabled && activeTab === "Inventory")
    ) {
      setActiveTab("General");
    }
  }, [
    activeTab,
    recentTransactionsEnabled,
    activityViewEnabled,
    rewardsOffersInventoryEnabled,
  ]);

  // Reset wizard state when opening in create mode
  React.useEffect(() => {
    if (isOpen && isCreateMode) {
      setCurrentStep(0);
      setCompletedSteps([]);
      setActiveTab("General");
    }
  }, [isOpen, isCreateMode]);

  // Initialize form state from API data or reset for create mode
  React.useEffect(() => {
    if (isCreateMode && !selectedOffer) {
      // Reset form for new offer creation (not copying)
      setSelectedTags([]);
      setPoyntsInput("");
      setTitleInput("");
      setValueInput("");
      setBrandNameInput("");
      setLanguageInput("EN");

      // Reset Details tab fields
      setStatusInput("active");
      setRedemptionUrlInput("");
      setImageUrlInput("");
      setStartDateInput("");
      setEndDateInput("");
      setInstructionsInput("");
      setShortDescriptionInput("");
      setTermsInput("");
      setDisclaimerInput("");
      setCustomIdInput("");
      setRewardValueInput("");
      setRebateValueInput("");
      setInventoryTypeInput("single");
      setUsageLimitInput("");
      setLimitTypeInput("unlimited");
      setSingleCodeInput("");
      setMultipleCodesInput("");

      setLongDescriptionInput("");

      setInitialGeneralData(null);
      setInitialInventoryData(null);
      setInitialLegalData(null);
      setInitialContentData(null);
      setInitialDetailsData(null);
    } else if (isCreateMode && selectedOffer) {
      // Copy mode - pre-fill form with selected offer data but modify title
      const tags = selectedOffer.tags
        ? selectedOffer.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
        : [];

      setSelectedTags(tags);

      const poyntsStr = selectedOffer.poynts?.toString() || "";
      setPoyntsInput(poyntsStr);

      // Add "Copy of " prefix to the title
      const title = selectedOffer.title ? `Copy of ${selectedOffer.title}` : "";
      setTitleInput(title);

      const value = selectedOffer.value?.toString() || "";
      setValueInput(value);

      const brandName = selectedOffer.brand_name || "";
      setBrandNameInput(brandName);

      const language = selectedOffer.language || "EN";
      setLanguageInput(language);

      // Initialize Details tab fields from selectedOffer
      setStatusInput(selectedOffer.reward_status || "active");
      setRedemptionUrlInput(""); // Clear redemption URL for copy
      setImageUrlInput(""); // Clear image URL for copy
      setStartDateInput(""); // Clear dates for copy
      setEndDateInput("");
      setInstructionsInput(selectedOffer.description || "");
      setShortDescriptionInput(selectedOffer.description || "");
      setTermsInput(selectedOffer.terms || "");
      setDisclaimerInput(selectedOffer.disclaimer || "");
      setCustomIdInput(""); // Clear custom ID for copy
      setRewardValueInput(value);
      setRebateValueInput(""); // Clear rebate value for copy
      setInventoryTypeInput("single");
      setUsageLimitInput("");
      setLimitTypeInput("unlimited");
      setSingleCodeInput(""); // Clear codes for copy
      setMultipleCodesInput("");

      setLongDescriptionInput(selectedOffer.description || "");

      // Don't set initial data for copy mode - we want form to be "dirty"
      setInitialGeneralData(null);
      setInitialInventoryData(null);
      setInitialLegalData(null);
      setInitialContentData(null);
      setInitialDetailsData(null);
    } else if (offerData) {
      // Initialize form with existing data for edit mode using the new API structure
      const tags = offerData.tags
        ? offerData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
        : [];

      setSelectedTags(tags);

      const poyntsStr = offerData.redem_value?.toString() || "";
      setPoyntsInput(poyntsStr);

      const title = offerData.title || "";
      setTitleInput(title);

      const value = offerData.value?.toString() || "";
      setValueInput(value);

      const brandName = offerData.brand_name || "";
      setBrandNameInput(brandName);

      const language = offerData.language || "EN";
      setLanguageInput(language);

      // Initialize Details tab fields
      setStatusInput(offerData.reward_status || "active");
      setRedemptionUrlInput(offerData.redem_url || "");
      setImageUrlInput(offerData.imageUrl || "");
      setStartDateInput(formatDateForInput(offerData.startdate));
      setEndDateInput(formatDateForInput(offerData.enddate));
      setInstructionsInput(offerData.instructions || "");
      setShortDescriptionInput(offerData.shortDescription || "");
      setTermsInput(offerData.terms || "");
      setDisclaimerInput(offerData.disclaimer || "");
      setCustomIdInput(offerData.custom_id || "");
      setRewardValueInput(value); // Same as offer value for now
      setRebateValueInput(
        offerData.rebate_value
          ? parseFloat(offerData.rebate_value.toString()).toFixed(2)
          : ""
      );

      // Map legacy "unlimited" inventory_type to "single" for UI purposes
      const normalizedInventoryType =
        offerData.inventory_type === "unlimited"
          ? "single"
          : offerData.inventory_type || "single";

      setInventoryTypeInput(normalizedInventoryType);

      setUsageLimitInput(
        offerData.inventory_remaining && offerData.inventory_remaining > 0
          ? offerData.inventory_remaining.toString()
          : ""
      );
      setLimitTypeInput(
        offerData.inventory_type === "unlimited" ? "unlimited" : "limited"
      );

      // Preload ONLY unused codes so that editing doesn't display irreversible used codes
      const unusedCodes =
        offerData.redemption_codes?.codes?.filter((c) => !c.date_used) || [];

      setSingleCodeInput(unusedCodes[0]?.code || "");
      setMultipleCodesInput(unusedCodes.map((c) => c.code).join("\n") || "");

      setLongDescriptionInput(offerData.description || "");

      setInitialGeneralData({
        poynts: poyntsStr,
        tags,
        title,
        value,
        brand_name: brandName,
        language,
        status: offerData.reward_status || "active",
        imageUrl: offerData.imageUrl || "",
      });

      setInitialInventoryData({
        inventoryType: normalizedInventoryType,
        limitType:
          offerData.inventory_type === "unlimited" ? "unlimited" : "limited",
        usageLimit:
          offerData.inventory_remaining && offerData.inventory_remaining > 0
            ? offerData.inventory_remaining.toString()
            : "",
        singleCode: unusedCodes[0]?.code || "",
        multipleCodes: unusedCodes.map((c) => c.code).join("\n") || "",
      });

      setInitialLegalData({
        terms: offerData.terms || "",
        disclaimer: offerData.disclaimer || "",
      });

      setInitialContentData({
        shortDescription: offerData.shortDescription || "",
        longDescription: offerData.description || "",
        instructions: offerData.instructions || "",
      });

      setInitialDetailsData({
        language: offerData.language || "EN",
        redemptionUrl: offerData.redem_url || "",
        customId: offerData.custom_id || "",
        rebateValue: offerData.rebate_value
          ? parseFloat(offerData.rebate_value.toString()).toFixed(2)
          : "",
        startDate: formatDateForInput(offerData.startdate),
        endDate: formatDateForInput(offerData.enddate),
      });
    } else if (displayOffer && !offerData) {
      // Fallback to selectedOffer data if detailed data is not yet loaded
      const tags = displayOffer.tags
        ? displayOffer.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
        : [];

      setSelectedTags(tags);

      // Type guard to check if displayOffer is OfferDetail (has poynts) or DetailedOfferData (has redem_value)
      const poyntsStr =
        "poynts" in displayOffer
          ? displayOffer.poynts?.toString() || ""
          : displayOffer.redem_value?.toString() || "";
      setPoyntsInput(poyntsStr);

      const title = displayOffer.title || "";
      setTitleInput(title);

      const value = displayOffer.value?.toString() || "";
      setValueInput(value);

      const brandName = displayOffer.brand_name || "";
      setBrandNameInput(brandName);

      const language = displayOffer.language || "EN";
      setLanguageInput(language);

      // Initialize with basic data from selectedOffer
      setStatusInput(displayOffer.reward_status || "active");
      // Type guard to check if displayOffer has items (OfferDetail) or imageUrl (DetailedOfferData)
      const imageUrl =
        "items" in displayOffer
          ? displayOffer.items?.[0]?.reward_image || ""
          : displayOffer.imageUrl || "";
      setImageUrlInput(imageUrl);
      setTermsInput(displayOffer.terms || "");
      setDisclaimerInput(displayOffer.disclaimer || "");
      setLongDescriptionInput(displayOffer.description || "");
    }
  }, [offerData, displayOffer, isCreateMode, selectedOffer]);

  // Tag handlers
  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleEditSource = (sourceId: number) => {
    console.log("[ManageOffer] Editing source with ID:", sourceId);
    setEditingSourceId(String(sourceId));
  };

  const renderContent = () => {
    // If editing a source, show Edit Offer Source content
    if (editingSourceId) {
      // Create a source object for the EditOfferSource component
      const selectedSource = offerData
        ? {
          id: offerData.id,
          name: "O",
          status: offerData.reward_availability || "available",
          cpid: offerData.cpid,
          cpidx: offerData.cpid, // Use cpid since offers don't have separate cpidx
          latency: 150,
          providerStatus: offerData.reward_status || "active",
          cardStatus: offerData.reward_status || "active",
        }
        : undefined;

      return (
        <EditOfferSource
          selectedSource={selectedSource}
          displayOffer={offerData || null}
          onCancel={() => setEditingSourceId(null)}
          onDataUpdated={() => {
            // Refresh the offer data
            if (redemptionId) {
              queryClient.invalidateQueries({
                queryKey: ["offer", redemptionId],
              });
            }
            // Also refresh the offers list so the table reflects the changes
            queryClient.invalidateQueries({
              queryKey: ["offers"],
            });
            // Refresh the rewards grid
            queryClient.invalidateQueries({ queryKey: ["rewards"] });
          }}
          onSave={(sourceId: number, formData: any) => {
            console.log("Saving offer source data:", sourceId, formData);

            // Just close the edit form and let the API refetch happen
            setEditingSourceId(null);

            // Refresh the offer data
            if (redemptionId) {
              queryClient.invalidateQueries({
                queryKey: ["offer", redemptionId],
              });
            }
            // Also refresh the offers list so the table reflects the changes
            queryClient.invalidateQueries({
              queryKey: ["offers"],
            });
            // Refresh the rewards grid
            queryClient.invalidateQueries({ queryKey: ["rewards"] });
          }}
        />
      );
    }

    switch (activeTab) {
      case "General":
        return (
          <GeneralTab
            offerData={offerData}
            selectedOffer={selectedOffer}
            isCreateMode={isCreateMode}
            canManageRewards={canManageRewards}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            redemptionId={redemptionId}
            onClose={() => onOpenChange(false)}
            selectedTags={selectedTags}
            onTagRemove={handleTagRemove}
            onTagAdd={handleTagAdd}
            poyntsInput={poyntsInput}
            setPoyntsInput={setPoyntsInput}
            titleInput={titleInput}
            setTitleInput={setTitleInput}
            valueInput={valueInput}
            setValueInput={setValueInput}
            brandNameInput={brandNameInput}
            setBrandNameInput={setBrandNameInput}
            statusInput={statusInput}
            setStatusInput={setStatusInput}
            imageUrlInput={imageUrlInput}
            setImageUrlInput={setImageUrlInput}
            isDirty={isGeneralDirty}
            initialData={initialGeneralData}
            setInitialData={setInitialGeneralData}
            areRequiredFieldsFilled={areRequiredFieldsFilled}
          />
        );
      case "Description":
        return (
          <ContentTab
            offerData={offerData}
            selectedOffer={selectedOffer}
            isCreateMode={isCreateMode}
            canManageRewards={canManageRewards}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            redemptionId={redemptionId}
            shortDescriptionInput={shortDescriptionInput}
            setShortDescriptionInput={setShortDescriptionInput}
            longDescriptionInput={longDescriptionInput}
            setLongDescriptionInput={setLongDescriptionInput}
            instructionsInput={instructionsInput}
            setInstructionsInput={setInstructionsInput}
            isDirty={isContentDirty}
            initialData={initialContentData}
            setInitialData={setInitialContentData}
            areRequiredFieldsFilled={areRequiredFieldsFilled}
          />
        );
      case "Details":
        return (
          <DetailsTab
            offerData={offerData}
            selectedOffer={selectedOffer}
            isCreateMode={isCreateMode}
            canManageRewards={canManageRewards}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            redemptionId={redemptionId}
            languageInput={languageInput}
            setLanguageInput={setLanguageInput}
            redemptionUrlInput={redemptionUrlInput}
            setRedemptionUrlInput={setRedemptionUrlInput}
            customIdInput={customIdInput}
            setCustomIdInput={setCustomIdInput}
            rebateValueInput={rebateValueInput}
            setRebateValueInput={setRebateValueInput}
            startDateInput={startDateInput}
            setStartDateInput={setStartDateInput}
            endDateInput={endDateInput}
            setEndDateInput={setEndDateInput}
            isDirty={isDetailsDirty}
            brandNameInput={brandNameInput}
            valueInput={valueInput}
          />
        );
      case "Inventory":
        if (!rewardsOffersInventoryEnabled) return null;
        return (
          <InventoryTab
            offerData={offerData}
            selectedOffer={selectedOffer}
            isCreateMode={isCreateMode}
            canManageRewards={canManageRewards}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            redemptionId={redemptionId}
            inventoryTypeInput={inventoryTypeInput}
            setInventoryTypeInput={setInventoryTypeInput}
            limitTypeInput={limitTypeInput}
            setLimitTypeInput={setLimitTypeInput}
            usageLimitInput={usageLimitInput}
            setUsageLimitInput={setUsageLimitInput}
            singleCodeInput={singleCodeInput}
            setSingleCodeInput={setSingleCodeInput}
            multipleCodesInput={multipleCodesInput}
            setMultipleCodesInput={setMultipleCodesInput}
            isDirty={isInventoryDirty}
            initialData={initialInventoryData}
            setInitialData={setInitialInventoryData}
          />
        );
      case "Legal":
        return (
          <LegalTab
            offerData={offerData}
            selectedOffer={selectedOffer}
            isCreateMode={isCreateMode}
            canManageRewards={canManageRewards}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            redemptionId={redemptionId}
            termsInput={termsInput}
            setTermsInput={setTermsInput}
            disclaimerInput={disclaimerInput}
            setDisclaimerInput={setDisclaimerInput}
            isDirty={isLegalDirty}
            initialData={initialLegalData}
            setInitialData={setInitialLegalData}
          />
        );
      case "Review":
        return (
          <ReviewTab
            offerData={offerData}
            selectedOffer={selectedOffer}
            isCreateMode={isCreateMode}
            canManageRewards={canManageRewards}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            redemptionId={redemptionId}

            // General tab data
            brandNameInput={brandNameInput}
            titleInput={titleInput}
            poyntsInput={poyntsInput}
            valueInput={valueInput}
            selectedTags={selectedTags}
            statusInput={statusInput}
            imageUrlInput={imageUrlInput}

            // Details tab data
            languageInput={languageInput}
            redemptionUrlInput={redemptionUrlInput}
            customIdInput={customIdInput}
            rebateValueInput={rebateValueInput}
            startDateInput={startDateInput}
            endDateInput={endDateInput}

            // Description tab data
            shortDescriptionInput={shortDescriptionInput}
            longDescriptionInput={longDescriptionInput}
            instructionsInput={instructionsInput}

            // Legal tab data
            termsInput={termsInput}
            disclaimerInput={disclaimerInput}
          />
        );
      case "Reward Sources":
        return (
          <ManageOfferSources
            sources={
              // Use actual offer data to create a single source
              offerData
                ? [
                  {
                    id: offerData.id,
                    name: "O", // Single source for offers - using "O" for offers
                    status: offerData.reward_availability || "available",
                    cpid: offerData.cpid,
                    cpidx: offerData.cpid, // Use cpid since offers don't have cpidx
                    latency: 150, // Could be null or derived from API if available
                    providerStatus: offerData.reward_status || "active",
                    cardStatus: offerData.reward_status || "active",
                    // Note: No utid field for offers
                  },
                ]
                : []
            }
            displayOffer={offerData || null}
            onEditSource={handleEditSource}
            onSourcesReordered={(newSources) => {
              console.log("Offer sources reordered:", newSources);
              // TODO: Implement source reordering
            }}
          />
        );
      case "Recent Transactions":
        if (!recentTransactionsEnabled) return null;
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Recent Transactions</h3>
              <p className="text-muted-foreground mt-2">Coming Soon...</p>
            </div>
          </div>
        );
      case "Catalogs":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Catalogs Management</h3>
              <p className="text-muted-foreground mt-2">Coming Soon...</p>
            </div>
          </div>
        );
      case "Activity":
        if (!activityViewEnabled) return null;
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Activity Log</h3>
              <p className="text-muted-foreground mt-2">Coming Soon...</p>
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
        <DialogTitle className="sr-only">
          {isCreateMode ? "Create New Offer" : "Offer Configuration"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isCreateMode
            ? "Create a new offer"
            : "Configure your offer settings here."}
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="pt-4">
                    {offerSettings.nav
                      .filter(
                        (item) =>
                          (item.name !== "Recent Transactions" ||
                            recentTransactionsEnabled) &&
                          (item.name !== "Activity" || activityViewEnabled) &&
                          (item.name !== "Catalogs" ||
                            rewardsRelatedCatalogsEnabled) &&
                          (item.name !== "Inventory" ||
                            rewardsOffersInventoryEnabled) &&
                          (item.name !== "Reward Sources" || !isWizardMode) && // Hide Reward Sources in wizard mode
                          (item.name !== "Review" || isCreateMode) // Only show Review tab in create mode
                      )
                      .map((item) => {
                        // In wizard mode, only show wizard steps
                        const isWizardStep = isWizardMode
                          ? wizardSteps.some(step => step.name === item.name)
                          : true;

                        if (!isWizardStep) return null;

                        return (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={item.name === activeTab}
                              onClick={() => {
                                // In wizard mode, disable clicking between tabs
                                if (isWizardMode) return;
                                setActiveTab(item.name);
                                setEditingSourceId(null);
                              }}
                              className={
                                isWizardMode
                                  ? item.name === activeTab
                                    ? "cursor-not-allowed" // Current step - normal appearance
                                    : "cursor-not-allowed opacity-60" // Other steps - dimmed
                                  : ""
                              }
                            >
                              <button
                                className="w-full"
                                onClick={(e) => {
                                  if (isWizardMode) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                                {isWizardMode && (
                                  <span className="ml-auto text-xs">
                                    {wizardSteps.findIndex(step => step.name === item.name) + 1}
                                  </span>
                                )}
                              </button>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[680px] flex-1 flex-col overflow-hidden relative">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Offers</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {isCreateMode ? (
                        "Create New Offer"
                      ) : isLoading ? (
                        <>
                          <span className="inline-block mr-2">
                            {selectedOffer?.title || "Loading Offer"}
                          </span>
                          <Loader2 className="inline-block h-3 w-3 animate-spin text-muted-foreground" />
                        </>
                      ) : offerData ? (
                        `${offerData.title} ($${offerData.value})`
                      ) : (
                        "Offer"
                      )}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  {isCreateMode && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{activeTab}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className={cn("flex-1 overflow-y-auto p-6", isWizardMode && "pb-24")}>
              {!isCreateMode && isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading offer details...
                    </p>
                  </div>
                </div>
              ) : !isCreateMode && isError ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-destructive font-medium">
                      Error loading offer details
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
            {isWizardMode && (
              <div className="absolute bottom-0 left-0 right-0 bg-background">
                <div className="w-full border-t" />
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {wizardSteps.length}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {wizardSteps[currentStep].required && (
                          <span className="text-red-500">* Required</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handlePreviousStep}
                        disabled={currentStep === 0 || isSaving}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={handleNextStep}
                        disabled={!canProceedToNext() || isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : activeTab === "Review" ? (
                          "Create Offer"
                        ) : (
                          "Next"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
