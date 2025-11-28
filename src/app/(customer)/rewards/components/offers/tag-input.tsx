"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface TagInputProps {
  selectedTags: string[];
  onTagRemove: (tag: string) => void;
  onTagAdd: (tag: string) => void;
}

export function TagInput({
  selectedTags,
  onTagRemove,
  onTagAdd,
}: TagInputProps) {
  // Simplified & more robust tag input component
  const [inputValue, setInputValue] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Fetch available tags from API
  const { data: availableTags = [], isLoading: isTagsLoading } = useQuery({
    queryKey: ["reward-tags"],
    queryFn: async () => {
      const response = await fetch("/api/rewards/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      return data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Build a list of suggestions that match the current input and are not already selected
  const suggestions = React.useMemo(() => {
    if (!inputValue.trim()) return [];
    return availableTags
      .map((t: { name: string; id: string }) => t.name)
      .filter(
        (t: string) =>
          t.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(t),
      )
      .slice(0, 10);
  }, [inputValue, selectedTags, availableTags]);

  // Helper to add a new tag
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || selectedTags.includes(trimmed)) return;
    onTagAdd(trimmed);
    setInputValue("");
  };

  // Handle key presses inside the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && inputValue === "" && selectedTags.length) {
      onTagRemove(selectedTags[selectedTags.length - 1]);
    }
  };

  return (
    <div
      className="relative flex flex-wrap items-center gap-2 rounded-md border p-2"
      onClick={() => {
        // Focus the input when the container is clicked
        const input = document.getElementById("offer-tag-input-field");
        input?.focus();
      }}
    >
      {selectedTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center">
          {tag}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => onTagRemove(tag)}
          />
        </Badge>
      ))}

      <input
        id="offer-tag-input-field"
        className="min-w-[120px] flex-grow border-none bg-transparent text-sm outline-none"
        placeholder={selectedTags.length ? "Add tag..." : "Add tags..."}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow click selection
          setTimeout(() => setShowSuggestions(false), 100);
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {suggestions.map((s: string) => (
            <div
              key={s}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
              onMouseDown={(e) => e.preventDefault() /* keep focus */}
              onClick={() => addTag(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
