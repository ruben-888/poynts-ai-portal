"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Zap, Activity, Clock } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "critical" | "major" | "minor" | "maintenance";
  createdAt: string;
  updatedAt: string;
  affectedServices: string[];
  updates: {
    timestamp: string;
    message: string;
    status: string;
  }[];
}

interface IncidentsTabProps {
  incidents: Incident[];
}

export function IncidentsTab({ incidents }: IncidentsTabProps) {
  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "major": return "bg-orange-100 text-orange-800 border-orange-200";
      case "minor": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "maintenance": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case "investigating": return "bg-red-100 text-red-800";
      case "identified": return "bg-orange-100 text-orange-800";
      case "monitoring": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIncidentStatusIcon = (status: string) => {
    switch (status) {
      case "investigating": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "identified": return <Zap className="h-4 w-4 text-orange-500" />;
      case "monitoring": return <Activity className="h-4 w-4 text-yellow-500" />;
      case "resolved": return <Activity className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>System Incidents</CardTitle>
          <CardDescription>
            Incidents tracked through status page and monitored via Datadog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {incidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getIncidentStatusIcon(incident.status)}
                      <h3 className="font-semibold">{incident.title}</h3>
                      <Badge variant="outline" className={getIncidentSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline" className={getIncidentStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>ID: {incident.id}</span>
                      <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                      <span>Updated: {new Date(incident.updatedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">Affected Services:</span>
                      <div className="flex flex-wrap gap-1">
                        {incident.affectedServices.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
                
                {/* Incident Updates Timeline */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Status Updates</h4>
                  <div className="space-y-3">
                    {incident.updates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIncidentStatusIcon(update.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`text-xs ${getIncidentStatusColor(update.status)}`}>
                              {update.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(update.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}