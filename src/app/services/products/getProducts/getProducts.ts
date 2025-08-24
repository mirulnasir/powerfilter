import { ProductQuery } from "@/app/types/query-engine/product";
import { baseUrl } from "../../config";

export const getProducts = async (query: ProductQuery) => {
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
    return [];
  }
};
