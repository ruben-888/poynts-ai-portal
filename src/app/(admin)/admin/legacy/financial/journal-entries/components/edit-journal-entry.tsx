"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Info,
  ArrowLeftRight,
  ClipboardList,
  CreditCard,
  Clock,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Types
interface Bank {
  id: number;
  name: string;
}

interface LedgerEntry {
  id: number;
  amount: number;
  transaction_date: string;
  billing_reference: string | null;
  notes: string | null;
  provider_reference: string | null;
  reconciled: number;
  bank: Bank;
}

interface JournalEntryData {
  id: number;
  entry_date: string;
  entry_type: string;
  amount: number;
  entry_notes: string;
  from_ledger: LedgerEntry;
  to_ledger: LedgerEntry;
}

interface EditJournalEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  journalEntry?: JournalEntryData;
  banks: Bank[];
  transactionTypes: string[];
}

// Navigation items
const SIDEBAR_ITEMS = [
  {
    id: "general",
    name: "General",
    icon: ClipboardList,
    disabled: false,
  },
  {
    id: "from_ledger",
    name: "From Ledger",
    icon: CreditCard,
    disabled: false,
  },
  {
    id: "to_ledger",
    name: "To Ledger",
    icon: ArrowLeftRight,
    disabled: false,
  },
];

// Form schemas
const generalFormSchema = z.object({
  entry_type: z.string().min(1, "Transaction type is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  entry_date: z.date(),
  entry_notes: z.string().optional(),
});

const ledgerFormSchema = z.object({
  bank_id: z.string().min(1, "Bank is required"),
  amount: z.coerce.number(),
  transaction_date: z.date(),
  billing_reference: z.string().optional(),
  notes: z.string().optional(),
  provider_reference: z.string().optional(),
  reconciled: z.boolean().default(false),
});

export function EditJournalEntry({
  isOpen,
  onClose,
  onSubmit,
  journalEntry,
  banks,
  transactionTypes,
}: EditJournalEntryProps) {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [isFormChanged, setIsFormChanged] = useState(false);

  // General form
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      entry_type: journalEntry?.entry_type || "",
      amount: journalEntry?.amount || 0,
      entry_date: journalEntry?.entry_date
        ? new Date(journalEntry.entry_date)
        : new Date(),
      entry_notes: journalEntry?.entry_notes || "",
    },
  });

  // From ledger form
  const fromLedgerForm = useForm<z.infer<typeof ledgerFormSchema>>({
    resolver: zodResolver(ledgerFormSchema),
    defaultValues: {
      bank_id: journalEntry?.from_ledger?.bank?.id?.toString() || "",
      amount: journalEntry?.from_ledger?.amount || 0,
      transaction_date: journalEntry?.from_ledger?.transaction_date
        ? new Date(journalEntry.from_ledger.transaction_date)
        : new Date(),
      billing_reference: journalEntry?.from_ledger?.billing_reference || "",
      notes: journalEntry?.from_ledger?.notes || "",
      provider_reference: journalEntry?.from_ledger?.provider_reference || "",
      reconciled: journalEntry?.from_ledger?.reconciled ? true : false,
    },
  });

  // To ledger form
  const toLedgerForm = useForm<z.infer<typeof ledgerFormSchema>>({
    resolver: zodResolver(ledgerFormSchema),
    defaultValues: {
      bank_id: journalEntry?.to_ledger?.bank?.id?.toString() || "",
      amount: journalEntry?.to_ledger?.amount || 0,
      transaction_date: journalEntry?.to_ledger?.transaction_date
        ? new Date(journalEntry.to_ledger.transaction_date)
        : new Date(),
      billing_reference: journalEntry?.to_ledger?.billing_reference || "",
      notes: journalEntry?.to_ledger?.notes || "",
      provider_reference: journalEntry?.to_ledger?.provider_reference || "",
      reconciled: journalEntry?.to_ledger?.reconciled ? true : false,
    },
  });

  const handleSubmitGeneral = (values: z.infer<typeof generalFormSchema>) => {
    setIsFormChanged(false);
    toast.success("General information updated");
    // In a real implementation, this would save to the backend
    console.log("General form values:", values);
  };

  const handleSubmitFromLedger = (values: z.infer<typeof ledgerFormSchema>) => {
    setIsFormChanged(false);
    toast.success("From ledger updated");
    // In a real implementation, this would save to the backend
    console.log("From ledger form values:", values);
  };

  const handleSubmitToLedger = (values: z.infer<typeof ledgerFormSchema>) => {
    setIsFormChanged(false);
    toast.success("To ledger updated");
    // In a real implementation, this would save to the backend
    console.log("To ledger form values:", values);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <Form {...generalForm}>
              <form
                onSubmit={generalForm.handleSubmit(handleSubmitGeneral)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transaction Type */}
                  <FormField
                    control={generalForm.control}
                    name="entry_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setIsFormChanged(true);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transactionTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <FormField
                    control={generalForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              setIsFormChanged(true);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Entry Date */}
                  <FormField
                    control={generalForm.control}
                    name="entry_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Entry Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                                onClick={() => setIsFormChanged(true)}
                              >
                                {field.value ? (
                                  format(field.value, "MM/dd/yyyy")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsFormChanged(true);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={generalForm.control}
                  name="entry_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about this journal entry"
                          className="min-h-32"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setIsFormChanged(true);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      generalForm.reset();
                      setIsFormChanged(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={!isFormChanged}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );

      case "from_ledger":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>From Ledger</CardTitle>
                <CardDescription>
                  Details of the source transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...fromLedgerForm}>
                  <form
                    onSubmit={fromLedgerForm.handleSubmit(
                      handleSubmitFromLedger,
                    )}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bank */}
                      <FormField
                        control={fromLedgerForm.control}
                        name="bank_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setIsFormChanged(true);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {banks.map((bank) => (
                                  <SelectItem
                                    key={bank.id}
                                    value={bank.id.toString()}
                                  >
                                    {bank.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Amount */}
                      <FormField
                        control={fromLedgerForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="-0.00"
                                {...field}
                                onChange={(e) => {
                                  // Ensure from_ledger amount is negative
                                  const value = parseFloat(e.target.value) || 0;
                                  const negativeValue =
                                    value > 0 ? -value : value;
                                  field.onChange(negativeValue);
                                  setIsFormChanged(true);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Transaction Date */}
                      <FormField
                        control={fromLedgerForm.control}
                        name="transaction_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Transaction Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                    onClick={() => setIsFormChanged(true)}
                                  >
                                    {field.value ? (
                                      format(field.value, "MM/dd/yyyy")
                                    ) : (
                                      <span>Select date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setIsFormChanged(true);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reconciled */}
                      <FormField
                        control={fromLedgerForm.control}
                        name="reconciled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="w-4 h-4 mt-1"
                                checked={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);
                                  setIsFormChanged(true);
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Reconciled</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Mark this transaction as reconciled
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Billing Reference */}
                    <FormField
                      control={fromLedgerForm.control}
                      name="billing_reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Reference</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIsFormChanged(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Provider Reference */}
                    <FormField
                      control={fromLedgerForm.control}
                      name="provider_reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Reference</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIsFormChanged(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={fromLedgerForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any notes about this ledger entry"
                              className="min-h-20"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIsFormChanged(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          fromLedgerForm.reset();
                          setIsFormChanged(false);
                        }}
                      >
                        Reset
                      </Button>
                      <Button type="submit" disabled={!isFormChanged}>
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        );

      case "to_ledger":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>To Ledger</CardTitle>
                <CardDescription>
                  Details of the destination transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...toLedgerForm}>
                  <form
                    onSubmit={toLedgerForm.handleSubmit(handleSubmitToLedger)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bank */}
                      <FormField
                        control={toLedgerForm.control}
                        name="bank_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setIsFormChanged(true);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {banks.map((bank) => (
                                  <SelectItem
                                    key={bank.id}
                                    value={bank.id.toString()}
                                  >
                                    {bank.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Amount */}
                      <FormField
                        control={toLedgerForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  // Ensure to_ledger amount is positive
                                  const value = parseFloat(e.target.value) || 0;
                                  const positiveValue =
                                    value < 0 ? -value : value;
                                  field.onChange(positiveValue);
                                  setIsFormChanged(true);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Transaction Date */}
                      <FormField
                        control={toLedgerForm.control}
                        name="transaction_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Transaction Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                    onClick={() => setIsFormChanged(true)}
                                  >
                                    {field.value ? (
                                      format(field.value, "MM/dd/yyyy")
                                    ) : (
                                      <span>Select date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setIsFormChanged(true);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reconciled */}
                      <FormField
                        control={toLedgerForm.control}
                        name="reconciled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="w-4 h-4 mt-1"
                                checked={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);
                                  setIsFormChanged(true);
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Reconciled</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Mark this transaction as reconciled
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Billing Reference */}
                    <FormField
                      control={toLedgerForm.control}
                      name="billing_reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Reference</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIsFormChanged(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Provider Reference */}
                    <FormField
                      control={toLedgerForm.control}
                      name="provider_reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Reference</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIsFormChanged(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={toLedgerForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any notes about this ledger entry"
                              className="min-h-20"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIsFormChanged(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          toLedgerForm.reset();
                          setIsFormChanged(false);
                        }}
                      >
                        Reset
                      </Button>
                      <Button type="submit" disabled={!isFormChanged}>
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">Edit Journal Entry</DialogTitle>
        <DialogDescription className="sr-only">
          Edit journal entry details and ledger transactions.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {SIDEBAR_ITEMS.map((item, index) => (
                      <SidebarMenuItem
                        key={item.id}
                        className={index === 0 ? "mt-[30px]" : ""}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={item.id === activeTab}
                          onClick={() =>
                            !item.disabled && setActiveTab(item.id)
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
                    <BreadcrumbLink href="#">Journal Entries</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {journalEntry
                        ? `${journalEntry.entry_type} (#${journalEntry.id})`
                        : "New Journal Entry"}
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
