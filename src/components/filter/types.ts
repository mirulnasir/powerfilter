import { CleanOperator } from "./constants";
import { ProductQuery } from "@/app/types/query-engine/product";

/**
 * Filter state that directly mirrors ProductQuery.filter structure
 * This ensures no duplicate base fields and easy conversion to ProductQuery
 */
export type FilterState = NonNullable<ProductQuery["filter"]>;

/**
 * UI representation of a single filter for editing
 * Uses clean operators without dollar signs for better UX
 */
export interface FilterRule {
  id: string; // UI-only ID for React keys
  fieldType: "base" | "attribute";
  field: string; // Base field name or attribute key
  operator: CleanOperator; // Clean operator without dollar sign
  value: string;
  displayName?: string; // For UI display
}
