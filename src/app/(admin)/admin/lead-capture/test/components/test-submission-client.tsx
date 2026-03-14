"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Send, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WEBHOOK_URL = "/api/v1/internal/lead-capture/webhook";

const Q1_OPTIONS = [
  "Goal",
  "Recognition",
  "Freedom",
  "Balance",
  "Legacy",
  "Purpose",
  "Growth",
];

const Q2_OPTIONS = [
  "Travel, adventure, or new environments",
  "A premium purchase or upgrade",
  "Rest, recharge, or self-care",
  "Celebrating with others",
  "Diving into the next challenge",
  "Giving back or contributing",
  "Entertainment or experiences",
];

const Q3_OPTIONS = [
  "Measurable progress & forward momentum",
  "Being recognized or admired",
  "New places, people, or experiences",
  "Inner peace and sustainable energy",
  "Knowing my work creates real impact",
  "Achieving ambitious goals",
  "Community and connection",
];

interface FormValues {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

interface WebhookResponse {
  success: boolean;
  message: string;
  logId?: string;
  rewardSent?: boolean;
  rewardName?: string;
  aiScore?: number;
  personaEmailSent?: boolean;
}

export default function TestSubmissionClient() {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<WebhookResponse | null>(null);

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      utm_source: "admin_test",
      utm_medium: "manual",
      utm_campaign: "test_submission",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setLastResult(null);

    const payload = {
      contact: {
        name: values.name || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        linkedin: values.linkedin || undefined,
      },
      questions: [
        {
          sequence: 1,
          question:
            "What is driving your next level of success right now?",
          answer: values.q1,
        },
        {
          sequence: 2,
          question:
            "How do you most naturally reward yourself after progress or wins?",
          answer: values.q2,
        },
        {
          sequence: 3,
          question: "What energizes your motivation the most?",
          answer: values.q3,
        },
        {
          sequence: 4,
          question: "One word describing your next chapter",
          answer: values.q4,
        },
      ],
      utm: {
        utm_source: values.utm_source || undefined,
        utm_medium: values.utm_medium || undefined,
        utm_campaign: values.utm_campaign || undefined,
      },
      metadata: {
        submittedAt: new Date().toISOString(),
      },
    };

    const url =
      mode === "live" ? `${WEBHOOK_URL}?live=true` : WEBHOOK_URL;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success(
          mode === "live"
            ? `Live: ${result.rewardName} sent!`
            : `Test: ${result.rewardName} matched (no reward sent)`
        );
      } else {
        toast.error(result.message || "Submission failed");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Request failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Submission</h1>
        <p className="text-muted-foreground">
          Manually submit a lead capture form to test the pipeline
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Mode</CardTitle>
            <CardDescription>
              Test mode runs AI + email but skips Tango reward delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as "test" | "live")}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="test" id="mode-test" />
                <Label htmlFor="mode-test" className="cursor-pointer">
                  <span className="font-medium">Test Mode</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    AI + email only
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="live" id="mode-live" />
                <Label htmlFor="mode-live" className="cursor-pointer">
                  <span className="font-medium text-destructive">
                    Live Mode
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Sends real reward
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              At least an email or phone is needed for delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Tim Stanley"
                  {...register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tim@example.com"
                  {...register("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="9495551234"
                  {...register("phone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Handle</Label>
                <Input
                  id="linkedin"
                  placeholder="timxstanley"
                  {...register("linkedin")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survey Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Responses</CardTitle>
            <CardDescription>
              The four mindset motivation questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>
                Q1: What is driving your next level of success right now?
              </Label>
              <Select
                onValueChange={(v) => setValue("q1", v)}
                value={watch("q1")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an answer" />
                </SelectTrigger>
                <SelectContent>
                  {Q1_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Q2: How do you most naturally reward yourself after progress
                or wins?
              </Label>
              <Select
                onValueChange={(v) => setValue("q2", v)}
                value={watch("q2")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an answer" />
                </SelectTrigger>
                <SelectContent>
                  {Q2_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Q3: What energizes your motivation the most?
              </Label>
              <Select
                onValueChange={(v) => setValue("q3", v)}
                value={watch("q3")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an answer" />
                </SelectTrigger>
                <SelectContent>
                  {Q3_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Q4: One word describing your next chapter</Label>
              <Input
                placeholder="e.g. Growth, Impact, Freedom..."
                {...register("q4")}
              />
            </div>
          </CardContent>
        </Card>

        {/* UTM Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>UTM Parameters</CardTitle>
            <CardDescription>Optional tracking parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="utm_source">Source</Label>
                <Input id="utm_source" {...register("utm_source")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm_medium">Medium</Label>
                <Input id="utm_medium" {...register("utm_medium")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm_campaign">Campaign</Label>
                <Input id="utm_campaign" {...register("utm_campaign")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between">
          {mode === "live" && (
            <p className="text-sm font-medium text-destructive">
              This will send a real gift card reward
            </p>
          )}
          <div className="ml-auto">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={mode === "live" ? "destructive" : "default"}
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : mode === "live" ? (
                <Send className="mr-2 h-4 w-4" />
              ) : (
                <FlaskConical className="mr-2 h-4 w-4" />
              )}
              {mode === "live" ? "Submit (Live)" : "Submit (Test)"}
            </Button>
          </div>
        </div>
      </form>

      {/* Result */}
      {lastResult && (
        <>
          <Separator />
          <Card
            className={
              lastResult.success
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
            }
          >
            <CardHeader>
              <CardTitle className="text-lg">
                {lastResult.success ? "Success" : "Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Message:</span>{" "}
                {lastResult.message}
              </p>
              {lastResult.logId && (
                <p>
                  <span className="font-medium">Log ID:</span>{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    {lastResult.logId}
                  </code>
                </p>
              )}
              {lastResult.rewardName && (
                <p>
                  <span className="font-medium">Reward:</span>{" "}
                  {lastResult.rewardName}
                </p>
              )}
              {lastResult.aiScore !== undefined && (
                <p>
                  <span className="font-medium">AI Score:</span>{" "}
                  {lastResult.aiScore}
                </p>
              )}
              {lastResult.rewardSent !== undefined && (
                <p>
                  <span className="font-medium">Reward Sent:</span>{" "}
                  {lastResult.rewardSent ? "Yes" : "No"}
                </p>
              )}
              {lastResult.personaEmailSent !== undefined && (
                <p>
                  <span className="font-medium">Persona Email:</span>{" "}
                  {lastResult.personaEmailSent ? "Sent" : "Not sent"}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
