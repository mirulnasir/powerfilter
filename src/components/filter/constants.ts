/**
 * Available comparison operators for filtering
 */
export const OPERATORS = [
  { value: "$eq", label: "equals", symbol: "=" },
  { value: "$ne", label: "not equal", symbol: "<>" },
  { value: "$gt", label: "greater than", symbol: ">" },
  { value: "$lt", label: "less than", symbol: "<" },
  { value: "$gte", label: "greater than or equal", symbol: ">=" },
  { value: "$lte", label: "less than or equal", symbol: "<=" },
  { value: "$regex", label: "like operator", symbol: "~~" },
  { value: "$regex", label: "ilike operator", symbol: "~~*" },
  { value: "$in", label: "one of a list of values", symbol: "in" },
  { value: "$exists", label: "is checking for (null,not null)", symbol: "is" },
];
