import type { InternalFilterValue } from "@/app/types/query-engine/common";

/**
 * Clean operator values without dollar signs for better UX
 */
export type CleanOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "regex"
  | "in"
  | "exists";

/**
 * Internal MongoDB-style operators with dollar signs
 */
export type InternalOperator = keyof InternalFilterValue;

/**
 * Available comparison operators for filtering with clean values
 */
export const OPERATORS = [
  { value: "eq" as CleanOperator, label: "equals", symbol: "=" },
  { value: "ne" as CleanOperator, label: "not equals", symbol: "≠" },
  { value: "gt" as CleanOperator, label: "greater than", symbol: ">" },
  {
    value: "gte" as CleanOperator,
    label: "greater than or equals",
    symbol: "≥",
  },
  { value: "lt" as CleanOperator, label: "less than", symbol: "<" },
  { value: "lte" as CleanOperator, label: "less than or equals", symbol: "≤" },
  { value: "regex" as CleanOperator, label: "regex", symbol: ".*" },
  { value: "in" as CleanOperator, label: "in", symbol: "∈" },
  { value: "exists" as CleanOperator, label: "exists", symbol: "∃" },
] as const;

/**
 * Bidirectional mapping between clean operators and internal operators
 */
export const OPERATOR_MAPPING = {
  // Clean to Internal
  toInternal: {
    eq: "$eq",
    ne: "$ne",
    gt: "$gt",
    gte: "$gte",
    lt: "$lt",
    lte: "$lte",
    regex: "$regex",
    in: "$in",
    exists: "$exists",
  } as const satisfies Record<CleanOperator, InternalOperator>,

  // Internal to Clean
  toClean: {
    $eq: "eq",
    $ne: "ne",
    $gt: "gt",
    $gte: "gte",
    $lt: "lt",
    $lte: "lte",
    $regex: "regex",
    $in: "in",
    $exists: "exists",
  } as const satisfies Record<InternalOperator, CleanOperator>,
} as const;

/**
 * Convert clean operator to internal operator
 * @param cleanOp Clean operator without dollar sign
 * @returns Internal operator with dollar sign
 */
export function toInternalOperator(cleanOp: CleanOperator): InternalOperator {
  return OPERATOR_MAPPING.toInternal[cleanOp];
}

/**
 * Convert internal operator to clean operator
 * @param internalOp Internal operator with dollar sign
 * @returns Clean operator without dollar sign
 */
export function toCleanOperator(internalOp: InternalOperator): CleanOperator {
  return OPERATOR_MAPPING.toClean[internalOp];
}

/**
 * Check if a string is a valid clean operator
 * @param value String to check
 * @returns True if valid clean operator
 */
export function isValidCleanOperator(value: string): value is CleanOperator {
  return Object.keys(OPERATOR_MAPPING.toInternal).includes(
    value as CleanOperator,
  );
}

/**
 * Check if a string is a valid internal operator
 * @param value String to check
 * @returns True if valid internal operator
 */
export function isValidInternalOperator(
  value: string,
): value is InternalOperator {
  return Object.keys(OPERATOR_MAPPING.toClean).includes(
    value as InternalOperator,
  );
}

// Base field options for filtering
export const FILTER_FIELD_OPTIONS = [
  { value: "skuId", label: "SKU ID", type: "base" as const },
  { value: "updatedAt", label: "Updated At", type: "base" as const },
  { value: "createdAt", label: "Created At", type: "base" as const },
  { value: "attributes", label: "Attributes", type: "attribute" as const },
];
