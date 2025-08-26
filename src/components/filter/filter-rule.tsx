import { ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { SupplierAttribute } from "@/app/types/attribute";
import { OPERATORS } from "./constants";
import { FilterRule } from "./types";
import { useState, useRef, useCallback } from "react";

/**
 * Props for individual filter rule component
 */
interface FilterRuleProps {
  rule: FilterRule;
  attributes: SupplierAttribute[];
  onUpdate: (ruleId: string, updates: Partial<FilterRule>) => void;
  onRemove: (ruleId: string) => void;
}

/**
 * Individual filter rule component with conditional attribute selection and auto-focus management
 * - First dropdown: Base fields + "attributes" option
 * - Second dropdown: Appears only when "attributes" is selected
 * - Auto-focuses and opens next dropdown/input after each selection
 */
function FilterRuleComponent({
  rule,
  attributes,
  onUpdate,
  onRemove,
}: FilterRuleProps) {
  const [openPopover, setOpenPopover] = useState<
    "field" | "attribute" | "operator" | null
  >(null);

  // Refs for focus management
  const fieldButtonRef = useRef<HTMLButtonElement>(null);
  const attributeButtonRef = useRef<HTMLButtonElement>(null);
  const operatorButtonRef = useRef<HTMLButtonElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  // Available field options (base fields + attributes option)
  const fieldOptions = [
    { value: "skuId", label: "SKU ID", type: "base" as const },
    { value: "updatedAt", label: "Updated At", type: "base" as const },
    { value: "createdAt", label: "Created At", type: "base" as const },
    { value: "attributes", label: "Attributes", type: "attribute" as const },
  ];

  // Find the currently selected field option
  const selectedFieldOption = fieldOptions.find(
    (option) => option.value === rule.field,
  );

  // Find the selected attribute (if fieldType is "attribute")
  const selectedAttribute =
    rule.fieldType === "attribute" && rule.field !== "attributes"
      ? attributes.find((attr) => attr.key === rule.field)
      : null;

  // Find the selected operator
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
  const handleFieldSelect = (option: (typeof fieldOptions)[0]) => {
    if (option.value === "attributes") {
      handleSelection(
        {
          fieldType: "attribute",
          field: "attributes",
          displayName: "Attributes",
          value: "",
          operator: "",
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
          operator: "",
        },
        "operator",
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
        operator: "",
      },
      "operator",
      operatorButtonRef as React.RefObject<HTMLElement>,
    );
  };

  /**
   * Handles operator selection and updates the rule
   */
  const handleOperatorSelect = (operatorValue: string) => {
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
    <div className="flex items-center gap-x-2 p-3 bg-muted/30 rounded-md border">
      {/* Field Selection Popover */}
      <Popover
        open={openPopover === "field"}
        onOpenChange={(open) => setOpenPopover(open ? "field" : null)}
      >
        <PopoverTrigger asChild>
          <Button
            ref={fieldButtonRef}
            variant="outline"
            className="w-40 justify-between"
          >
            <span className="truncate">{getFieldDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-32 p-0">
          <div className="p-1">
            {fieldOptions.map((option) => (
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
              className="w-40 justify-between"
            >
              <span className="truncate">
                {selectedAttribute?.name || "Select attribute..."}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-0">
            <div className="p-1">
              {attributes.map((attribute) => (
                <button
                  key={attribute.key}
                  onClick={() => handleAttributeSelect(attribute)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{attribute.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({attribute.key})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Operator Popover */}
      <Popover
        open={openPopover === "operator"}
        onOpenChange={(open) => setOpenPopover(open ? "operator" : null)}
      >
        <PopoverTrigger asChild>
          <Button
            ref={operatorButtonRef}
            variant="outline"
            className="w-24 justify-between"
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
