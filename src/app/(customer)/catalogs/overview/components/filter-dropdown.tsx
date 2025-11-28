import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FilterProps<T extends { id: number | string; name: string }> {
  title: string
  items: T[]
  selectedItems: Set<T["id"]>
  onChange: (selected: Set<T["id"]>) => void
}

export const FilterDropdown = React.memo(function FilterDropdown<T extends { id: number | string; name: string }>({ 
  title, 
  items, 
  selectedItems, 
  onChange 
}: FilterProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          {title}
          {selectedItems?.size > 0 && selectedItems.size < items.length && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal"
            >
              {selectedItems.size}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px] p-2" align="end">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange(new Set())}
          >
            Clear All
          </Button>
        </div>
        <div className="h-px bg-muted mb-2" />
        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={selectedItems.has(item.id)}
            onCheckedChange={(checked) => {
              const newSelected = new Set(selectedItems);
              if (checked) {
                newSelected.add(item.id);
              } else {
                newSelected.delete(item.id);
              }
              onChange(newSelected);
            }}
          >
            {item.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
