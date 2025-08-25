import { ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { SupplierAttribute } from "@/app/types/attribute";
import { FilterRule } from "./filter-inline";
import { OPERATORS } from "./constants";

/**
 * Props for individual filter rule component
 */
interface FilterRuleProps {
  rule: FilterRule;
  attributes: SupplierAttribute[];
  productFilterKeys: string[];
  operators: typeof OPERATORS;
  onUpdate: (ruleId: string, updates: Partial<FilterRule>) => void;
  onRemove: (ruleId: string) => void;
}
/**
 * Individual filter rule component with independent state management
 */
function FilterRuleComponent({
  rule,
  attributes,
  productFilterKeys,
  operators,
  onUpdate,
  onRemove,
}: FilterRuleProps) {
  const selectedAttribute = attributes.find(
    (attr) => attr.key === rule.attribute,
  );
  const selectedOperator = operators.find((op) => op.value === rule.attribute);

  return (
    <div className="flex items-center gap-x-2 p-3 bg-muted/30 rounded-md border">
      {/* Attribute Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-32 justify-between">
            <span className="truncate">
              {selectedAttribute?.key || "Select..."}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {productFilterKeys.map((key) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onUpdate(rule.id, { attribute: key })}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{key}</span>
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
          {operators.map((op) => (
            <DropdownMenuItem
              key={op.value + op.symbol}
              onClick={() => onUpdate(rule.id, { operator: op.value })}
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
        onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
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
