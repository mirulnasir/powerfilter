import { useMutation, useQuery } from "@tanstack/react-query";
import { getProducts } from "./getProducts";
import { ProductQuery } from "@/app/types/query-engine/product";
import { Product } from "@/app/types/product";

export const useGetProducts = () => {
  return useMutation<Product[], Error, ProductQuery>({
    mutationFn: (query: ProductQuery) => getProducts(query),
    onSuccess: (data) => {
      console.log("data", data);
    },
    onError: (error) => {
      console.error("Error fetching products:", error);
    },
  });
};
