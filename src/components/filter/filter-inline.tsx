"use client";

import { SupplierAttribute } from "@/app/types/attribute";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import { FilterRuleComponent } from "./filter-rule";
import { FilterRule } from "./types";

interface InlineFilterProps {
  attributes: SupplierAttribute[];
  onFilterChange: (rules: FilterRule[]) => void;
}

/**
 * Inline filter component that starts with a plus button and appends filter rule boxes
 * Each rule box contains field selection (base fields + attributes), operator, and value inputs
 * Only complete/valid rules are passed to parent component
 */
export function InlineFilter({
  attributes,
  onFilterChange,
}: InlineFilterProps) {
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [validationStates, setValidationStates] = useState<
    Record<string, boolean>
  >({});
  let ruleCounter = 0;

  /**
   * Adds a new filter rule to the end of the list
   * Starts with empty/unselected state for better UX
   */
  const addFilterRule = useCallback(() => {
    const newRule: FilterRule = {
      id: `rule-${++ruleCounter}`,
      fieldType: "base",
      field: "",
      operator: "$eq",
      value: "",
      displayName: "",
    };

    setFilterRules((prev) => [...prev, newRule]);
  }, []);

  /**
   * Removes a filter rule by ID and cleans up validation state
   */
  const removeFilterRule = useCallback((ruleId: string) => {
    setFilterRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    setValidationStates((prev) => {
      const newStates = { ...prev };
      delete newStates[ruleId];
      return newStates;
    });
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
   * Handles validation state changes from individual rules
   */
  const handleValidationChange = useCallback(
    (ruleId: string, isValid: boolean) => {
      setValidationStates((prev) => ({ ...prev, [ruleId]: isValid }));
    },
    [],
  );

  /**
   * Notifies parent component of filter changes whenever rules are updated
   * Only sends valid/complete rules to prevent filtering with incomplete data
   */
  const notifyFilterChange = useCallback(() => {
    const validRules = filterRules.filter((rule) => validationStates[rule.id]);
    onFilterChange(validRules);
  }, [filterRules, validationStates, onFilterChange]);

  // Auto-apply filters when rules or validation states change
  React.useEffect(() => {
    notifyFilterChange();
  }, [notifyFilterChange]);

  // Get counts for display
  const validRulesCount =
    Object.values(validationStates).filter(Boolean).length;
  const totalRulesCount = filterRules.length;

  return (
    <div className={`flex gap-x-2 gap-y-1 flex-wrap`}>
      {/* Filter Rules */}
      {filterRules.map((rule) => (
        <FilterRuleComponent
          key={rule.id}
          rule={rule}
          attributes={attributes}
          onUpdate={updateFilterRule}
          onRemove={removeFilterRule}
          onValidationChange={handleValidationChange}
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
      {totalRulesCount > 0 && (
        <div className="text-sm text-muted-foreground">
          {validRulesCount} of {totalRulesCount} filter rule
          {totalRulesCount !== 1 ? "s" : ""}{" "}
          {validRulesCount === 1 ? "is" : "are"} active
        </div>
      )}
    </div>
  );
}
