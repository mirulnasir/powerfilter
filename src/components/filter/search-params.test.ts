import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  filterToString,
  filtersToStrings,
  stringToFilter,
  stringsToFilters,
  filtersToSearchParams,
  filtersFromSearchParams,
  searchParamsToProductQuery,
} from "./search-params";
import type { FilterRule } from "./types";

describe("search-params", () => {
  describe("filterToString", () => {
    it("should convert a basic filter rule to string format", () => {
      const filter: FilterRule = {
        id: "test-1",
        fieldType: "base",
        field: "price",
        operator: "gt",
        value: "100",
      };

      const result = filterToString(filter);
      expect(result).toBe("base:price:gt:100");
    });

    it("should handle special characters by encoding them", () => {
      const filter: FilterRule = {
        id: "test-2",
        fieldType: "attribute",
        field: "product name",
        operator: "eq",
        value: "value with spaces & symbols",
      };

      const result = filterToString(filter);
      expect(result).toBe(
        "attribute:product%20name:eq:value%20with%20spaces%20%26%20symbols",
      );
    });

    it("should handle all operator types", () => {
      const operators = [
        "eq",
        "ne",
        "gt",
        "gte",
        "lt",
        "lte",
        "in",
        "exists",
        "regex",
      ] as const;

      operators.forEach((operator) => {
        const filter: FilterRule = {
          id: `test-${operator}`,
          fieldType: "base",
          field: "testField",
          operator,
          value: "testValue",
        };

        const result = filterToString(filter);
        expect(result).toBe(`base:testField:${operator}:testValue`);
      });
    });
  });

  describe("filtersToStrings", () => {
    it("should convert multiple filters to string array", () => {
      const filters: FilterRule[] = [
        {
          id: "test-1",
          fieldType: "base",
          field: "price",
          operator: "gt",
          value: "100",
        },
        {
          id: "test-2",
          fieldType: "attribute",
          field: "color",
          operator: "eq",
          value: "red",
        },
      ];

      const result = filtersToStrings(filters);
      expect(result).toEqual(["base:price:gt:100", "attribute:color:eq:red"]);
    });

    it("should handle empty array", () => {
      const result = filtersToStrings([]);
      expect(result).toEqual([]);
    });
  });

  describe("stringToFilter", () => {
    // Mock Date.now to make tests deterministic
    beforeEach(() => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);
    });

    it("should parse valid filter string correctly", () => {
      const filterString = "base:price:gt:100";
      const result = stringToFilter(filterString);

      expect(result).toEqual({
        id: "base-price-gt-1234567890",
        fieldType: "base",
        field: "price",
        operator: "gt",
        value: "100",
      });
    });

    it("should handle encoded special characters", () => {
      const filterString = "attribute:product%20name:eq:value%20with%20spaces";
      const result = stringToFilter(filterString);

      expect(result).toEqual({
        id: "attribute-product name-eq-1234567890",
        fieldType: "attribute",
        field: "product name",
        operator: "eq",
        value: "value with spaces",
      });
    });

    it("should return null for invalid format - wrong number of parts", () => {
      expect(stringToFilter("base:price:gt")).toBeNull();
      expect(stringToFilter("base:price:gt:100:extra")).toBeNull();
      expect(stringToFilter("base")).toBeNull();
    });

    it("should return null for invalid fieldType", () => {
      expect(stringToFilter("invalid:price:gt:100")).toBeNull();
    });

    it("should return null for invalid operator", () => {
      expect(stringToFilter("base:price:invalid:100")).toBeNull();
    });

    it("should handle all valid operators", () => {
      const validOperators = [
        "eq",
        "ne",
        "gt",
        "gte",
        "lt",
        "lte",
        "in",
        "exists",
        "regex",
      ];

      validOperators.forEach((operator) => {
        const result = stringToFilter(`base:field:${operator}:value`);
        expect(result).not.toBeNull();
        expect(result?.operator).toBe(operator);
      });
    });

    it("should return null when decoding fails", () => {
      // Invalid URL encoding
      const result = stringToFilter("base:field%:eq:value");
      expect(result).toBeNull();
    });
  });

  describe("stringsToFilters", () => {
    beforeEach(() => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);
    });

    it("should parse multiple valid filter strings", () => {
      const filterStrings = ["base:price:gt:100", "attribute:color:eq:red"];
      const result = stringsToFilters(filterStrings);

      expect(result).toEqual([
        {
          id: "base-price-gt-1234567890",
          fieldType: "base",
          field: "price",
          operator: "gt",
          value: "100",
        },
        {
          id: "attribute-color-eq-1234567890",
          fieldType: "attribute",
          field: "color",
          operator: "eq",
          value: "red",
        },
      ]);
    });

    it("should filter out invalid strings", () => {
      const filterStrings = [
        "base:price:gt:100", // valid
        "invalid:format", // invalid
        "attribute:color:eq:blue", // valid
        "base:field:invalid:value", // invalid operator
      ];

      const result = stringsToFilters(filterStrings);
      expect(result).toHaveLength(2);
      expect(result[0].field).toBe("price");
      expect(result[1].field).toBe("color");
    });

    it("should handle empty array", () => {
      const result = stringsToFilters([]);
      expect(result).toEqual([]);
    });
  });

  describe("filtersToSearchParams", () => {
    it("should convert filters to URLSearchParams with default param name", () => {
      const filters: FilterRule[] = [
        {
          id: "test-1",
          fieldType: "base",
          field: "price",
          operator: "gt",
          value: "100",
        },
        {
          id: "test-2",
          fieldType: "attribute",
          field: "color",
          operator: "eq",
          value: "red",
        },
      ];

      const result = filtersToSearchParams(filters);
      const params = result.getAll("filter"); // Changed from "filters" to "filter"

      expect(params).toEqual(["base:price:gt:100", "attribute:color:eq:red"]);
    });

    it("should use custom param name when provided", () => {
      const filters: FilterRule[] = [
        {
          id: "test-1",
          fieldType: "base",
          field: "price",
          operator: "gt",
          value: "100",
        },
      ];

      const result = filtersToSearchParams(filters, "customFilters");
      const params = result.getAll("customFilters");

      expect(params).toEqual(["base:price:gt:100"]);
      expect(result.getAll("filter")).toEqual([]); // Changed from "filters" to "filter"
    });

    it("should handle empty filters array", () => {
      const result = filtersToSearchParams([]);
      expect(result.toString()).toBe("");
    });
  });

  describe("filtersFromSearchParams", () => {
    beforeEach(() => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);
    });

    it("should parse filters from URLSearchParams object", () => {
      const params = new URLSearchParams();
      params.append("filter", "base:price:gt:100"); // Changed from "filters" to "filter"
      params.append("filter", "attribute:color:eq:red"); // Changed from "filters" to "filter"

      const result = filtersFromSearchParams(params);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "base-price-gt-1234567890",
        fieldType: "base",
        field: "price",
        operator: "gt",
        value: "100",
      });
      expect(result[1]).toEqual({
        id: "attribute-color-eq-1234567890",
        fieldType: "attribute",
        field: "color",
        operator: "eq",
        value: "red",
      });
    });

    it("should parse filters from search string", () => {
      const searchString =
        "?filter=base%3Aprice%3Agt%3A100&filter=attribute%3Acolor%3Aeq%3Ared"; // Changed from "filters" to "filter"
      const result = filtersFromSearchParams(searchString);

      expect(result).toHaveLength(2);
      expect(result[0].field).toBe("price");
      expect(result[1].field).toBe("color");
    });

    it("should parse filters from string array (Next.js searchParams case)", () => {
      const filterArray = ["base:price:gt:100", "attribute:color:eq:red"];

      const result = filtersFromSearchParams(filterArray);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "base-price-gt-1234567890",
        fieldType: "base",
        field: "price",
        operator: "gt",
        value: "100",
      });
      expect(result[1]).toEqual({
        id: "attribute-color-eq-1234567890",
        fieldType: "attribute",
        field: "color",
        operator: "eq",
        value: "red",
      });
    });

    it("should handle empty string array", () => {
      const result = filtersFromSearchParams([]);
      expect(result).toEqual([]);
    });

    it("should filter out invalid filter strings from array", () => {
      const filterArray = [
        "base:price:gt:100", // valid
        "invalid:format", // invalid
        "attribute:color:eq:blue", // valid
      ];

      const result = filtersFromSearchParams(filterArray);
      expect(result).toHaveLength(2);
      expect(result[0].field).toBe("price");
      expect(result[1].field).toBe("color");
      expect(result[1].value).toBe("blue");
    });

    it("should use custom param name", () => {
      const params = new URLSearchParams();
      params.append("customFilters", "base:price:gt:100");

      const result = filtersFromSearchParams(params, "customFilters");
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe("price");
    });

    it("should handle null/undefined search params", () => {
      expect(filtersFromSearchParams(null)).toEqual([]);
      expect(filtersFromSearchParams(undefined)).toEqual([]);
    });

    it("should filter out invalid filter strings", () => {
      const params = new URLSearchParams();
      params.append("filter", "base:price:gt:100"); // valid, changed from "filters"
      params.append("filter", "invalid:format"); // invalid, changed from "filters"

      const result = filtersFromSearchParams(params);
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe("price");
    });
  });

  describe("searchParamsToProductQuery", () => {
    it("should convert search params to ProductQuery filter structure", () => {
      const searchString =
        "?filter=base:id:eq:123&filter=attribute:color:regex:^red"; // Changed from "filters" to "filter"
      const result = searchParamsToProductQuery(searchString);

      expect(result).toEqual({
        id: { $eq: 123 }, // Added dollar sign
        attributes: {
          color: { $regex: "^red" }, // Added dollar sign
        },
      });
    });

    it("should handle URLSearchParams object", () => {
      const params = new URLSearchParams();
      params.append("filter", "base:price:gt:100"); // Changed from "filters" to "filter"
      params.append("filter", "attribute:size:in:S,M,L"); // Changed from "filters" to "filter"

      const result = searchParamsToProductQuery(params);

      expect(result).toEqual({
        price: { $gt: 100 }, // Added dollar sign
        attributes: {
          size: { $in: ["S", "M", "L"] }, // Added dollar sign
        },
      });
    });

    it("should handle value conversion for different operators", () => {
      const params = new URLSearchParams();
      // Numeric operators
      params.append("filter", "base:price:gt:100.50"); // Changed from "filters"
      params.append("filter", "base:quantity:lte:10"); // Changed from "filters"
      // Boolean operator
      params.append("filter", "base:active:exists:true"); // Changed from "filters"
      // Equality with boolean
      params.append("filter", "base:featured:eq:false"); // Changed from "filters"
      // Equality with null
      params.append("filter", "base:description:ne:null"); // Changed from "filters"
      // Array operator
      params.append("filter", "attribute:tags:in:tag1,tag2,123,true,null"); // Changed from "filters"
      // Regex operator
      params.append("filter", "attribute:name:regex:^product"); // Changed from "filters"

      const result = searchParamsToProductQuery(params);

      expect(result).toEqual({
        price: { $gt: 100.5 }, // Added dollar sign
        quantity: { $lte: 10 }, // Added dollar sign
        active: { $exists: true }, // Added dollar sign
        featured: { $eq: false }, // Added dollar sign
        description: { $ne: null }, // Added dollar sign
        attributes: {
          tags: { $in: ["tag1", "tag2", 123, true, null] }, // Added dollar sign
          name: { $regex: "^product" }, // Added dollar sign
        },
      });
    });

    it("should use custom param name", () => {
      const searchString = "?customFilters=base:price:gt:100";
      const result = searchParamsToProductQuery(searchString, "customFilters");

      expect(result).toEqual({
        price: { $gt: 100 }, // Added dollar sign
      });
    });

    it("should handle null/undefined search params", () => {
      expect(searchParamsToProductQuery(null)).toEqual({});
      expect(searchParamsToProductQuery(undefined)).toEqual({});
    });

    it("should skip invalid filter strings", () => {
      const params = new URLSearchParams();
      params.append("filter", "base:price:gt:100"); // valid, changed from "filters"
      params.append("filter", "invalid:format"); // invalid, changed from "filters"
      params.append("filter", "unknown:field:gt:50"); // invalid fieldType, changed from "filters"

      const result = searchParamsToProductQuery(params);

      expect(result).toEqual({
        price: { $gt: 100 }, // Added dollar sign
      });
    });

    it("should handle empty search params", () => {
      const result = searchParamsToProductQuery("");
      expect(result).toEqual({});
    });

    it("should handle multiple filters for the same field (should overwrite)", () => {
      const params = new URLSearchParams();
      params.append("filter", "base:price:gt:100"); // Changed from "filters"
      params.append("filter", "base:price:lt:200"); // Changed from "filters"

      const result = searchParamsToProductQuery(params);

      // Last filter should win
      expect(result).toEqual({
        price: { $lt: 200 }, // Added dollar sign
      });
    });

    it("should handle numeric string conversion edge cases", () => {
      const params = new URLSearchParams();
      params.append("filter", "base:price:gt:not-a-number"); // Changed from "filters"
      params.append("filter", "base:weight:gte:0"); // Changed from "filters"
      params.append("filter", "base:score:lt:-5.5"); // Changed from "filters"

      const result = searchParamsToProductQuery(params);

      expect(result).toEqual({
        price: { $gt: "not-a-number" }, // Should remain as string if not a number, added dollar sign
        weight: { $gte: 0 }, // Added dollar sign
        score: { $lt: -5.5 }, // Added dollar sign
      });
    });
  });

  describe("integration tests", () => {
    beforeEach(() => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);
    });

    it("should round-trip filters through search params", () => {
      const originalFilters: FilterRule[] = [
        {
          id: "test-1",
          fieldType: "base",
          field: "price",
          operator: "gt",
          value: "100",
        },
        {
          id: "test-2",
          fieldType: "attribute",
          field: "color with spaces",
          operator: "eq",
          value: "red & blue",
        },
      ];

      // Convert to search params and back
      const searchParams = filtersToSearchParams(originalFilters);
      const roundTripFilters = filtersFromSearchParams(searchParams);

      // Should have same structure (except IDs will be regenerated)
      expect(roundTripFilters).toHaveLength(2);
      expect(roundTripFilters[0].fieldType).toBe("base");
      expect(roundTripFilters[0].field).toBe("price");
      expect(roundTripFilters[0].operator).toBe("gt");
      expect(roundTripFilters[0].value).toBe("100");

      expect(roundTripFilters[1].fieldType).toBe("attribute");
      expect(roundTripFilters[1].field).toBe("color with spaces");
      expect(roundTripFilters[1].operator).toBe("eq");
      expect(roundTripFilters[1].value).toBe("red & blue");
    });

    it("should convert filters to ProductQuery via search params", () => {
      const filters: FilterRule[] = [
        {
          id: "test-1",
          fieldType: "base",
          field: "price",
          operator: "gte",
          value: "50.99",
        },
        {
          id: "test-2",
          fieldType: "attribute",
          field: "category",
          operator: "in",
          value: "electronics,books,clothing",
        },
      ];

      const searchParams = filtersToSearchParams(filters);
      const productQuery = searchParamsToProductQuery(searchParams);

      expect(productQuery).toEqual({
        price: { $gte: 50.99 }, // Added dollar sign
        attributes: {
          category: { $in: ["electronics", "books", "clothing"] }, // Added dollar sign
        },
      });
    });
  });
});
