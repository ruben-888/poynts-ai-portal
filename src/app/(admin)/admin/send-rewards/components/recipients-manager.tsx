"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Upload, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Recipient {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  language: string;
}

interface RecipientsManagerProps {
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
}

export function RecipientsManager({ recipients, onChange }: RecipientsManagerProps) {
  const [newRecipient, setNewRecipient] = useState({
    name: "",
    email: "",
    amount: "",
    currency: "USD",
    language: "",
  });

  const subtotal = recipients.reduce((sum, r) => sum + r.amount, 0);

  const handleAddRecipient = () => {
    if (!newRecipient.name || !newRecipient.email || !newRecipient.amount) {
      return;
    }

    const recipient: Recipient = {
      id: Date.now().toString(),
      name: newRecipient.name,
      email: newRecipient.email,
      amount: parseFloat(newRecipient.amount),
      currency: newRecipient.currency,
      language: newRecipient.language,
    };

    onChange([...recipients, recipient]);

    // Reset form
    setNewRecipient({
      name: "",
      email: "",
      amount: "",
      currency: "USD",
      language: "",
    });
  };

  const handleRemoveRecipient = (id: string) => {
    onChange(recipients.filter((r) => r.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recipients</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV or spreadsheet
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="font-medium">Rows:</span> {recipients.length}
        </div>
        <div>
          <span className="font-medium">Subtotal:</span> ${subtotal.toFixed(2)} USD
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_auto] gap-3 pb-2 border-b text-sm font-medium">
        <div>
          Recipient name <span className="text-red-500">*</span>
        </div>
        <div>
          Recipient email <span className="text-red-500">*</span>
        </div>
        <div>
          Amount <span className="text-red-500">*</span>
        </div>
        <div>Currency code</div>
        <div>Language</div>
        <div className="w-10"></div>
      </div>

      {/* Recipient Rows */}
      {recipients.map((recipient) => (
        <div
          key={recipient.id}
          className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_auto] gap-3 items-center"
        >
          <div className="text-sm">{recipient.name}</div>
          <div className="text-sm">{recipient.email}</div>
          <div className="text-sm">${recipient.amount.toFixed(2)}</div>
          <div className="text-sm">{recipient.currency}</div>
          <div className="text-sm">{recipient.language || "—"}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveRecipient(recipient.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      ))}

      {/* Add Recipient Form */}
      <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_auto] gap-3 items-end">
        <div>
          <Input
            placeholder="Enter name"
            value={newRecipient.name}
            onChange={(e) =>
              setNewRecipient({ ...newRecipient, name: e.target.value })
            }
            onKeyPress={handleKeyPress}
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Enter email"
            value={newRecipient.email}
            onChange={(e) =>
              setNewRecipient({ ...newRecipient, email: e.target.value })
            }
            onKeyPress={handleKeyPress}
          />
        </div>
        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={newRecipient.amount}
              onChange={(e) =>
                setNewRecipient({ ...newRecipient, amount: e.target.value })
              }
              onKeyPress={handleKeyPress}
              className="pl-6"
            />
          </div>
        </div>
        <div>
          <Select
            value={newRecipient.currency}
            onValueChange={(value) =>
              setNewRecipient({ ...newRecipient, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={newRecipient.language}
            onValueChange={(value) =>
              setNewRecipient({ ...newRecipient, language: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAddRecipient}
          disabled={
            !newRecipient.name || !newRecipient.email || !newRecipient.amount
          }
          className="h-9 w-20"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {recipients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No recipients added yet. Enter recipient information above to get started.
        </div>
      )}
    </div>
  );
}
