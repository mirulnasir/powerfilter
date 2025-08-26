import { InternalFilterValue } from "@/app/types/query-engine/common";

/**
 * Enhanced filter rule interface that supports both base fields and attributes
 * - For base fields: fieldType="base", field="skuId"
 * - For attributes: fieldType="attribute", field="color" (attribute key)
 */
export interface FilterRule {
  id: string;
  fieldType: "base" | "attribute";
  field: string; // Either base field name or attribute key
  operator: keyof InternalFilterValue;
  value: string;

  // Optional: Store display name for UI
  displayName?: string;
}
