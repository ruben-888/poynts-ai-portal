import React from "react";
import { Input } from "@/components/ui/input";
import { Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | number;
  onUpdate: (value: string | number) => void;
  canEdit?: boolean;
  type?: "text" | "number";
  className?: string;
  inputClassName?: string;
  displayFormatter?: (value: string | number) => React.ReactNode;
  parser?: (value: string) => string | number;
  validator?: (value: string | number) => boolean;
}

export function EditableCell({
  value,
  onUpdate,
  canEdit = true,
  type = "text",
  className,
  inputClassName,
  displayFormatter,
  parser,
  validator,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value.toString());

  const handleSubmit = () => {
    let parsedValue: string | number = inputValue;

    if (parser) {
      parsedValue = parser(inputValue);
    } else if (type === "number") {
      parsedValue = parseInt(inputValue, 10);
      if (isNaN(parsedValue as number)) {
        // Reset to original value if invalid
        setInputValue(value.toString());
        setIsEditing(false);
        return;
      }
    }

    if (validator && !validator(parsedValue)) {
      // Reset to original value if validation fails
      setInputValue(value.toString());
      setIsEditing(false);
      return;
    }

    if (parsedValue !== value) {
      onUpdate(parsedValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  // Update input value when external value changes
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  if (isEditing && canEdit) {
    return (
      <Input
        type={type}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className={cn("h-8", inputClassName)}
        autoFocus
      />
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded px-2 py-1 -mx-2 -my-1",
        canEdit ? "cursor-pointer hover:bg-muted/50" : "",
        className
      )}
      onClick={() => canEdit && setIsEditing(true)}
    >
      <span>{displayFormatter ? displayFormatter(value) : value}</span>
      {canEdit && (
        <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity text-muted-foreground" />
      )}
    </div>
  );
}
