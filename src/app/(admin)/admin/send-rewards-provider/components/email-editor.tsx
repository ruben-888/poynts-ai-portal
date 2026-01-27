"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EmailEditorProps {
  onSave?: (emailData: EmailData) => void;
}

export interface EmailData {
  fromEmail: string;
  fromName: string;
  subject: string;
  message: string;
}

export function EmailEditor({ onSave }: EmailEditorProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    fromEmail: "rewards@poyntsai.com",
    fromName: "PoyntsAI Team",
    subject: "PoyntsAI team sent you {{ amount }}",
    message: `Hi {{ recipient_name }}, PoyntsAI would like to thank you. Here's {{ amount }} as a token of our appreciation.

We appreciate you taking the time to discus and demo School Journey rewards programs with the PoyntsAI team.

We look forward to reconnecting with you in the New Year and exploring what's possible with rewards and education!

Ruben, Tim, Mila, Adam and the entire team`,
  });

  const handleChange = (field: keyof EmailData, value: string) => {
    setEmailData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave?.(emailData);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left Side - Form */}
      <div className="w-1/2 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Design your email</h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 space-y-6">
          {/* Logo Section - Static */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Logo</Label>
            <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 flex items-center gap-2 justify-center">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                      P
                    </div>
                    Poynts.ai
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Hard-coded logo (no upload)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* From Name */}
          <div className="space-y-2">
            <Label htmlFor="fromName">
              Sender name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fromName"
              value={emailData.fromName}
              onChange={(e) => handleChange("fromName", e.target.value)}
              placeholder="PoyntsAI Team"
            />
          </div>

          {/* From Email */}
          <div className="space-y-2">
            <Label htmlFor="fromEmail">
              From email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fromEmail"
              type="email"
              value={emailData.fromEmail}
              onChange={(e) => handleChange("fromEmail", e.target.value)}
              placeholder="rewards@poyntsai.com"
            />
          </div>

          {/* Email Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Email subject line <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="You received a reward!"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{ amount }}"} for the reward amount
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              value={emailData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Enter your message..."
              rows={12}
              className="resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{ recipient_name }}"} and {"{{ amount }}"} as placeholders
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t mt-6">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      {/* Right Side - Preview */}
      <div className="w-1/2 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Preview</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Card className="p-8 bg-gradient-to-b from-blue-50/50 to-white">
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 text-3xl font-bold text-blue-600">
                  <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    P
                  </div>
                  Poynts.ai
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {emailData.message.split("\n").map((line, index) => {
                  // Replace variables with styled placeholders
                  const processedLine = line
                    .replace(
                      /\{\{\s*recipient_name\s*\}\}/g,
                      '<span class="text-blue-600 font-semibold">{{ recipient_name }}</span>'
                    )
                    .replace(
                      /\{\{\s*amount\s*\}\}/g,
                      '<span class="text-blue-600 font-semibold">{{ amount }}</span>'
                    );

                  return (
                    <p
                      key={index}
                      dangerouslySetInnerHTML={{ __html: processedLine || "&nbsp;" }}
                      className={line.trim() === "" ? "h-4" : ""}
                    />
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base">
                  Redeem {"{{ amount }}"}
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-xs text-gray-500 space-y-2">
                <p>
                  For any questions, contact us at{" "}
                  <a href="mailto:support@poyntsai.com" className="text-blue-600">
                    support@poyntsai.com
                  </a>
                </p>
                <p className="font-semibold">Reward ID: PREVIEW_GIFT</p>
              </div>

              {/* Legal Footer */}
              <div className="mt-6 pt-4 border-t text-xs text-gray-400 space-y-2">
                <p>
                  This reward is a gift certificate issued by participating merchants.
                </p>
                <p>
                  The reward is redeemable solely by clicking on the link above and is
                  not usable at any third-party merchant prior to such redemption.
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms
                  </a>
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
