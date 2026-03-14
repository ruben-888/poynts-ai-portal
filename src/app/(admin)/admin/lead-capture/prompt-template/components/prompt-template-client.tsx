"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { PromptTemplateSchema, type PromptTemplate } from "../../lib/schemas";
import { fetchConfig, updateConfig } from "../../lib/api";

const PLACEHOLDERS = [
  "{{name}}",
  "{{q1}}",
  "{{q2}}",
  "{{q3}}",
  "{{q4}}",
  "{{gift_card_table}}",
  "{{linkedin_context}}",
];

export default function PromptTemplateClient() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["lead-capture-prompt-template"],
    queryFn: () => fetchConfig<PromptTemplate>("lead_capture.prompt_template"),
  });

  const form = useForm<PromptTemplate>({
    resolver: zodResolver(PromptTemplateSchema),
    defaultValues: {
      system: "",
      user: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  const onSubmit = async (values: PromptTemplate) => {
    try {
      await updateConfig("lead_capture.prompt_template", values);
      toast.success("Prompt template saved");
      queryClient.invalidateQueries({ queryKey: ["lead-capture-prompt-template"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save prompt template");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt Template</h1>
          <p className="text-muted-foreground">Configure the AI prompt used for reward matching</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["lead-capture-prompt-template"] })}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Available Placeholders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Available Placeholders</CardTitle>
          <CardDescription>Use these in your prompts to inject dynamic data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDERS.map((p) => (
              <Badge key={p} variant="secondary" className="font-mono text-xs">
                {p}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>Instructions for the AI model behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="You are a reward matching assistant..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Prompt</CardTitle>
              <CardDescription>The per-lead prompt template with placeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Match the following lead to a reward..."
                        className="min-h-[300px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Template
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
