"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Gift, CreditCard, Users, AlertCircle, Calendar, Settings, Rocket, Coffee } from "lucide-react";

interface MetricCardData {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  description: string;
  icon: React.ReactNode;
}

interface SystemEvent {
  id: string;
  type: "redemption" | "system" | "alert" | "gift_card" | "member";
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "critical";
  status: "active" | "resolved" | "investigating";
}

interface PopularReward {
  id: string;
  name: string;
  brand: string;
  category: string;
  redemptions: number;
  totalValue: number;
  averageValue: number;
  popularityRank: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "security_update" | "meeting" | "deployment" | "maintenance";
  description: string;
  priority: "high" | "medium" | "low";
}

interface OverviewTabProps {
  metricsData: MetricCardData[];
  recentActivity: SystemEvent[];
  popularRewards: PopularReward[];
}

export function OverviewTab({ metricsData, recentActivity, popularRewards }: OverviewTabProps) {
  // Upcoming events data
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: "1",
      title: "Source C Security Update",
      date: "July 15",
      type: "security_update",
      description: "Critical security patches for Source C provider integration",
      priority: "high"
    },
    {
      id: "2", 
      title: "CP+Well Business Checkpoint",
      date: "July 16",
      time: "12:00 PM",
      type: "meeting",
      description: "Quarterly business review and progress checkpoint",
      priority: "high"
    },
    {
      id: "3",
      title: "New CARE Portal Release",
      date: "July 21",
      type: "deployment",
      description: "Major release with enhanced customer care features",
      priority: "high"
    },
    {
      id: "4",
      title: "CP+ Well Align & Design",
      date: "July 24",
      type: "meeting",
      description: "Design alignment session for upcoming features",
      priority: "medium"
    }
  ];

  const extractDayFromDate = (dateString: string) => {
    // Extract day number from "July 15" format
    const parts = dateString.split(' ');
    return parts[1] || '?';
  };

  const extractMonthFromDate = (dateString: string) => {
    // Extract month abbreviation from "July 15" format
    const parts = dateString.split(' ');
    const month = parts[0];
    return month?.substring(0, 3) || '???';
  };
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "increase": return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "decrease": return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "resolved": return "bg-gray-100 text-gray-800";
      case "investigating": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "security_update": return <Settings className="h-4 w-4 text-red-500" />;
      case "meeting": return <Coffee className="h-4 w-4 text-blue-500" />;
      case "deployment": return <Rocket className="h-4 w-4 text-green-500" />;
      case "maintenance": return <Activity className="h-4 w-4 text-orange-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getChangeIcon(metric.changeType)}
                <span>{metric.change}</span>
                <span>{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>
              Provider updates, meetings, and deployment schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start justify-between py-2 border-b last:border-0">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <Badge className={`text-xs ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                      {event.time && (
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center shadow-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase leading-none">
                        {extractMonthFromDate(event.date)}
                      </div>
                      <div className="text-lg font-bold text-gray-900 leading-none mt-0.5">
                        {extractDayFromDate(event.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {event.type === "alert" && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    {event.type === "redemption" && <Gift className="h-4 w-4 text-blue-500" />}
                    {event.type === "system" && <Activity className="h-4 w-4 text-green-500" />}
                    {event.type === "gift_card" && <CreditCard className="h-4 w-4 text-purple-500" />}
                    {event.type === "member" && <Users className="h-4 w-4 text-indigo-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{event.title}</p>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(event.status)}`}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}