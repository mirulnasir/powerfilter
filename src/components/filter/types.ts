import { SupplierAttribute } from "@/app/types/attribute";
import { Product } from "@/app/types/product";

/**
 * Base filter field types - direct product properties
 */
export type BaseFilterField = keyof Pick<
  Product,
  "skuId" | "updatedAt" | "createdAt"
>;

/**
 * Filter field that can be either a base field or an attribute
 */
export type FilterField =
  | {
      type: "base";
      field: BaseFilterField;
      displayName: string;
    }
  | {
      type: "attribute";
      field: SupplierAttribute["key"]; // The attribute key
      displayName: string;
    };

/**
 * Enhanced filter rule interface that supports both base fields and attributes
 * - For base fields: fieldType="base", field="skuId"
 * - For attributes: fieldType="attribute", field="color" (attribute key)
 */
export interface FilterRule {
  id: string;
  fieldType: "base" | "attribute";
  field: string; // Either base field name or attribute key
  operator: string;
  value: string;

  // Optional: Store display name for UI
  displayName?: string;
}

export type ProductFilterKeys = keyof Omit<Product, "id">;

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
 * Helper function to create a base field filter with proper display names
 */
export function createBaseFieldFilter(field: BaseFilterField): FilterField {
  // Map base fields to their proper display names
  const displayNames: Record<BaseFilterField, string> = {
    skuId: "SKU ID",
    updatedAt: "Updated At",
    createdAt: "Created At",
  };

  return {
    type: "base",
    field,
    displayName: displayNames[field],
  };
}

/**
 * Helper function to create an attribute filter
 */
export function createAttributeFilter(
  attributeKey: string,
  attributeName: string,
): FilterField {
  return {
    type: "attribute",
    field: attributeKey,
    displayName: attributeName,
  };
}
