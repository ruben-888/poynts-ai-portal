"use client";

import * as React from "react";
import {
  Info,
  Calendar,
  CheckCircle,
  Loader2,
  Settings2,
  ListChecks,
  Clock,
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
import { useTenant } from "@/components/context/tenant-provider";

import {
  GeneralTab,
  DetailsTab,
  ScheduleTab,
  ReviewTab,
  StepsTab,
} from "./campaign-tabs";

// Campaign type matching the API response
export interface CampaignStep {
  id: string;
  campaign_fk: string;
  name: string;
  description: string | null;
  step_order: number;
  poynts: number;
  action_type: string;
  action_config: any;
  is_required: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Campaign {
  id: string;
  organization_fk: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  status: string | null;
  total_poynts: number;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  metadata: any;
  program_fk: string | null;
  requires_verification: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  campaign_steps?: CampaignStep[];
  organizations?: {
    id: string;
    name: string;
  };
  programs?: {
    id: string;
    name: string;
  } | null;
}

interface Program {
  id: string;
  name: string;
}

const campaignSettings = {
  nav: [
    { name: "General", icon: Info },
    { name: "Details", icon: Settings2 },
    { name: "Schedule", icon: Calendar },
    { name: "Review", icon: CheckCircle },
    { name: "Steps", icon: ListChecks },
    { name: "Activity", icon: Clock },
  ],
};

// Define wizard steps for create mode
const wizardSteps = [
  { name: "General", key: "General", required: true },
  { name: "Details", key: "Details", required: true },
  { name: "Schedule", key: "Schedule", required: false },
  { name: "Review", key: "Review", required: false },
];

interface ManageCampaignProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCampaign: Campaign | null;
  isCreateMode?: boolean;
}

async function fetchCampaignById(campaignId: string): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${campaignId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch campaign data");
  }
  const result = await response.json();
  return result.data;
}

async function fetchPrograms(organizationId: string): Promise<Program[]> {
  const response = await fetch(
    `/api/programs?organization_id=${organizationId}`
  );
  if (!response.ok) {
    return [];
  }
  const result = await response.json();
  return result.data || [];
}

export function ManageCampaign({
  isOpen,
  onOpenChange,
  selectedCampaign,
  isCreateMode = false,
}: ManageCampaignProps) {
  const { currentOrgId } = useTenant();
  const queryClient = useQueryClient();

  const campaignId = selectedCampaign?.id || "";

  // Fetch campaign data (only in edit mode)
  const {
    data: campaignData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => fetchCampaignById(campaignId),
    enabled: isOpen && campaignId !== "" && !isCreateMode,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch programs for the dropdown
  const { data: programs = [] } = useQuery({
    queryKey: ["programs", currentOrgId],
    queryFn: () => fetchPrograms(currentOrgId),
    enabled: isOpen && !!currentOrgId,
    staleTime: 1000 * 60 * 5,
  });

  const [activeTab, setActiveTab] = React.useState("General");
  const [isSaving, setIsSaving] = React.useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const isWizardMode = isCreateMode;

  // Form state - General
  const [nameInput, setNameInput] = React.useState("");
  const [slugInput, setSlugInput] = React.useState("");
  const [descriptionInput, setDescriptionInput] = React.useState("");
  const [statusInput, setStatusInput] = React.useState("draft");

  // Form state - Details
  const [typeInput, setTypeInput] = React.useState("acquisition");
  const [totalPoyntsInput, setTotalPoyntsInput] = React.useState(0);
  const [imageUrlInput, setImageUrlInput] = React.useState("");
  const [maxParticipantsInput, setMaxParticipantsInput] = React.useState("");
  const [requiresVerificationInput, setRequiresVerificationInput] =
    React.useState(false);
  const [programIdInput, setProgramIdInput] = React.useState("");

  // Form state - Schedule
  const [startDateInput, setStartDateInput] = React.useState("");
  const [endDateInput, setEndDateInput] = React.useState("");

  // Initial data for dirty checking
  const [initialData, setInitialData] = React.useState<{
    name: string;
    slug: string;
    description: string;
    status: string;
    type: string;
    totalPoynts: number;
    imageUrl: string;
    maxParticipants: string;
    requiresVerification: boolean;
    programId: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  // Helper to format dates
  const formatDateForInput = (date: any): string => {
    if (!date) return "";
    if (typeof date === "string" && date.includes("T")) {
      return date.split("T")[0];
    }
    return date;
  };

  // Wizard validation
  const canProceedFromStep = (stepIndex: number): boolean => {
    const step = wizardSteps[stepIndex];
    switch (step.key) {
      case "General":
        return nameInput.trim() !== "" && slugInput.trim() !== "";
      case "Details":
        return typeInput !== "";
      case "Schedule":
      case "Review":
        return true;
      default:
        return false;
    }
  };

  const canProceedToNext = (): boolean => {
    return canProceedFromStep(currentStep);
  };

  // Wizard navigation
  const handleNextStep = async () => {
    if (!canProceedToNext()) return;

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep === wizardSteps.length - 1) {
      await handleCreateCampaign();
    } else {
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

  // Create campaign
  const handleCreateCampaign = async () => {
    try {
      setIsSaving(true);

      const payload = {
        name: nameInput,
        slug: slugInput,
        description: descriptionInput || null,
        status: statusInput,
        type: typeInput,
        total_poynts: totalPoyntsInput,
        image_url: imageUrlInput || null,
        max_participants: maxParticipantsInput
          ? parseInt(maxParticipantsInput)
          : null,
        requires_verification: requiresVerificationInput,
        program_fk: programIdInput || null,
        start_date: startDateInput || null,
        end_date: endDateInput || null,
      };

      const response = await fetch(
        `/api/campaigns?organization_id=${currentOrgId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        onOpenChange(false);
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        resetForm();
      } else {
        const error = await response.json();
        console.error("Failed to create campaign:", error);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save changes (edit mode)
  const handleSaveChanges = async () => {
    if (!campaignId) return;

    try {
      setIsSaving(true);

      const payload = {
        name: nameInput,
        slug: slugInput,
        description: descriptionInput || null,
        status: statusInput,
        type: typeInput,
        total_poynts: totalPoyntsInput,
        image_url: imageUrlInput || null,
        max_participants: maxParticipantsInput
          ? parseInt(maxParticipantsInput)
          : null,
        requires_verification: requiresVerificationInput,
        program_fk: programIdInput || null,
        start_date: startDateInput || null,
        end_date: endDateInput || null,
      };

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
        // Update initial data to current values
        setInitialData({
          name: nameInput,
          slug: slugInput,
          description: descriptionInput,
          status: statusInput,
          type: typeInput,
          totalPoynts: totalPoyntsInput,
          imageUrl: imageUrlInput,
          maxParticipants: maxParticipantsInput,
          requiresVerification: requiresVerificationInput,
          programId: programIdInput,
          startDate: startDateInput,
          endDate: endDateInput,
        });
      } else {
        console.error("Failed to update campaign");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setActiveTab("General");
    setNameInput("");
    setSlugInput("");
    setDescriptionInput("");
    setStatusInput("draft");
    setTypeInput("acquisition");
    setTotalPoyntsInput(0);
    setImageUrlInput("");
    setMaxParticipantsInput("");
    setRequiresVerificationInput(false);
    setProgramIdInput("");
    setStartDateInput("");
    setEndDateInput("");
    setInitialData(null);
  };

  // Dirty checking
  const isDirty = React.useMemo(() => {
    if (isCreateMode) {
      return nameInput.trim() !== "" || slugInput.trim() !== "";
    }
    if (!initialData) return false;
    return (
      nameInput !== initialData.name ||
      slugInput !== initialData.slug ||
      descriptionInput !== initialData.description ||
      statusInput !== initialData.status ||
      typeInput !== initialData.type ||
      totalPoyntsInput !== initialData.totalPoynts ||
      imageUrlInput !== initialData.imageUrl ||
      maxParticipantsInput !== initialData.maxParticipants ||
      requiresVerificationInput !== initialData.requiresVerification ||
      programIdInput !== initialData.programId ||
      startDateInput !== initialData.startDate ||
      endDateInput !== initialData.endDate
    );
  }, [
    isCreateMode,
    nameInput,
    slugInput,
    descriptionInput,
    statusInput,
    typeInput,
    totalPoyntsInput,
    imageUrlInput,
    maxParticipantsInput,
    requiresVerificationInput,
    programIdInput,
    startDateInput,
    endDateInput,
    initialData,
  ]);

  // Initialize form from data
  React.useEffect(() => {
    if (isCreateMode && !selectedCampaign) {
      resetForm();
    } else if (campaignData) {
      setNameInput(campaignData.name || "");
      setSlugInput(campaignData.slug || "");
      setDescriptionInput(campaignData.description || "");
      setStatusInput(campaignData.status || "draft");
      setTypeInput(campaignData.type || "acquisition");
      setTotalPoyntsInput(campaignData.total_poynts || 0);
      setImageUrlInput(campaignData.image_url || "");
      setMaxParticipantsInput(
        campaignData.max_participants?.toString() || ""
      );
      setRequiresVerificationInput(
        campaignData.requires_verification || false
      );
      setProgramIdInput(campaignData.program_fk || "");
      setStartDateInput(formatDateForInput(campaignData.start_date));
      setEndDateInput(formatDateForInput(campaignData.end_date));

      setInitialData({
        name: campaignData.name || "",
        slug: campaignData.slug || "",
        description: campaignData.description || "",
        status: campaignData.status || "draft",
        type: campaignData.type || "acquisition",
        totalPoynts: campaignData.total_poynts || 0,
        imageUrl: campaignData.image_url || "",
        maxParticipants: campaignData.max_participants?.toString() || "",
        requiresVerification: campaignData.requires_verification || false,
        programId: campaignData.program_fk || "",
        startDate: formatDateForInput(campaignData.start_date),
        endDate: formatDateForInput(campaignData.end_date),
      });
    }
  }, [campaignData, isCreateMode, selectedCampaign]);

  // Reset wizard on open in create mode
  React.useEffect(() => {
    if (isOpen && isCreateMode) {
      resetForm();
    }
  }, [isOpen, isCreateMode]);

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <GeneralTab
            isCreateMode={isCreateMode}
            isSaving={isSaving}
            nameInput={nameInput}
            setNameInput={setNameInput}
            slugInput={slugInput}
            setSlugInput={setSlugInput}
            descriptionInput={descriptionInput}
            setDescriptionInput={setDescriptionInput}
            statusInput={statusInput}
            setStatusInput={setStatusInput}
            isDirty={isDirty}
            onSave={handleSaveChanges}
          />
        );
      case "Details":
        return (
          <DetailsTab
            isCreateMode={isCreateMode}
            isSaving={isSaving}
            typeInput={typeInput}
            setTypeInput={setTypeInput}
            totalPoyntsInput={totalPoyntsInput}
            setTotalPoyntsInput={setTotalPoyntsInput}
            imageUrlInput={imageUrlInput}
            setImageUrlInput={setImageUrlInput}
            maxParticipantsInput={maxParticipantsInput}
            setMaxParticipantsInput={setMaxParticipantsInput}
            requiresVerificationInput={requiresVerificationInput}
            setRequiresVerificationInput={setRequiresVerificationInput}
            programIdInput={programIdInput}
            setProgramIdInput={setProgramIdInput}
            programs={programs}
            isDirty={isDirty}
            onSave={handleSaveChanges}
          />
        );
      case "Schedule":
        return (
          <ScheduleTab
            isCreateMode={isCreateMode}
            isSaving={isSaving}
            startDateInput={startDateInput}
            setStartDateInput={setStartDateInput}
            endDateInput={endDateInput}
            setEndDateInput={setEndDateInput}
            isDirty={isDirty}
            onSave={handleSaveChanges}
          />
        );
      case "Review":
        return (
          <ReviewTab
            nameInput={nameInput}
            slugInput={slugInput}
            descriptionInput={descriptionInput}
            statusInput={statusInput}
            typeInput={typeInput}
            totalPoyntsInput={totalPoyntsInput}
            imageUrlInput={imageUrlInput}
            maxParticipantsInput={maxParticipantsInput}
            requiresVerificationInput={requiresVerificationInput}
            startDateInput={startDateInput}
            endDateInput={endDateInput}
          />
        );
      case "Steps":
        return (
          <StepsTab
            campaignId={campaignId}
            stepsCount={campaignData?.campaign_steps?.length}
          />
        );
      case "Activity":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Activity Log</h3>
              <p className="text-muted-foreground mt-2">Coming soon...</p>
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
          {isCreateMode ? "Create New Campaign" : "Campaign Configuration"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isCreateMode
            ? "Create a new campaign"
            : "Configure your campaign settings here."}
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="pt-4">
                    {campaignSettings.nav
                      .filter((item) => {
                        // In wizard mode, only show wizard steps
                        if (isWizardMode) {
                          return wizardSteps.some(
                            (step) => step.name === item.name
                          );
                        }
                        // In edit mode, hide Review tab
                        if (item.name === "Review") return false;
                        return true;
                      })
                      .map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={item.name === activeTab}
                            onClick={() => {
                              if (isWizardMode) return;
                              setActiveTab(item.name);
                            }}
                            className={
                              isWizardMode
                                ? item.name === activeTab
                                  ? "cursor-not-allowed"
                                  : "cursor-not-allowed opacity-60"
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
                                  {wizardSteps.findIndex(
                                    (step) => step.name === item.name
                                  ) + 1}
                                </span>
                              )}
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
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
                    <BreadcrumbLink href="#">Campaigns</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {isCreateMode ? (
                        "Create New Campaign"
                      ) : isLoading ? (
                        <>
                          <span className="inline-block mr-2">
                            {selectedCampaign?.name || "Loading Campaign"}
                          </span>
                          <Loader2 className="inline-block h-3 w-3 animate-spin text-muted-foreground" />
                        </>
                      ) : campaignData ? (
                        campaignData.name
                      ) : (
                        "Campaign"
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
            <div
              className={cn(
                "flex-1 overflow-y-auto p-6",
                isWizardMode && "pb-24"
              )}
            >
              {!isCreateMode && isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading campaign details...
                    </p>
                  </div>
                </div>
              ) : !isCreateMode && isError ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-destructive font-medium">
                      Error loading campaign details
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
                          "Create Campaign"
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
