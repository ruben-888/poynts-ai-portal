import { z } from "zod"
import { UserContext } from "@/app/api/_shared/types";
import { IncidentReport, IncidentReportCreateRequest, IncidentReportCreateResponse } from "../../types";

export enum ReportedByField {
  client = "Well (internal)",
  customer = "Customer"
};

export enum SystemField {
  portal = "CARE Portal",
  api = "API",
  other = "Other"
};

export const incidentReportCreateSchema = z.object({
  name: z.string().trim().min(8).max(64),
  description: z.string().trim().min(20),
  date: z.coerce.date()
    .refine((date) => date >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), { message: "Date must be within last year" })
    .refine((date) => date <= new Date(), { message: "Date is in the future" }),
  time: z.string().optional(),
  affectedMembers: z.string().optional(),
  system: z.nativeEnum(SystemField),
  severity: z.coerce.number().gt(0).lte(4),
  reportedBy: z.nativeEnum(ReportedByField)
});

export const mapIncidentReportFromCreateRequest = (createRequest: IncidentReportCreateRequest, user: UserContext): IncidentReport => {
  return {
    name: createRequest.name,
    description: createRequest.description,
    date: createRequest.date,
    time: createRequest.time,
    affectedMembers: createRequest.affectedMembers,
    system: createRequest.system,
    severity: createRequest.severity,
    reportedBy: createRequest.reportedBy,
    user: user
  }
};

export const mapCreateResponseFromIncidentReport = (incidentReport: IncidentReport): IncidentReportCreateResponse => {
  return {
    name: incidentReport.name,
    description: incidentReport.description,
    date: incidentReport.date,
    time: incidentReport.time,
    affectedMembers: incidentReport.affectedMembers,
    system: incidentReport.system,
    severity: incidentReport.severity,
    reportedBy: incidentReport.reportedBy,
  }
};
