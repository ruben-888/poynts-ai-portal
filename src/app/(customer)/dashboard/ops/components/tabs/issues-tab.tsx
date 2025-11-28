"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SuspendedIssue {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  since: string;
  affectedUsers: number;
}

interface IssuesTabProps {
  suspendedIssues: SuspendedIssue[];
}

export function IssuesTab({ suspendedIssues }: IssuesTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Suspended Issues</CardTitle>
          <CardDescription>
            Issues requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Auto-suspended rewards issue */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">5 rewards were auto-suspended</h3>
                    <Badge 
                      variant="outline" 
                      className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      medium
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The following rewards were automatically suspended due to inventory issues:
                  </p>
                  <div className="text-sm space-y-1 ml-4">
                    <div>• Amazon Gift Card - $25</div>
                    <div>• Starbucks Gift Card - $15</div>
                    <div>• Nike Gift Card - $50</div>
                    <div>• Target Gift Card - $20</div>
                    <div>• Apple Gift Card - $15</div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Since: 2 hours ago</span>
                    <span>Affected users: 127</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Investigate
                </Button>
              </div>
            </div>
            {suspendedIssues.map((issue) => (
              <div key={issue.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{issue.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={
                          issue.severity === "high" ? "bg-red-50 text-red-700 border-red-200" :
                          issue.severity === "medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Since: {issue.since}</span>
                      <span>Affected users: {issue.affectedUsers}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}