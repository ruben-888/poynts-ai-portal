import { IncidentReport } from "../types";
import { ReportedByField } from "../(routes)/incident-report/schema";
import { datadogClient } from './datadog-client';


export async function createIncidentReport(incident: IncidentReport): Promise<boolean> {
  // This entire mapping section is rough and should be reconsidered.
  // Remap ReportedByField values to Datadog Incident property field values.
  const detectionMethodMap = new Map([
    ["client", "Client"],
    ["customer", "customer"]
  ]);
  // Really ugly reverse lookup of string indexed enum. As zod needs to use the value anyway this is an acceptable
  // penalty as long as it remains the only occurance.
  const enumIndex = Object.keys(ReportedByField)[Object.values(ReportedByField).indexOf(incident.reportedBy)]
  const detectionMethod = detectionMethodMap.get(enumIndex) ?? "Client";

  const body = {
    data: {
      type: "incidents",
      attributes: {
        title: incident.name,
        customerImpacted: false,
        fields: {
          detection_method: {
            type: "dropdown",
            value: detectionMethod
          },
          client_description: {
            type: "textbox",
            value: `Severity: ${incident.severity}\r\nSystem: ${incident.system}\r\n`
              + `Date: ${incident.date.toISOString()}\r\n${incident.time ? `Time: ${incident.time}\r\n` : ''}`
              + `${incident.affectedMembers ? `Affected Members: ${incident.affectedMembers}\r\n` : ''}`
              + `Submitted By: ${incident.user.fullName}\r\n`
              + `${incident.description}`,
          },
        },
      },
    }
  }
  try {
    const response = await datadogClient.incidents.createIncident({
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      return true
    }
    throw Error(data?.errors ?? `Unknown error creating incident: ${response.status}`)
  } catch (error) {
    // TODO logging.
    console.error("Failed to create incident:", error);
    return false;
  };
}
