/**
 * Lightweight client for making requests to the Datadog API.
 */
class DatadogAPIClient {
  private apiUrl = new URL("https://api.datadoghq.com/api")
  public headers: { [key: string]: string } = {
    "content-type": "application/json",
    "user-agent": "CAREPlatform-JS/0.1"
  }

  constructor(apiKey: string, appKey: string) {
    this.headers["DD-API-KEY"] = apiKey;
    this.headers["DD-APPLICATION-KEY"] = appKey;
  }

  private _client(endpoint: string, options: RequestInit): Promise<Response> {
    return fetch(new URL(endpoint, this.apiUrl), { headers: this.headers, ...options });
  }

  public incidents = {
    createIncident: (options: RequestInit) => this._client("/api/v2/incidents", { method: "POST", ...options })
  }
}

export const datadogClient = new DatadogAPIClient(
  process.env.DATADOG_API_KEY ?? "",
  process.env.DATADOG_APP_KEY ?? ""
)
