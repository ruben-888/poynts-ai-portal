import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("container mx-auto px-4 md:px-6", className)}
      {...props}
    />
  );
}
