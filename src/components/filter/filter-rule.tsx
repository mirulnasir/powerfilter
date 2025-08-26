import { ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { SupplierAttribute } from "@/app/types/attribute";
import { OPERATORS, CleanOperator } from "./constants";
import { FilterRule } from "./types";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FILTER_FIELD_OPTIONS } from "./constants";
import { getAvailableFieldOptions, getAvailableAttributes } from "./utils";

/**
 * Props for individual filter rule component
 */
interface FilterRuleProps {
  rule: FilterRule;
  attributes: SupplierAttribute[];
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
  attributes,
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

  const availableAttributes = useMemo(
    () => getAvailableAttributes(attributes, usedFieldKeysExcludingCurrent),
    [attributes, usedFieldKeysExcludingCurrent],
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

    if (rule.fieldType === "attribute" && rule.field === "attributes") {
      return "Select attribute...";
    }

    return rule.displayName || selectedFieldOption?.label || "Select field...";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-x-2 p-3 rounded-md border",
        isValid
          ? "bg-muted/30 border-border"
          : "bg-muted/10 border-muted-foreground/20 border-dashed",
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
            className="w-32 justify-between"
          >
            <span className="truncate">{getFieldDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-32 p-0">
          <div className="p-1">
            {availableFieldOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFieldSelect(option)}
                className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Attribute Selection Popover - Only shown when "attributes" is selected */}
      {rule.fieldType === "attribute" && rule.field === "attributes" && (
        <Popover
          open={openPopover === "attribute"}
          onOpenChange={(open) => setOpenPopover(open ? "attribute" : null)}
        >
          <PopoverTrigger asChild>
            <Button
              ref={attributeButtonRef}
              variant="outline"
              className="w-36 justify-between"
            >
              <span className="truncate">Select attribute...</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-0">
            <div className="p-1 max-h-64 overflow-y-auto">
              {availableAttributes.map((attribute) => (
                <button
                  key={attribute.key}
                  onClick={() => handleAttributeSelect(attribute)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                >
                  <span className="font-medium">{attribute.name}</span>
                  <span className="text-xs text-muted-foreground block">
                    {attribute.key}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
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
            className="w-24 justify-between items-center"
          >
            <span className="truncate font-mono">
              {selectedOperator?.symbol || "="}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-0">
          <div className="p-1">
            {OPERATORS.map((op) => (
              <button
                key={op.value + op.symbol}
                onClick={() => handleOperatorSelect(op.value)}
                className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono">{op.symbol}</span>
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
        className="flex-1"
      />

      {/* Remove Rule Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(rule.id)}
        className="shrink-0"
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}

export { FilterRuleComponent };
