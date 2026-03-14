"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Brain, Mail, FileJson } from "lucide-react";

import { fetchLog } from "../../lib/api";
import type { LeadCaptureLog } from "../../lib/schemas";

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  const display = value == null || value === "" ? "--" : String(value);
  return (
    <div className="min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
        {label}
      </span>
      <div className="text-sm font-medium break-words mt-0.5">{display}</div>
    </div>
  );
}

const statusVariant = (s: string) =>
  s === "failed"
    ? "destructive"
    : s === "reward_sent"
      ? "default"
      : "secondary";

export default function LogDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: log, isLoading, isError, error } = useQuery<LeadCaptureLog>({
    queryKey: ["lead-capture-log", id],
    queryFn: () => fetchLog(id),
    enabled: !!id,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Back link + header */}
      <div className="space-y-4">
        <Link
          href="/admin/lead-capture/logs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to logs
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Lead Capture Log</h1>
          {log && (
            <>
              <Badge variant={statusVariant(log.status)} className="text-xs">
                {log.status.replace("_", " ")}
              </Badge>
              {log.first_name && (
                <span className="text-sm text-muted-foreground">
                  {log.first_name} {log.last_name} &mdash; {log.email}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load log"}
          </AlertDescription>
        </Alert>
      )}

      {/* Detail content */}
      {log && (
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <Activity className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5 text-xs">
              <Brain className="h-3.5 w-3.5" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-1.5 text-xs">
              <Mail className="h-3.5 w-3.5" />
              Delivery & Email
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-1.5 text-xs">
              <FileJson className="h-3.5 w-3.5" />
              Raw JSON
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Field
                    label="Name"
                    value={`${log.first_name || ""} ${log.last_name || ""}`.trim()}
                  />
                  <Field label="Email" value={log.email} />
                  <Field label="Phone" value={log.phone} />
                  <Field label="LinkedIn" value={log.linkedin} />
                  {log.error_message && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-destructive/70 font-medium">
                        Error
                      </span>
                      <div className="text-sm text-destructive mt-0.5">
                        {log.error_message}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Model" value={log.ai_model} />
                    <Field
                      label="Processing Time"
                      value={
                        log.ai_processing_time_ms
                          ? `${log.ai_processing_time_ms}ms`
                          : undefined
                      }
                    />
                    <Field label="Top Pick" value={log.ai_top_pick_name} />
                    <Field label="Score" value={log.ai_top_pick_score} />
                    <Field label="Archetype" value={log.archetype_name} />
                    <Field label="Code" value={log.archetype_code} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reward Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Order ID" value={log.tango_order_id} />
                    <Field label="Status" value={log.tango_order_status} />
                    <Field
                      label="Amount"
                      value={
                        log.tango_amount
                          ? `$${log.tango_amount}`
                          : undefined
                      }
                    />
                    <Field label="UTID" value={log.tango_utid} />
                    <Field label="Delivery" value={log.tango_delivery_status} />
                  </div>
                  {log.tango_error && (
                    <div className="mt-3">
                      <span className="text-[11px] uppercase tracking-wider text-destructive/70 font-medium">
                        Error
                      </span>
                      <div className="text-sm text-destructive mt-0.5">
                        {log.tango_error}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Model & Pick</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    <Field label="Model" value={log.ai_model} />
                    <Field
                      label="Processing Time"
                      value={
                        log.ai_processing_time_ms
                          ? `${log.ai_processing_time_ms}ms`
                          : undefined
                      }
                    />
                    <Field label="Top Pick" value={log.ai_top_pick_name} />
                    <Field label="Score" value={log.ai_top_pick_score} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Archetype</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Archetype" value={log.archetype_name} />
                      <Field label="Code" value={log.archetype_code} />
                    </div>
                    {log.archetype_scores &&
                      Object.keys(log.archetype_scores).length > 0 && (
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                            Scores
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {Object.entries(log.archetype_scores)
                              .sort(
                                ([, a], [, b]) =>
                                  (b as number) - (a as number),
                              )
                              .map(([k, v]) => (
                                <Badge
                                  key={k}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {k}: {v}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {log.ai_top_pick_reason && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Reason</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {log.ai_top_pick_reason}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {log.ai_ranked_list && log.ai_ranked_list.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Ranked List ({log.ai_ranked_list.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {log.ai_ranked_list.map((pick, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs text-muted-foreground w-7 shrink-0 text-right">
                              #{i + 1}
                            </span>
                            <span className="text-sm">{pick.name}</span>
                          </div>
                          <span className="font-mono text-sm text-muted-foreground ml-3 shrink-0">
                            {pick.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Delivery & Email Tab */}
          <TabsContent value="delivery">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reward Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Field label="Tango Order ID" value={log.tango_order_id} />
                  <Field label="Order Status" value={log.tango_order_status} />
                  <Field
                    label="Amount"
                    value={
                      log.tango_amount
                        ? `$${log.tango_amount}`
                        : undefined
                    }
                  />
                  <Field label="UTID" value={log.tango_utid} />
                  <Field
                    label="Delivery Status"
                    value={log.tango_delivery_status}
                  />
                  {log.tango_error && (
                    <Field label="Error" value={log.tango_error} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Persona Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Field label="Status" value={log.persona_email_status} />
                  <Field label="Sent At" value={log.persona_email_sent_at} />
                  <Field
                    label="Message ID"
                    value={log.persona_email_message_id}
                  />
                  {log.persona_email_error && (
                    <Field label="Error" value={log.persona_email_error} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">LinkedIn Enrichment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Field
                    label="Enriched"
                    value={log.linkedin_enriched ? "Yes" : "No"}
                  />
                  {log.linkedin_context && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                        Context
                      </span>
                      <p className="text-sm bg-muted p-2.5 rounded-md mt-1.5 whitespace-pre-wrap">
                        {log.linkedin_context}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Raw JSON Tab */}
          <TabsContent value="raw">
            <pre className="text-xs font-mono leading-relaxed bg-muted p-6 rounded-lg overflow-auto">
              {JSON.stringify(log, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
