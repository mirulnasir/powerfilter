import { ProductQuery } from "@/app/types/query-engine/product";
import { baseUrl } from "../../config";
import { InternalQueryResponse } from "@/app/types/query-engine/common";
import { Product } from "@/app/types/product";

export const getProducts = async (
  query: ProductQuery,
): Promise<InternalQueryResponse<Product>> => {
  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      body: JSON.stringify(query),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
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
