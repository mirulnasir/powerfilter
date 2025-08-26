import type { InternalFilterValue } from "@/app/types/query-engine/common";
import type { ProductQuery } from "@/app/types/query-engine/product";
import { CleanOperator, isValidCleanOperator } from "./constants";
import type { FilterRule } from "./types";

/**
 * Utility class for handling filter rule conversions and URL parameter management
 * Provides methods to convert between FilterRule objects, URL strings, and ProductQuery filters
 */
export class FilterSearchParams {
  private readonly defaultParamName = "filter";

  /**
   * Converts a filter rule into a URL-safe string format
   * Format: fieldType:field:operator:value
   */
  filterToString = (filter: FilterRule): string => {
    const { fieldType, field, operator, value } = filter;
    const parts = [fieldType, field, operator, value].map(encodeURIComponent);
    return parts.join(":");
  };

  /**
   * Converts multiple filter rules into an array of URL-safe strings
   */
  filtersToStrings = (filters: FilterRule[]): string[] => {
    return filters.map((filter) => this.filterToString(filter));
  };

  /**
   * Parses a URL-safe filter string back into a FilterRule object
   */
  stringToFilter = (filterString: string): FilterRule | null => {
    try {
      const parts = filterString.split(":");
      if (parts.length !== 4) return null;

      const [fieldType, field, operator, value] = parts.map(decodeURIComponent);

      if (!this.isValidFilterComponents(fieldType, operator)) return null;

      return {
        id: this.generateFilterId(fieldType, field, operator),
        fieldType: fieldType as "base" | "attribute",
        field,
        operator: operator as CleanOperator,
        value,
      };
    } catch (error) {
      return null;
    }
  };

  /**
   * Parses multiple URL-safe filter strings back into FilterRule objects
   */
  stringsToFilters = (filterStrings: string[]): FilterRule[] => {
    return filterStrings
      .map((str) => this.stringToFilter(str))
      .filter((filter): filter is FilterRule => filter !== null);
  };

  /**
   * Converts filters to URL search params format
   */
  filtersToSearchParams = (
    filters: FilterRule[],
    paramName: string = this.defaultParamName,
  ): URLSearchParams => {
    const params = new URLSearchParams();
    const filterStrings = this.filtersToStrings(filters);
    filterStrings.forEach((filterString) => {
      params.append(paramName, filterString);
    });
    return params;
  };

  /**
   * Parses filters from URL search params
   */
  filtersFromSearchParams = (
    searchParams: URLSearchParams | string | string[] | undefined | null,
    paramName: string = this.defaultParamName,
  ): FilterRule[] => {
    const filterStrings = this.extractFilterStrings(searchParams, paramName);
    return this.stringsToFilters(filterStrings);
  };

  /**
   * Converts search params directly to ProductQuery filter object
   */
  searchParamsToProductQuery = (
    searchParams: URLSearchParams | string | string[] | undefined | null,
    paramName: string = this.defaultParamName,
  ): NonNullable<ProductQuery["filter"]> => {
    const filterStrings = this.extractFilterStrings(searchParams, paramName);
    return this.buildProductQueryFromStrings(filterStrings);
  };

  /**
   * Converts FilterRule objects directly to ProductQuery filter object
   */
  filterRulesToProductQuery = (
    filterRules: FilterRule[],
  ): NonNullable<ProductQuery["filter"]> => {
    const result: NonNullable<ProductQuery["filter"]> = {};

    filterRules.forEach((filterRule) => {
      const { fieldType, field, operator, value } = filterRule;
      const filterValue = this.buildFilterValue(operator, value);
      this.applyFilterToResult(result, fieldType, field, filterValue);
    });

    return result;
  };

  // === Private Helper Methods ===

  /**
   * Extracts filter strings from various search param formats
   */
  private extractFilterStrings = (
    searchParams: URLSearchParams | string | string[] | undefined | null,
    paramName: string,
  ): string[] => {
    if (!searchParams) return [];

    if (Array.isArray(searchParams)) {
      return searchParams;
    }

    if (typeof searchParams === "string") {
      // Direct filter value (contains colons but no = sign)
      if (searchParams.includes(":") && !searchParams.includes("=")) {
        return [decodeURIComponent(searchParams)];
      }
      // Query string format
      const params = new URLSearchParams(searchParams);
      return params.getAll(paramName);
    }

    return searchParams.getAll(paramName);
  };

  /**
   * Validates filter components (fieldType and operator)
   */
  private isValidFilterComponents = (
    fieldType: string,
    operator: string,
  ): boolean => {
    const isValidFieldType = fieldType === "base" || fieldType === "attribute";
    return isValidFieldType && isValidCleanOperator(operator);
  };

  /**
   * Generates a unique ID for a filter rule
   */
  private generateFilterId = (
    fieldType: string,
    field: string,
    operator: string,
  ): string => {
    return `${fieldType}-${field}-${operator}-${Date.now()}`;
  };

  /**
   * Builds ProductQuery filter object from filter strings
   */
  private buildProductQueryFromStrings = (
    filterStrings: string[],
  ): NonNullable<ProductQuery["filter"]> => {
    const result: NonNullable<ProductQuery["filter"]> = {};

    filterStrings.forEach((filterString) => {
      const parts = filterString.split(":");
      if (parts.length !== 4) return;

      const [fieldType, field, operator, value] = parts.map(decodeURIComponent);
      if (!this.isValidFilterComponents(fieldType, operator)) return;

      const filterValue = this.buildFilterValue(
        operator as CleanOperator,
        value,
      );
      this.applyFilterToResult(result, fieldType, field, filterValue);
    });

    return result;
  };

  /**
   * Creates a filter value object with the appropriate operator prefix
   */
  private buildFilterValue = (
    operator: CleanOperator,
    value: string,
  ): InternalFilterValue => {
    const convertedValue = this.convertValue(value, operator);
    return { [`$${operator}`]: convertedValue };
  };

  /**
   * Applies a filter value to the result object based on field type
   */
  private applyFilterToResult = (
    result: NonNullable<ProductQuery["filter"]>,
    fieldType: string,
    field: string,
    filterValue: InternalFilterValue,
  ): void => {
    if (fieldType === "base") {
      const baseResult = result as Record<string, InternalFilterValue>;
      baseResult[field] = filterValue;
    } else if (fieldType === "attribute") {
      result.attributes = result.attributes || {};
      result.attributes[field] = filterValue;
    }
  };

  /**
   * Converts string value to appropriate type based on operator
   */
  private convertValue = (
    value: string,
    operator: CleanOperator,
  ):
    | string
    | number
    | boolean
    | null
    | (string | number | boolean | null)[] => {
    switch (operator) {
      case "gt":
      case "gte":
      case "lt":
      case "lte":
        return this.convertNumericValue(value);

      case "in":
        return this.convertArrayValue(value);

      case "exists":
        return value.toLowerCase() === "true";

      case "eq":
      case "ne":
        return this.convertPrimitiveValue(value);

      case "regex":
        return value;

      default:
        return value;
    }
  };

  /**
   * Converts string to number if possible, otherwise returns original string
   */
  private convertNumericValue = (value: string): string | number => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : numValue;
  };

  /**
   * Converts comma-separated string to array of properly typed values
   */
  private convertArrayValue = (
    value: string,
  ): (string | number | boolean | null)[] => {
    return value.split(",").map((v) => this.convertPrimitiveValue(v.trim()));
  };

  /**
   * Converts string to primitive value (string, number, boolean, or null)
   */
  private convertPrimitiveValue = (
    value: string,
  ): string | number | boolean | null => {
    const lower = value.toLowerCase();

    if (lower === "true") return true;
    if (lower === "false") return false;
    if (lower === "null") return null;

    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : parsed;
  };
}

// Create a singleton instance for convenient usage
export const filterSearchParams = new FilterSearchParams();

// Export individual methods with proper binding for backward compatibility
export const filterToString = filterSearchParams.filterToString;
export const filtersToStrings = filterSearchParams.filtersToStrings;
export const stringToFilter = filterSearchParams.stringToFilter;
export const stringsToFilters = filterSearchParams.stringsToFilters;
export const filtersToSearchParams = filterSearchParams.filtersToSearchParams;
export const filtersFromSearchParams =
  filterSearchParams.filtersFromSearchParams;
export const searchParamsToProductQuery =
  filterSearchParams.searchParamsToProductQuery;
export const filterRulesToProductQuery =
  filterSearchParams.filterRulesToProductQuery;
