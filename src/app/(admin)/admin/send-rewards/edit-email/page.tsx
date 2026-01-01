"use client";

import { EmailEditor } from "../components/email-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditEmailPage() {
  const router = useRouter();

  const handleSave = (emailData: any) => {
    console.log("Email saved:", emailData);
    // TODO: Add email sending API connection
    alert("Email template saved successfully!");
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Email</h1>
          <p className="text-muted-foreground mt-1">
            Customize your reward email template
          </p>
        </div>
      </div>

      <EmailEditor onSave={handleSave} />
    </div>
  );
}
