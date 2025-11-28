"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

import { BaseTabProps } from "./types";

interface ReviewTabProps extends BaseTabProps {
  // General tab data
  brandNameInput: string;
  titleInput: string;
  poyntsInput: string;
  valueInput: string;
  selectedTags: string[];
  statusInput: string;
  imageUrlInput: string;
  
  // Details tab data
  languageInput: string;
  redemptionUrlInput: string;
  customIdInput: string;
  rebateValueInput: string;
  startDateInput: string;
  endDateInput: string;
  
  // Description tab data
  shortDescriptionInput: string;
  longDescriptionInput: string;
  instructionsInput: string;
  
  // Legal tab data
  termsInput: string;
  disclaimerInput: string;
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Helper function to format date for display
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

export function ReviewTab({
  offerData,
  selectedOffer,
  isCreateMode = false,
  canManageRewards,
  
  // General tab data
  brandNameInput,
  titleInput,
  poyntsInput,
  valueInput,
  selectedTags,
  statusInput,
  imageUrlInput,
  
  // Details tab data
  languageInput,
  redemptionUrlInput,
  customIdInput,
  rebateValueInput,
  startDateInput,
  endDateInput,
  
  // Description tab data
  shortDescriptionInput,
  longDescriptionInput,
  instructionsInput,
  
  // Legal tab data
  termsInput,
  disclaimerInput,
}: ReviewTabProps) {
  // State for managing expanded/collapsed content
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Component for rendering expandable text with HTML support
  const ExpandableText = ({ 
    text, 
    maxLength, 
    itemKey, 
    fallback = "Not specified" 
  }: { 
    text: string; 
    maxLength: number; 
    itemKey: string; 
    fallback?: string; 
  }) => {
    const displayText = text || fallback;
    const isExpanded = expandedItems[itemKey];
    const isTruncated = displayText.length > maxLength;
    const shouldTruncate = isTruncated && !isExpanded;

    return (
      <div>
        <div className="text-sm">
          {shouldTruncate ? (
            <>
              <span 
                dangerouslySetInnerHTML={{ 
                  __html: displayText.substring(0, maxLength) + "..." 
                }} 
              />
              {" "}
              <button
                onClick={() => toggleExpanded(itemKey)}
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Show more
              </button>
            </>
          ) : (
            <>
              <span 
                dangerouslySetInnerHTML={{ 
                  __html: displayText 
                }} 
              />
              {isTruncated && (
                <>
                  {" "}
                  <button
                    onClick={() => toggleExpanded(itemKey)}
                    className="text-sm text-muted-foreground hover:text-gray-600"
                  >
                    Show less
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="mb-8 flex justify-between items-start">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground block mb-1">Title</label>
          <p className="font-medium text-lg">{titleInput || "Offer Title"}</p>
        </div>
        
        <div className="ml-6">
          <label className="text-sm font-medium text-muted-foreground block mb-1">Brand</label>
          <p className="font-medium text-lg">{brandNameInput || "Not specified"}</p>
        </div>
        
        <div className="ml-6 space-y-3">
          {redemptionUrlInput && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Redemption URL</label>
              <p className="font-medium text-sm break-all">{truncateText(redemptionUrlInput, 30)}</p>
            </div>
          )}
          
          {customIdInput && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Custom ID</label>
              <p className="font-medium text-sm">{customIdInput}</p>
            </div>
          )}
          
          {rebateValueInput && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Rebate Value</label>
              <p className="font-medium text-sm">${rebateValueInput}</p>
            </div>
          )}
          
        </div>
      </div>

      {/* General Information - Horizontal Layout */}
      <div className="grid grid-cols-7 gap-6 mb-8">
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">Poynts</label>
          <p className="font-medium text-lg">{poyntsInput || "0"}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">Value</label>
          <p className="font-medium text-lg">${valueInput || "0"}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">Language</label>
          <p className="font-medium text-lg">{languageInput || "EN"}</p>
        </div>
        
        {selectedTags.length > 0 ? (
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Tags</label>
            <p className="font-medium text-lg">-</p>
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">Start Date</label>
          <p className="font-medium text-lg">{formatDateForDisplay(startDateInput)}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">End Date</label>
          <p className="font-medium text-lg">{formatDateForDisplay(endDateInput)}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">Status</label>
          <p className="font-medium text-lg capitalize">{statusInput}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Content */}
        <div className="flex-1 lg:w-3/4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Short Description</label>
                <ExpandableText 
                  text={shortDescriptionInput} 
                  maxLength={150} 
                  itemKey="shortDescription" 
                />
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <ExpandableText 
                  text={longDescriptionInput} 
                  maxLength={200} 
                  itemKey="longDescription" 
                />
              </div>
              
              {instructionsInput && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                    <ExpandableText 
                      text={instructionsInput} 
                      maxLength={150} 
                      itemKey="instructions"
                      fallback=""
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Legal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Terms & Conditions</label>
                <ExpandableText 
                  text={termsInput} 
                  maxLength={150} 
                  itemKey="terms"
                  fallback="-"
                />
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Disclaimer</label>
                <ExpandableText 
                  text={disclaimerInput} 
                  maxLength={150} 
                  itemKey="disclaimer"
                  fallback="-"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:w-1/4 space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              {imageUrlInput ? (
                <Image
                  src={imageUrlInput}
                  alt={`${titleInput || "Offer"} Preview`}
                  width={300}
                  height={200}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="w-full h-[200px] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="text-4xl mb-2 text-muted-foreground/40">📷</div>
                    <p className="text-sm text-muted-foreground font-medium">No image available</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Enter an image URL</p>
                  </div>
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Offer Preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
