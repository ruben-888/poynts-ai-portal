import { UserContext } from "../_shared/types";
import { ReportedByField, SystemField } from "./(routes)/incident-report/schema";

export interface SupportItem {
  user: UserContext
}

export interface IncidentReport extends SupportItem {
  name: string;
  description: string;
  date: Date;
  time?: string;
  affectedMembers?: string;
  system: SystemField
  severity: number;
  reportedBy: ReportedByField
}

export interface IncidentReportCreateRequest {
  name: string;
  description: string;
  date: Date;
  time?: string;
  affectedMembers?: string;
  system: SystemField
  severity: number;
  reportedBy: ReportedByField;
}

export interface IncidentReportCreateResponse {
  name: string;
  description: string;
  date: Date;
  time?: string;
  affectedMembers?: string;
  system: SystemField
  severity: number;
  reportedBy: ReportedByField;
}
