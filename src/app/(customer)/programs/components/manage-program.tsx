"use client";

import * as React from "react";
import {
  Info,
  Calendar,
  CheckCircle,
  Loader2,
  Megaphone,
  Layers,
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

import { GeneralTab, ScheduleTab, ReviewTab } from "./program-tabs";

// Program type matching the API response
export interface Program {
  id: string;
  organization_fk: string;
  name: string;
  slug: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  eligibility_rules: any;
  earning_modifiers: any;
  poynt_caps: any;
  metadata: any;
  created_at: string | null;
  updated_at: string | null;
  organizations?: {
    id: string;
    name: string;
  };
  tier_definitions?: any[];
  campaigns?: any[];
}

const programSettings = {
  nav: [
    { name: "General", icon: Info },
    { name: "Schedule", icon: Calendar },
    { name: "Review", icon: CheckCircle },
    { name: "Campaigns", icon: Megaphone },
    { name: "Tiers", icon: Layers },
    { name: "Activity", icon: Clock },
  ],
};

// Define wizard steps for create mode
const wizardSteps = [
  { name: "General", key: "General", required: true },
  { name: "Schedule", key: "Schedule", required: false },
  { name: "Review", key: "Review", required: false },
];

interface ManageProgramProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProgram: Program | null;
  isCreateMode?: boolean;
}

async function fetchProgramById(programId: string): Promise<Program> {
  const response = await fetch(`/api/programs/${programId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch program data");
  }
  const result = await response.json();
  return result.data;
}

export function ManageProgram({
  isOpen,
  onOpenChange,
  selectedProgram,
  isCreateMode = false,
}: ManageProgramProps) {
  const { currentOrgId } = useTenant();
  const queryClient = useQueryClient();

  const programId = selectedProgram?.id || "";

  // Fetch program data (only in edit mode)
  const {
    data: programData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["program", programId],
    queryFn: () => fetchProgramById(programId),
    enabled: isOpen && programId !== "" && !isCreateMode,
    staleTime: 1000 * 60 * 5,
  });

  const [activeTab, setActiveTab] = React.useState("General");
  const [isSaving, setIsSaving] = React.useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const isWizardMode = isCreateMode;

  // Form state
  const [nameInput, setNameInput] = React.useState("");
  const [slugInput, setSlugInput] = React.useState("");
  const [descriptionInput, setDescriptionInput] = React.useState("");
  const [statusInput, setStatusInput] = React.useState("active");
  const [startDateInput, setStartDateInput] = React.useState("");
  const [endDateInput, setEndDateInput] = React.useState("");

  // Initial data for dirty checking
  const [initialData, setInitialData] = React.useState<{
    name: string;
    slug: string;
    description: string;
    status: string;
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
      await handleCreateProgram();
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

  // Create program
  const handleCreateProgram = async () => {
    try {
      setIsSaving(true);

      const payload = {
        name: nameInput,
        slug: slugInput,
        description: descriptionInput || null,
        status: statusInput,
        start_date: startDateInput || null,
        end_date: endDateInput || null,
      };

      const response = await fetch(
        `/api/programs?organization_id=${currentOrgId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        onOpenChange(false);
        queryClient.invalidateQueries({ queryKey: ["programs"] });
        resetForm();
      } else {
        const error = await response.json();
        console.error("Failed to create program:", error);
      }
    } catch (error) {
      console.error("Error creating program:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save changes (edit mode)
  const handleSaveChanges = async () => {
    if (!programId) return;

    try {
      setIsSaving(true);

      const payload = {
        name: nameInput,
        slug: slugInput,
        description: descriptionInput || null,
        status: statusInput,
        start_date: startDateInput || null,
        end_date: endDateInput || null,
      };

      const response = await fetch(`/api/programs/${programId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["programs"] });
        queryClient.invalidateQueries({ queryKey: ["program", programId] });
        // Update initial data to current values
        setInitialData({
          name: nameInput,
          slug: slugInput,
          description: descriptionInput,
          status: statusInput,
          startDate: startDateInput,
          endDate: endDateInput,
        });
      } else {
        console.error("Failed to update program");
      }
    } catch (error) {
      console.error("Error updating program:", error);
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
    setStatusInput("active");
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
      startDateInput !== initialData.startDate ||
      endDateInput !== initialData.endDate
    );
  }, [
    isCreateMode,
    nameInput,
    slugInput,
    descriptionInput,
    statusInput,
    startDateInput,
    endDateInput,
    initialData,
  ]);

  // Initialize form from data
  React.useEffect(() => {
    if (isCreateMode && !selectedProgram) {
      resetForm();
    } else if (programData) {
      setNameInput(programData.name || "");
      setSlugInput(programData.slug || "");
      setDescriptionInput(programData.description || "");
      setStatusInput(programData.status || "active");
      setStartDateInput(formatDateForInput(programData.start_date));
      setEndDateInput(formatDateForInput(programData.end_date));

      setInitialData({
        name: programData.name || "",
        slug: programData.slug || "",
        description: programData.description || "",
        status: programData.status || "active",
        startDate: formatDateForInput(programData.start_date),
        endDate: formatDateForInput(programData.end_date),
      });
    }
  }, [programData, isCreateMode, selectedProgram]);

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
            startDateInput={startDateInput}
            endDateInput={endDateInput}
          />
        );
      case "Campaigns":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Linked Campaigns</h3>
              <p className="text-muted-foreground mt-2">
                {programData?.campaigns?.length
                  ? `${programData.campaigns.length} campaigns linked`
                  : "No campaigns linked to this program yet."}
              </p>
            </div>
          </div>
        );
      case "Tiers":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Tier Definitions</h3>
              <p className="text-muted-foreground mt-2">
                {programData?.tier_definitions?.length
                  ? `${programData.tier_definitions.length} tiers defined`
                  : "No tiers defined for this program yet."}
              </p>
            </div>
          </div>
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
          {isCreateMode ? "Create New Program" : "Program Configuration"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isCreateMode
            ? "Create a new program"
            : "Configure your program settings here."}
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="pt-4">
                    {programSettings.nav
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
                    <BreadcrumbLink href="#">Programs</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {isCreateMode ? (
                        "Create New Program"
                      ) : isLoading ? (
                        <>
                          <span className="inline-block mr-2">
                            {selectedProgram?.name || "Loading Program"}
                          </span>
                          <Loader2 className="inline-block h-3 w-3 animate-spin text-muted-foreground" />
                        </>
                      ) : programData ? (
                        programData.name
                      ) : (
                        "Program"
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
                      Loading program details...
                    </p>
                  </div>
                </div>
              ) : !isCreateMode && isError ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-destructive font-medium">
                      Error loading program details
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
                          "Create Program"
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
