"use client";

import { getAttributes } from "@/app/services/attributes";
import { SupplierAttribute } from "@/app/types/attribute";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface AttributeComboboxProps {
  value?: SupplierAttribute;
  onSelect: (attribute: SupplierAttribute) => void;
  placeholder?: string;
  className?: string;
  usedAttributeKeys?: Set<string>;
}

/**
 * Searchable attribute combobox that fetches results from API based on search query
 * Features:
 * - Real-time search with API calls
 * - Debounced search to avoid excessive API calls
 * - Displays attribute name and key
 * - Filters out already used attributes
 * - Loading state during search
 *
 * @example
 * ```tsx
 * <AttributeCombobox
 *   value={selectedAttribute}
 *   onSelect={(attr) => handleAttributeSelect(attr)}
 *   placeholder="Search attributes..."
 *   usedAttributeKeys={usedKeys}
 * />
 * ```
 */
export function AttributeCombobox({
  value,
  onSelect,
  placeholder = "Search attributes...",
  className,
  usedAttributeKeys = new Set(),
}: AttributeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributes, setAttributes] = useState<SupplierAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchAttributes = useCallback(
    async (query: string) => {
      setIsLoading(true);

      try {
        const result = await getAttributes({
          filter: query.trim()
            ? {
                key: {
                  $regex: `.*${query.trim()}.*`,
                },
              }
            : undefined,
          pagination: {
            offset: 0,
            limit: 50, // Reasonable limit for dropdown
          },
        });

        // Filter out already used attributes
        const filteredAttributes = result.data.filter(
          (attr) => !usedAttributeKeys.has(attr.key),
        );

        setAttributes(filteredAttributes);
      } catch (error) {
        console.error("Error fetching attributes:", error);
        setAttributes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [usedAttributeKeys],
  );

  // Fetch attributes when debounced search query changes
  useEffect(() => {
    if (open) {
      fetchAttributes(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, open, fetchAttributes]);

  // Load initial attributes when popover opens
  useEffect(() => {
    if (open && attributes.length === 0 && !debouncedSearchQuery) {
      fetchAttributes("");
    }
  }, [open, attributes.length, debouncedSearchQuery, fetchAttributes]);

  const handleSelect = (attribute: SupplierAttribute) => {
    onSelect(attribute);
    setOpen(false);
    setSearchQuery(""); // Reset search when selected
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-48 justify-between ", className)}
        >
          {value ? (
            <div className="text-xs truncate">{value.key}</div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className=" h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search attributes..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>No attributes found.</CommandEmpty>
                <CommandGroup>
                  {attributes.map((attribute) => (
                    <CommandItem
                      key={attribute.key}
                      value={`${attribute.name} ${attribute.key}`}
                      onSelect={() => handleSelect(attribute)}
                    >
                      <div className=" truncate  ">
                        <div className="text-sm font-medium truncate">
                          {attribute.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {attribute.key}
                        </div>
                      </div>
                      {value?.key === attribute.key && (
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            value?.key === attribute.key
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
