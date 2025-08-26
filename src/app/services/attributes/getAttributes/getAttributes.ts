import { SupplierAttributeQuery } from "@/app/types/query-engine/attribute";
import { baseUrl } from "../../config";
import { InternalQueryResponse } from "@/app/types/query-engine/common";
import { SupplierAttribute } from "@/app/types/attribute";

/**
 * Fetches attributes based on search query with filtering and pagination
 * Used for searchable attribute dropdown to load results dynamically
 */
export const getAttributes = async (
  query: SupplierAttributeQuery,
): Promise<InternalQueryResponse<SupplierAttribute>> => {
  try {
    const response = await fetch(`${baseUrl}/api/attributes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return {
      data: [],
      total: 0,
      pagination: {
        offset: 0,
        limit: 0,
        hasMore: false,
      },
      debugInfo: {
        duration: 0,
      },
    };
  }
};
