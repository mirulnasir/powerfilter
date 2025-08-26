import type { ProductQuery } from "@/app/types/query-engine/product";
import type { InternalFilterValue } from "@/app/types/query-engine/common";
import type { FilterRule } from "./types";

/**
 * Converts a filter rule into a URL-safe string format
 * Format: fieldType:field:operator:value
 *
 * @param filter - The filter rule to convert
 * @returns URL-safe string representation
 *
 * @example
 * const filter = { fieldType: "base", field: "price", operator: "$gt", value: "100" }
 * // Returns: "base:price:$gt:100"
 */
export function filterToString(filter: FilterRule): string {
  const { fieldType, field, operator, value } = filter;

  // Encode each component to handle special characters in field names or values
  const encodedFieldType = encodeURIComponent(fieldType);
  const encodedField = encodeURIComponent(field);
  const encodedOperator = encodeURIComponent(operator);
  const encodedValue = encodeURIComponent(value);

  return `${encodedFieldType}:${encodedField}:${encodedOperator}:${encodedValue}`;
}

/**
 * Converts multiple filter rules into an array of URL-safe strings
 *
 * @param filters - Array of filter rules to convert
 * @returns Array of URL-safe string representations
 */
export function filtersToStrings(filters: FilterRule[]): string[] {
  return filters.map(filterToString);
}

/**
 * Parses a URL-safe filter string back into a FilterRule object
 *
 * @param filterString - The URL-safe string to parse
 * @returns Parsed FilterRule object or null if invalid
 *
 * @example
 * const str = "base:price:$gt:100"
 * // Returns: { fieldType: "base", field: "price", operator: "$gt", value: "100", id: "generated-id" }
 */
export function stringToFilter(filterString: string): FilterRule | null {
  try {
    const parts = filterString.split(":");

    // Must have exactly 4 parts: fieldType:field:operator:value
    if (parts.length !== 4) {
      return null;
    }

    const [fieldType, field, operator, value] = parts.map(decodeURIComponent);

    // Validate fieldType
    if (fieldType !== "base" && fieldType !== "attribute") {
      return null;
    }

    // Validate operator - ensure it's a valid InternalFilterValue key
    const validOperators: (keyof InternalFilterValue)[] = [
      "$eq",
      "$ne",
      "$gt",
      "$gte",
      "$lt",
      "$lte",
      "$in",
      "$exists",
      "$regex",
    ];

    if (!validOperators.includes(operator as keyof InternalFilterValue)) {
      return null;
    }

    // Generate a unique ID for the filter
    const id = `${fieldType}-${field}-${operator}-${Date.now()}`;

    return {
      id,
      fieldType: fieldType as "base" | "attribute",
      field,
      operator: operator as keyof InternalFilterValue,
      value,
    };
  } catch (error) {
    // Handle any decoding errors
    return null;
  }
}

/**
 * Parses multiple URL-safe filter strings back into FilterRule objects
 *
 * @param filterStrings - Array of URL-safe strings to parse
 * @returns Array of parsed FilterRule objects (invalid filters are filtered out)
 */
export function stringsToFilters(filterStrings: string[]): FilterRule[] {
  return filterStrings
    .map(stringToFilter)
    .filter((filter): filter is FilterRule => filter !== null);
}

/**
 * Converts filters to URL search params format
 *
 * @param filters - Array of filter rules
 * @param paramName - Name of the URL parameter (default: "filters")
 * @returns URLSearchParams object ready for use in URLs
 *
 * @example
 * const filters = [
 *   { fieldType: "base", field: "price", operator: "$gt", value: "100" },
 *   { fieldType: "attribute", field: "color", operator: "$eq", value: "red" }
 * ];
 * const params = filtersToSearchParams(filters);
 * // URL will look like: ?filters=base%3Aprice%3A%24gt%3A100&filters=attribute%3Acolor%3A%24eq%3Ared
 */
export function filtersToSearchParams(
  filters: FilterRule[],
  paramName: string = "filters",
): URLSearchParams {
  const params = new URLSearchParams();

  const filterStrings = filtersToStrings(filters);
  filterStrings.forEach((filterString) => {
    params.append(paramName, filterString);
  });

  return params;
}

/**
 * Parses filters from URL search params
 *
 * @param searchParams - URLSearchParams object, string, or undefined/null
 * @param paramName - Name of the URL parameter (default: "filters")
 * @returns Array of parsed FilterRule objects
 */
export function filtersFromSearchParams(
  searchParams: URLSearchParams | string | undefined | null,
  paramName: string = "filters",
): FilterRule[] {
  // Handle undefined/null cases
  if (!searchParams) {
    return [];
  }

  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams;

  const filterStrings = params.getAll(paramName);
  return stringsToFilters(filterStrings);
}

/**
 * Converts search params directly to ProductQuery filter object
 * Parses filter strings and builds the query structure in one pass
 *
 * @param searchParams - URL search params string or URLSearchParams object
 * @param paramName - Name of the filter parameter (default: "filters")
 * @returns ProductQuery filter object ready for API calls
 *
 * @example
 * const query = searchParamsToProductQuery("?filters=base:id:$eq:123&filters=attribute:color:$regex:^red");
 * // Returns: { id: { $eq: "123" }, attributes: { color: { $regex: "^red" } } }
 */
export function searchParamsToProductQuery(
  searchParams: URLSearchParams | string | undefined | null,
  paramName: string = "filters",
): NonNullable<ProductQuery["filter"]> {
  if (!searchParams) return {};

  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams;

  const result: NonNullable<ProductQuery["filter"]> = {};

  params.getAll(paramName).forEach((filterString) => {
    const parts = filterString.split(":");
    if (parts.length !== 4) return;

    const [fieldType, field, operator, value] = parts.map(decodeURIComponent);
    if (fieldType !== "base" && fieldType !== "attribute") return;

    // Convert value based on operator
    const convertedValue = convertValue(value, operator);
    const filterValue = { [operator]: convertedValue };

    if (fieldType === "base") {
      // Type-safe assignment for base fields
      const baseResult = result as Record<string, InternalFilterValue>;
      baseResult[field] = filterValue;
    } else {
      result.attributes = result.attributes || {};
      result.attributes[field] = filterValue;
    }
  });

  return result;
}

/**
 * Converts string value to appropriate type based on operator
 * Supports all InternalFilterValue operators: $eq, $ne, $gt, $gte, $lt, $lte, $in, $exists, $regex
 */
function convertValue(
  value: string,
  operator: string,
): string | number | boolean | null | (string | number | boolean | null)[] {
  switch (operator) {
    case "$gt":
    case "$gte":
    case "$lt":
    case "$lte":
      // Numeric operators - convert to number
      const numValue = parseFloat(value);
      return isNaN(numValue) ? value : numValue;

    case "$in":
      // Array operator - split by comma and convert each item
      return value.split(",").map((v) => {
        const trimmed = v.trim();
        const num = parseFloat(trimmed);
        // Handle boolean values in arrays
        if (trimmed.toLowerCase() === "true") return true;
        if (trimmed.toLowerCase() === "false") return false;
        if (trimmed.toLowerCase() === "null") return null;
        return isNaN(num) ? trimmed : num;
      });

    case "$exists":
      // Boolean operator
      return value.toLowerCase() === "true";

    case "$eq":
    case "$ne":
      // Can be string, number, boolean, or null
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
      if (value.toLowerCase() === "null") return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;

    case "$regex":
      // String operator for regex patterns
      return value;

    default:
      // Fallback for any future operators
      return value;
  }
}
