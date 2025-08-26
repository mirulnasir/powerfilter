import type { InternalFilterValue } from "@/app/types/query-engine/common";

/**
 * Available comparison operators for filtering
 */
export const OPERATORS = [
  { value: "$eq" as keyof InternalFilterValue, label: "equals", symbol: "=" },
  {
    value: "$ne" as keyof InternalFilterValue,
    label: "not equals",
    symbol: "≠",
  },
  {
    value: "$gt" as keyof InternalFilterValue,
    label: "greater than",
    symbol: ">",
  },
  {
    value: "$gte" as keyof InternalFilterValue,
    label: "greater than or equals",
    symbol: "≥",
  },
  {
    value: "$lt" as keyof InternalFilterValue,
    label: "less than",
    symbol: "<",
  },
  {
    value: "$lte" as keyof InternalFilterValue,
    label: "less than or equals",
    symbol: "≤",
  },
  {
    value: "$regex" as keyof InternalFilterValue,
    label: "regex",
    symbol: ".*",
  },
  { value: "$in" as keyof InternalFilterValue, label: "in", symbol: "∈" },
  {
    value: "$exists" as keyof InternalFilterValue,
    label: "exists",
    symbol: "∃",
  },
] as const;

// Base field options for filtering
export const BASE_FIELD_OPTIONS = [
  { value: "skuId", label: "SKU ID", type: "base" as const },
  { value: "updatedAt", label: "Updated At", type: "base" as const },
  { value: "createdAt", label: "Created At", type: "base" as const },
  { value: "attributes", label: "Attributes", type: "attribute" as const },
];
