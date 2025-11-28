"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

// Form schema
const formSchema = z.object({
  transactionType: z.string().min(1, "Transaction type is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  fromBank: z.string().min(1, "Source bank is required"),
  fromDate: z.date(),
  toBank: z.string().min(1, "Destination bank is required"),
  toDate: z.date(),
  notes: z.string().optional(),
}).refine(
  (data) => data.fromBank !== data.toBank,
  {
    message: "Source and destination banks must be different",
    path: ["toBank"], // This will show the error on the toBank field
  }
);

type FormValues = z.infer<typeof formSchema>;

interface AddJournalEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  banks: { id: number; name: string }[];
  transactionTypes: string[];
  editMode?: boolean;
  entry?: {
    id: number;
    entry_date: string;
    entry_type: string;
    amount: number;
    entry_notes: string;
    from_ledger: {
      id: number;
      amount: number;
      transaction_date: string;
      bank: { id: number; name: string };
    };
    to_ledger: {
      id: number;
      amount: number;
      transaction_date: string;
      bank: { id: number; name: string };
    };
  };
}

export function AddJournalEntry({
  isOpen,
  onClose,
  onSubmit,
  banks,
  transactionTypes,
  editMode = false,
  entry,
}: AddJournalEntryProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editMode && entry ? {
      transactionType: entry.entry_type || "",
      amount: entry.amount || 0,
      fromBank: entry.from_ledger.bank.id.toString(),
      fromDate: new Date(entry.from_ledger.transaction_date),
      toBank: entry.to_ledger.bank.id.toString(),
      toDate: new Date(entry.to_ledger.transaction_date),
      notes: entry.entry_notes || "",
    } : {
      transactionType: "",
      amount: 0,
      fromBank: "",
      fromDate: new Date(),
      toBank: "",
      toDate: new Date(),
      notes: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    const submitData = editMode && entry ? { ...values, id: entry.id } : values;
    onSubmit(submitData);
    if (!editMode) {
      form.reset();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editMode ? "Edit" : "Add"} Journal Entry
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Transaction Type and Amount - Full Width */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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

              <FormField
                control={form.control}
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
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Debit and Credit Side-by-Side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Debit (Source) Column */}
              <div className="space-y-4">
                <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">
                  Debit (Source)
                </div>
                
                <FormField
                  control={form.control}
                  name="fromBank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Bank</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source bank" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem 
                              key={bank.id} 
                              value={bank.id.toString()}
                              disabled={bank.id.toString() === form.watch("toBank")}
                            >
                              {bank.name}
                              {bank.id.toString() === form.watch("toBank") && " (Selected in Credit)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MM/dd/yyyy, hh:mm a")
                              ) : (
                                <span>Select date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Credit (Destination) Column */}
              <div className="space-y-4">
                <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">
                  Credit (Destination)
                </div>
                
                <FormField
                  control={form.control}
                  name="toBank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Bank</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination bank" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem 
                              key={bank.id} 
                              value={bank.id.toString()}
                              disabled={bank.id.toString() === form.watch("fromBank")}
                            >
                              {bank.name}
                              {bank.id.toString() === form.watch("fromBank") && " (Selected in Debit)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MM/dd/yyyy, hh:mm a")
                              ) : (
                                <span>Select date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes - Full Width */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes about this transaction"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button type="submit">{editMode ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
