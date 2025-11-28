"use client"

import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { incidentReportCreateSchema, SystemField, ReportedByField } from "@/app/api/support/(routes)/incident-report/schema";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


const severityOptions: {
  [key: number]: string
} = {
  1: "P1: Show Stopper",
  2: "P2: Work Around Exists",
  3: "P3: Limited Impact"
}

export function IncidentReportForm() {
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof incidentReportCreateSchema>>({
    resolver: zodResolver(incidentReportCreateSchema),
    mode: "onChange",
  });

  const IncidentSubmitted: FunctionComponent = () => (
    <div className="m-auto w-half min-w-96 max-w-1/2 mt-8">
      <p className="text-center text-4xl text-balance">Your incident report has been received and will be reviewed shortly.</p>
    </div>
  );

  async function submitIncidentReport(values: z.infer<typeof incidentReportCreateSchema>) {
    setFormSubmitting(true);
    try {
      const response = await fetch("/api/support/incident-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json()
      if (response.ok) {
        setFormSubmitted(true);
      } else {
        toast.error(data?.error ?? "Failed to create incident report.");
      }
    } catch (error) {
      // TODO logging
      console.error("Failed to create incident report:", error)
      toast.error("Failed to create incident report.");
    }
    setFormSubmitting(false);
  }

  return formSubmitted ? <IncidentSubmitted /> : (
    <div className="m-auto w-half min-w-96 max-w-1/2">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Report an Incident</h2>
        <p className="text-muted-foreground">
          Submit details about system issues or technical problems for immediate review by our support team.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitIncidentReport)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Add title here" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        required
                        onValueChange={(value) => form.setValue("system", value as SystemField)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select system" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(SystemField).map(key => (<SelectItem key={key} value={SystemField[key as keyof typeof SystemField]}>{SystemField[key as keyof typeof SystemField]}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      {/*
                       // @ts-expect-error Zod schema includes type coercion of string to number. */}
                      <Select
                        {...field}
                        required
                        // @ts-expect-error Zod schema includes type coercion of string to number.
                        onValueChange={(value) => form.setValue("severity", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(severityOptions).map(key => (<SelectItem key={key} value={key}>{severityOptions[Number(key)]}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Start Date</FormLabel>
                    <FormControl>
                      {/*
                       // @ts-expect-error Zod schema includes type coercion of string to Date. */}
                      <Input
                        type="date"
                        className="w-40 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        step="1"
                        className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="affectedMembers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Affected Members (Internal Well Member ID)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter member IDs separated by commas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="max-w-64">
            <FormField
              control={form.control}
              name="reportedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reported By <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      required
                      onValueChange={(value) => form.setValue("reportedBy", value as ReportedByField)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selected reporting party" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(ReportedByField).map(key => (<SelectItem key={key} value={ReportedByField[key as keyof typeof ReportedByField]}>{ReportedByField[key as keyof typeof ReportedByField]}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={formSubmitting || !form.formState.isValid}>Submit</Button>
        </form>
      </Form>
    </div>
  )
}
