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

/**
 * Validates if a filter rule is complete and ready to be applied
 * A rule is valid if:
 * - Has a field selected (not empty and not "attributes" placeholder)
 * - Has an operator selected
 * - Has a non-empty value
 */
export function isValidFilterRule(rule: FilterRule): boolean {
  return !!(
    rule.field &&
    rule.field !== "attributes" &&
    rule.operator &&
    rule.value.trim()
  );
}

/**
 * Filters out incomplete rules and returns only valid ones
 */
export function getValidFilterRules(rules: FilterRule[]): FilterRule[] {
  return rules.filter(isValidFilterRule);
}
