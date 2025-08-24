"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterIcon, Plus, X, ChevronDown } from "lucide-react";
import { SupplierAttribute } from "@/app/types/attribute";
import { Text } from "../ui/typography";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Filter rule interface for managing individual filter conditions
 */
export interface FilterRule {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

/**
 * Filter configuration interface for managing the entire filter state
 * - We keep separate draft vs applied rules so filters only affect the view after explicit Apply.
 */
export interface FilterConfig {
  draftRules: FilterRule[];
  appliedRules: FilterRule[];
  isOpen: boolean;
}

/**
 * Props for the Filter component
 */
interface FilterProps {
  attributes: SupplierAttribute[];
  onFilterChange: (rules: FilterRule[]) => void;
  className?: string;
}

/**
 * Available comparison operators for filtering
 */
const OPERATORS = [
  { value: "$eq", label: "equals", symbol: "=" },
  { value: "$ne", label: "not equal", symbol: "<>" },
  { value: "$gt", label: "greater than", symbol: ">" },
  { value: "$lt", label: "less than", symbol: "<" },
  { value: "$gte", label: "greater than or equal", symbol: ">=" },
  { value: "$lte", label: "less than or equal", symbol: "<=" },
  { value: "$regex", label: "like operator", symbol: "~~" },
  { value: "$regex", label: "ilike operator", symbol: "~~*" },
  { value: "$in", label: "one of a list of values", symbol: "in" },
  { value: "$exists", label: "is checking for (null,not null)", symbol: "is" },
];

/**
 * Shallow equality for ordered rules to detect draft edits vs applied rules.
 */
function areRulesEqual(a: FilterRule[], b: FilterRule[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((rule, idx) => {
    const other = b[idx];
    if (!other) return false;
    return (
      rule.id === other.id &&
      rule.attribute === other.attribute &&
      rule.operator === other.operator &&
      rule.value === other.value
    );
  });
}

/**
 * Filter component that provides a dropdown interface for creating and managing filter rules
 * Uses Popover for positioning and accessibility
 */
export function Filter({ attributes, onFilterChange, className }: FilterProps) {
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    draftRules: [],
    appliedRules: [],
    isOpen: false,
  });

  /**
   * Adds a new filter rule to the top of the list (draft only)
   */
  const addFilterRule = useCallback(() => {
    const newRule: FilterRule = {
      id: crypto.randomUUID(),
      attribute: attributes[0]?.key || "",
      operator: "$eq",
      value: "",
    };

    setFilterConfig((prev) => ({
      ...prev,
      draftRules: [newRule, ...prev.draftRules],
    }));
  }, [attributes]);

  /**
   * Removes a filter rule by ID (draft only)
   */
  const removeFilterRule = useCallback((ruleId: string) => {
    setFilterConfig((prev) => ({
      ...prev,
      draftRules: prev.draftRules.filter((rule) => rule.id !== ruleId),
    }));
  }, []);

  /**
   * Updates a specific filter rule (draft only)
   */
  const updateFilterRule = useCallback(
    (ruleId: string, updates: Partial<FilterRule>) => {
      setFilterConfig((prev) => ({
        ...prev,
        draftRules: prev.draftRules.map((rule) =>
          rule.id === ruleId ? { ...rule, ...updates } : rule,
        ),
      }));
    },
    [],
  );

  /**
   * Applies the current draft filter rules and closes the popover
   * - We update appliedRules and notify parent; this is the only time filters affect the view.
   */
  const applyFilter = useCallback(() => {
    setFilterConfig((prev) => {
      const nextApplied = prev.draftRules;
      onFilterChange(nextApplied);
      return { ...prev, appliedRules: nextApplied, isOpen: false };
    });
  }, [onFilterChange]);

  const appliedRulesCount = filterConfig.appliedRules.length;
  const isEditing =
    filterConfig.isOpen &&
    !areRulesEqual(filterConfig.draftRules, filterConfig.appliedRules);

  return (
    <div className={className}>
      <Popover
        open={filterConfig.isOpen}
        onOpenChange={(open) =>
          setFilterConfig((prev) => ({
            ...prev,
            isOpen: open,
            // When opening, reset drafts to what's already applied so edits don't auto-apply
            draftRules: open ? [...prev.appliedRules] : prev.draftRules,
          }))
        }
      >
        <PopoverTrigger asChild>
          <Button variant={appliedRulesCount > 0 ? "default" : "outline"}>
            <FilterIcon className="size-4" />
            {appliedRulesCount > 0
              ? `Filtered by ${appliedRulesCount} rule${appliedRulesCount !== 1 ? "s" : ""}`
              : "Filter"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96 p-0 py-2 space-y-2 leading-none">
          {!isEditing && (
            <div className="space-y-1 px-3">
              <Text variant="h5">
                {appliedRulesCount === 0
                  ? "No filters applied to this view"
                  : `${appliedRulesCount} filter rule${appliedRulesCount !== 1 ? "s" : ""} applied`}
              </Text>
              {appliedRulesCount === 0 && (
                <Text variant="extraSmall" className="text-muted-foreground">
                  Add a column below to filter the view
                </Text>
              )}
            </div>
          )}

          {/* Filter Rules (draft) */}
          {filterConfig.draftRules.map((rule) => {
            const selectedAttribute = attributes.find(
              (attr) => attr.key === rule.attribute,
            );
            const selectedOperator = OPERATORS.find(
              (op) => op.value === rule.operator,
            );

            return (
              <div
                key={rule.id}
                className="flex items-center gap-x-1 mb-3 px-3 bg-muted/30 rounded-md"
              >
                {/* Attribute Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-32 justify-between">
                      <span className="truncate">
                        {selectedAttribute?.name || "Select..."}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {attributes.map((attr) => (
                      <DropdownMenuItem
                        key={attr.key}
                        onClick={() =>
                          updateFilterRule(rule.id, { attribute: attr.key })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{attr.name}</span>
                          {attr.type && (
                            <span className="text-xs text-muted-foreground">
                              {attr.type.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Operator Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-24 justify-between">
                      <span className="truncate font-mono">
                        {selectedOperator?.symbol || "="}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {OPERATORS.map((op) => (
                      <DropdownMenuItem
                        key={op.value + op.symbol}
                        onClick={() =>
                          updateFilterRule(rule.id, { operator: op.value })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{op.symbol}</span>
                          <span className="text-xs">{op.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Value Input */}
                <Input
                  placeholder="Enter a value"
                  value={rule.value}
                  onChange={(e) =>
                    updateFilterRule(rule.id, { value: e.target.value })
                  }
                  className="flex-1"
                />

                {/* Remove Rule Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFilterRule(rule.id)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            );
          })}
          <Separator />

          <div className="flex justify-between px-3">
            {/* Add Filter Button */}
            <Button variant="ghost" onClick={addFilterRule}>
              <Plus className="size-3.5" />
              Add filter
            </Button>

            {/* Apply Filter Button */}
            <div className="flex justify-end">
              <Button onClick={applyFilter} variant="secondary">
                Apply filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
