"use client";

import { SupplierAttribute } from "@/app/types/attribute";
import { Product } from "@/app/types/product";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import { OPERATORS } from "./constants";
import { FilterRuleComponent } from "./filter-rule";

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
 * Props for the InlineFilter component
 */
interface InlineFilterProps {
  attributes: SupplierAttribute[];
  onFilterChange: (rules: FilterRule[]) => void;
}

type ProductFilterKeys = keyof Omit<Product, "id">;
const productFilterKeys: ProductFilterKeys[] = [
  "skuId",
  "updatedAt",
  "createdAt",
  "attributes",
];

/**
 * Inline filter component that starts with a plus button and appends filter rule boxes
 * Each rule box contains attribute, operator, and value inputs
 */
export function InlineFilter({
  attributes,
  onFilterChange,
}: InlineFilterProps) {
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

  /**
   * Adds a new filter rule to the end of the list
   */
  const addFilterRule = useCallback(() => {
    const newRule: FilterRule = {
      id: crypto.randomUUID(),
      attribute: attributes[0]?.key || "",
      operator: "$eq",
      value: "",
    };

    setFilterRules((prev) => [...prev, newRule]);
  }, [attributes]);

  /**
   * Removes a filter rule by ID
   */
  const removeFilterRule = useCallback((ruleId: string) => {
    setFilterRules((prev) => prev.filter((rule) => rule.id !== ruleId));
  }, []);

  /**
   * Updates a specific filter rule
   */
  const updateFilterRule = useCallback(
    (ruleId: string, updates: Partial<FilterRule>) => {
      setFilterRules((prev) =>
        prev.map((rule) =>
          rule.id === ruleId ? { ...rule, ...updates } : rule,
        ),
      );
    },
    [],
  );

  /**
   * Notifies parent component of filter changes whenever rules are updated
   */
  const notifyFilterChange = useCallback(() => {
    onFilterChange(filterRules);
  }, [filterRules, onFilterChange]);

  // Auto-apply filters when rules change
  React.useEffect(() => {
    notifyFilterChange();
  }, [notifyFilterChange]);

  return (
    <div className={`flex gap-x-2 gap-y-1 flex-wrap`}>
      {/* Filter Rules */}
      {filterRules.map((rule) => (
        <FilterRuleComponent
          key={rule.id}
          rule={rule}
          attributes={attributes}
          productFilterKeys={productFilterKeys}
          operators={OPERATORS}
          onUpdate={updateFilterRule}
          onRemove={removeFilterRule}
        />
      ))}

      {/* Add Filter Button */}
      <Button
        variant="outline"
        onClick={addFilterRule}
        className="h-14 border-dashed hover:border-solid"
      >
        <Plus className="size-4" />
        Add Filter
      </Button>

      {/* Filter Status */}
      {filterRules.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {filterRules.length} filter rule{filterRules.length !== 1 ? "s" : ""}{" "}
          applied
        </div>
      )}
    </div>
  );
}
