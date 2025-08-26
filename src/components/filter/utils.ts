import { BASE_FIELD_OPTIONS } from "./constants";
import { FilterRule } from "./types";
import { SupplierAttribute } from "@/app/types/attribute";

/**
 * Gets all currently used field keys from filter rules
 * @param rules - Current filter rules
 * @returns Set of field keys that are already in use
 */
export function getUsedFieldKeys(rules: FilterRule[]): Set<string> {
  return new Set(
    rules
      .filter((rule) => rule.field && rule.field !== "attributes") // Exclude empty and placeholder
      .map((rule) => rule.field),
  );
}

/**
 * Gets available field options excluding already used fields
 * @param usedFields - Set of field keys that are already in use
 * @returns Filtered field options excluding used ones
 */
export function getAvailableFieldOptions(usedFields: Set<string>) {
  return BASE_FIELD_OPTIONS.filter(
    (option) => !usedFields.has(option.value) || option.value === "attributes",
  );
}

/**
 * Filters attributes to return only those not currently used in filters
 * @param attributes - Array of available supplier attributes
 * @param usedFields - Set of attribute keys already in use
 * @returns Filtered array of available attributes
 */
export function getAvailableAttributes(
  attributes: SupplierAttribute[],
  usedFields: Set<string>,
) {
  return attributes.filter((attr) => !usedFields.has(attr.key));
}
