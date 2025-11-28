"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ApiRequest {
  id: number;
  request_date: string;
  direction: string;
  platform: string;
  method: string;
  endpoint: string;
  headers: string;
  body: string;
  response_code: string;
  response_headers: string;
  response_body: string;
  duration: number;
  info: string;
  reward_id: string;
  cp_transaction_reference: string;
}

interface TransactionData {
  customer_request?: string;
  customer_response?: string;
  customerRequest?: string;
  customerResponse?: string;
}

interface RequestResponseProps {
  apiRequests: ApiRequest[];
  transactionData?: TransactionData;
}

export function RequestResponse({ apiRequests, transactionData }: RequestResponseProps) {
  const [requestResponseTab, setRequestResponseTab] = React.useState("request");

  // Get customer request and response data (support both snake_case and camelCase)
  const customerRequest = transactionData?.customer_request || transactionData?.customerRequest;
  const customerResponse = transactionData?.customer_response || transactionData?.customerResponse;

  return (
    <div className="space-y-6">
      {!customerRequest && !customerResponse ? (
        <div>No customer request/response data found for this transaction.</div>
      ) : (
        <div className="space-y-4">
          <Tabs
            defaultValue="request"
            className="w-full"
            onValueChange={setRequestResponseTab}
            value={requestResponseTab}
          >
            <TabsList className="grid w-1/2 grid-cols-2">
              <TabsTrigger value="request">
                Customer API Request
              </TabsTrigger>
              <TabsTrigger value="response">
                Customer API Response
              </TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="mt-4">
              <div className="border rounded p-3 text-sm bg-gray-50 font-mono h-[500px] overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {(() => {
                    if (!customerRequest) {
                      return "No request data available";
                    }
                    try {
                      const parsed = JSON.parse(customerRequest);
                      return JSON.stringify(parsed, null, 2);
                    } catch (e) {
                      return customerRequest;
                    }
                  })()}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="response" className="mt-4">
              <div className="border rounded p-3 text-sm bg-gray-50 font-mono h-[500px] overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {(() => {
                    if (!customerResponse) {
                      return "No response data available";
                    }
                    try {
                      const parsed = JSON.parse(customerResponse);
                      return JSON.stringify(parsed, null, 2);
                    } catch (e) {
                      return customerResponse;
                    }
                  })()}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}