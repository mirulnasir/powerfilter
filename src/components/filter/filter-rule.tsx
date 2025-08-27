"use client";
import { ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { SupplierAttribute } from "@/app/types/attribute";
import { AttributeFieldType } from "@/app/enums/attribute";
import { OPERATORS, CleanOperator } from "./constants";
import { FilterRule } from "./types";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FILTER_FIELD_OPTIONS } from "./constants";
import { getAvailableFieldOptions } from "./utils";
import { AttributeCombobox } from "./attribute-combobox";

/**
 * Props for individual filter rule component
 */
interface FilterRuleProps {
  rule: FilterRule;
  usedFieldKeys: Set<string>;
  onUpdate: (ruleId: string, updates: Partial<FilterRule>) => void;
  onRemove: (ruleId: string) => void;
  onValidationChange: (ruleId: string, isValid: boolean) => void;
}

/**
 * Validates if a filter rule is complete and ready to be applied
 * A rule is valid if:
 * - Has a field selected (not empty and not "attributes" placeholder)
 * - Has an operator selected
 * - Has a non-empty value
 */
function isValidFilterRule(rule: FilterRule): boolean {
  return !!(
    rule.field &&
    rule.field !== "attributes" &&
    rule.operator &&
    rule.value.trim()
  );
}

/**
 * Individual filter rule component with conditional attribute selection and auto-focus management
 * - First dropdown: Base fields + "attributes" option
 * - Second dropdown: Appears only when "attributes" is selected
 * - Auto-focuses and opens next dropdown/input after each selection
 * - Validates rule completeness and notifies parent of validation state changes
 */
function FilterRuleComponent({
  rule,
  usedFieldKeys,
  onUpdate,
  onRemove,
  onValidationChange,
}: FilterRuleProps) {
  const [openPopover, setOpenPopover] = useState<
    "field" | "attribute" | "operator" | null
  >(null);

  // Refs for focus management
  const fieldButtonRef = useRef<HTMLButtonElement>(null);
  const attributeButtonRef = useRef<HTMLButtonElement>(null);
  const operatorButtonRef = useRef<HTMLButtonElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const isValid = useMemo(() => isValidFilterRule(rule), [rule]);

  useEffect(() => {
    onValidationChange(rule.id, isValid);
  }, [rule.id, isValid, onValidationChange]);

  // Create a version of usedFieldKeys that excludes the current rule's field
  // This prevents the current rule from being filtered out during editing
  const usedFieldKeysExcludingCurrent = useMemo(() => {
    const filtered = new Set(usedFieldKeys);
    if (rule.field && rule.field !== "attributes") {
      filtered.delete(rule.field);
    }
    return filtered;
  }, [usedFieldKeys, rule.field]);

  const availableFieldOptions = useMemo(
    () => getAvailableFieldOptions(usedFieldKeysExcludingCurrent),
    [usedFieldKeysExcludingCurrent],
  );

  // Find the currently selected field option (search in ALL options, not just available)
  const selectedFieldOption = FILTER_FIELD_OPTIONS.find(
    (option) => option.value === rule.field,
  );

  const selectedOperator = OPERATORS.find((op) => op.value === rule.operator);

  /**
   * General handler for any selection that updates rule and focuses next step
   * @param updates - Rule updates to apply
   * @param nextPopover - Which popover to open next (null for input focus)
   * @param nextRef - Reference to focus next
   */
  const handleSelection = useCallback(
    (
      updates: Partial<FilterRule>,
      nextPopover: "field" | "attribute" | "operator" | null,
      nextRef: React.RefObject<HTMLElement>,
    ) => {
      // Close current popover and update rule
      setOpenPopover(null);
      onUpdate(rule.id, updates);

      // Focus next step after a short delay
      setTimeout(() => {
        nextRef.current?.focus();
        setOpenPopover(nextPopover);
      }, 100);
    },
    [rule.id, onUpdate],
  );

  /**
   * Handles field selection and updates the rule
   */
  const handleFieldSelect = (option: (typeof availableFieldOptions)[0]) => {
    if (option.value === "attributes") {
      handleSelection(
        {
          fieldType: "attribute",
          field: "attributes",
          displayName: "Attributes",
          value: "",
          operator: "eq", // Default to equals (clean operator)
        },
        "attribute",
        attributeButtonRef as React.RefObject<HTMLElement>,
      );
    } else {
      handleSelection(
        {
          fieldType: "base",
          field: option.value,
          displayName: option.label,
          value: "",
          operator: "eq", // Default to equals (clean operator)
        },
        "operator", // Show operator dropdown (with default selected)
        operatorButtonRef as React.RefObject<HTMLElement>,
      );
    }
  };

  /**
   * Handles attribute selection (when "attributes" was selected first)
   */
  const handleAttributeSelect = (attribute: SupplierAttribute) => {
    handleSelection(
      {
        fieldType: "attribute",
        field: attribute.key,
        displayName: attribute.name,
        value: "",
        operator: "eq", // Default to equals (clean operator)
      },
      "operator", // Show operator dropdown (with default selected)
      operatorButtonRef as React.RefObject<HTMLElement>,
    );
  };

  /**
   * Handles operator selection and updates the rule
   */
  const handleOperatorSelect = (operatorValue: CleanOperator) => {
    handleSelection(
      { operator: operatorValue },
      null,
      valueInputRef as React.RefObject<HTMLElement>,
    );
  };

  /**
   * Handles Enter key in value input to complete the filter
   */
  const handleValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Could trigger filter application or focus next rule if needed
      valueInputRef.current?.blur();
    }
  };

  // Determine what to display in the field button
  const getFieldDisplayText = () => {
    // If no field is selected yet
    if (!rule.field) {
      return "Select field...";
    }

    // If attributes category is selected but no specific attribute yet
    if (rule.fieldType === "attribute" && rule.field === "attributes") {
      return "Select attribute...";
    }

    // If a specific attribute is selected, show "Attribute" as the category
    if (rule.fieldType === "attribute" && rule.field !== "attributes") {
      return "Attribute";
    }

    // For base fields, show the field label
    return rule.displayName || selectedFieldOption?.label || "Select field...";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-x-2 px-2 py-1 h-12 rounded-md border",
        "filter-rule",
        isValid
          ? "bg-muted/30 border-border filter-rule--valid"
          : "bg-muted/10 border-muted-foreground/20 border-dashed filter-rule--invalid",
      )}
    >
      {/* Field Selection Popover */}
      <Popover
        open={openPopover === "field"}
        onOpenChange={(open) => setOpenPopover(open ? "field" : null)}
      >
        <PopoverTrigger asChild>
          <Button
            ref={fieldButtonRef}
            variant="outline"
            className={`w-32 justify-between h-full filter-rule__field-btn filter-rule__field-btn `}
          >
            <span className="truncate">{getFieldDisplayText()}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-32 p-0">
          <div
            className={`p-1 filter-rule__field-menu filter-rule__field-menu`}
          >
            {availableFieldOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFieldSelect(option)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none filter-rule__field-option filter-rule__field-option--${option.value}`}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Attribute Selection Combobox - Only shown when "attributes" is selected */}
      {rule.fieldType === "attribute" && rule.field === "attributes" && (
        <AttributeCombobox
          onSelect={handleAttributeSelect}
          placeholder="Search attributes..."
          className={`w-36 h-full filter-rule__attribute-select filter-rule__attribute-select `}
          usedAttributeKeys={usedFieldKeysExcludingCurrent}
        />
      )}

      {/* Selected Attribute Display - Only shown when specific attribute is selected */}
      {rule.fieldType === "attribute" &&
        rule.field !== "attributes" &&
        rule.field && (
          <AttributeCombobox
            value={{
              key: rule.field,
              name: rule.displayName || rule.field,
              id: rule.field,
              type: AttributeFieldType.TEXT, // Default type for display
              createdAt: 0,
              updatedAt: 0,
            }}
            onSelect={handleAttributeSelect}
            placeholder="Search attributes..."
            className={`w-36 h-full filter-rule__attribute-display filter-rule__attribute-display `}
            usedAttributeKeys={usedFieldKeysExcludingCurrent}
          />
        )}

      {/* Operator Popover - Shows with default "=" selected */}
      <Popover
        open={openPopover === "operator"}
        onOpenChange={(open) => setOpenPopover(open ? "operator" : null)}
      >
        <PopoverTrigger asChild>
          <Button
            ref={operatorButtonRef}
            variant="outline"
            className={`w-32 gap-x-2 justify-start items-center h-full filter-rule__operator-btn filter-rule__operator-btn `}
          >
            <span className="truncate font-mono w-4">
              {selectedOperator?.symbol || "="}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {selectedOperator?.label}
            </span>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-0">
          <div
            className={`p-1 filter-rule__operator-menu filter-rule__operator-menu `}
          >
            {OPERATORS.map((op) => (
              <button
                key={op.value + op.symbol}
                onClick={() => handleOperatorSelect(op.value)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none filter-rule__operator-option filter-rule__operator-option--${op.value}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono w-4">{op.symbol}</span>
                  <span className="text-xs">{op.label}</span>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Value Input */}
      <Input
        ref={valueInputRef}
        placeholder="Enter a value"
        value={rule.value}
        onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
        onKeyDown={handleValueKeyDown}
        className={`flex-1 h-full filter-rule__value-input filter-rule__value-input `}
      />

      {/* Remove Rule Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(rule.id)}
        className={`shrink-0 filter-rule__remove-btn filter-rule__remove-btn `}
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}

export { FilterRuleComponent };
