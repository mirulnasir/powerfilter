"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { FilterRuleComponent } from "./filter-rule";
import { FilterRule } from "./types";
import { getUsedFieldKeys } from "./utils";

interface InlineFilterProps {
  filters: FilterRule[];
  onFilterChange: (rules: FilterRule[]) => void;
}

/**
 * Inline filter component that prevents duplicate field selection
 * Each rule box contains field selection (base fields + attributes), operator, and value inputs
 * Apply button sends only valid rules and removes invalid ones from the UI
 */
export function InlineFilter({
  filters = [],
  onFilterChange,
}: InlineFilterProps) {
  const [filterRules, setFilterRules] = useState<FilterRule[]>(filters);
  const [validationStates, setValidationStates] = useState<
    Record<string, boolean>
  >({});

  console.log({ filters, filterRules });
  // Get currently used field keys to prevent duplicates
  const usedFieldKeys = getUsedFieldKeys(filterRules);

  /**
   * Adds a new filter rule to the end of the list
   * Starts with empty/unselected state for better UX
   */
  const addFilterRule = useCallback(() => {
    const newRule: FilterRule = {
      id: Date.now().toString(),
      fieldType: "base",
      field: "",
      operator: "eq", // Default to equals (clean operator)
      value: "",
      displayName: "",
    };

    setFilterRules((prev) => [...prev, newRule]);
  }, []);

  /**
   * Removes a filter rule by ID and cleans up validation state
   */
  const removeFilterRule = useCallback(
    (ruleId: string) => {
      const updatedRules = filterRules.filter((rule) => rule.id !== ruleId);
      setFilterRules(updatedRules);
      setValidationStates((prev) => {
        const newStates = { ...prev };
        delete newStates[ruleId];
        return newStates;
      });

      // Notify parent if no rules remain
      if (updatedRules.length === 0) {
        onFilterChange([]);
      }
    },
    [filterRules, onFilterChange],
  );

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
   * Applies filters by removing invalid rules and notifying parent with valid ones
   * This provides explicit control over when filters are applied
   */
  const applyFilters = useCallback(() => {
    const validRules = filterRules.filter((rule) => validationStates[rule.id]);

    const invalidRuleIds = filterRules
      .filter((rule) => !validationStates[rule.id])
      .map((rule) => rule.id);

    if (invalidRuleIds.length > 0) {
      setFilterRules((prev) =>
        prev.filter((rule) => validationStates[rule.id]),
      );
      setValidationStates((prev) => {
        const newStates = { ...prev };
        invalidRuleIds.forEach((id) => delete newStates[id]);
        return newStates;
      });
    }
    console.log("validRules", validRules);
    // Notify parent with valid rules
    onFilterChange(validRules);
  }, [filterRules, validationStates, onFilterChange]);

  // Get counts for display
  const validRulesCount =
    Object.values(validationStates).filter(Boolean).length;
  const invalidRulesCount = filterRules.length - validRulesCount;
  const totalRulesCount = filterRules.length;
  const hasInvalidRules = invalidRulesCount > 0;

  return (
    <div className={`flex gap-x-2 gap-y-1 flex-wrap py-2 px-2`}>
      {/* Filter Rules */}
      {filterRules.map((rule) => (
        <FilterRuleComponent
          key={rule.id}
          rule={rule}
          usedFieldKeys={usedFieldKeys}
          onUpdate={updateFilterRule}
          onRemove={removeFilterRule}
          onValidationChange={handleValidationChange}
        />
      ))}

      {/* Add Filter Button */}
      <Button
        variant="outline"
        onClick={addFilterRule}
        className="h-12 border-dashed hover:border-solid"
      >
        <Plus className="size-4" />
        Add Filter
      </Button>

      {totalRulesCount > 0 && (
        <Button onClick={applyFilters} className="h-12" variant={"default"}>
          Apply Filter
        </Button>
      )}

      {/* Filter Status */}
      {totalRulesCount > 0 && (
        <div className="text-xs text-muted-foreground max-w-36">
          {validRulesCount} of {totalRulesCount} filter rule
          {totalRulesCount !== 1 ? "s" : ""}{" "}
          {validRulesCount === 1 ? "is" : "are"} valid
          {hasInvalidRules && (
            <span className="text-destructive ml-1">
              ({invalidRulesCount} will be removed)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
