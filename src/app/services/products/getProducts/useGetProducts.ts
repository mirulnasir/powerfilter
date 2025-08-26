import { Product } from "@/app/types/product";
import { ProductQuery } from "@/app/types/query-engine/product";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { getProducts } from "./getProducts";
import { InternalQueryResponse } from "@/app/types/query-engine/common";

export const initialProductsOptions = (query: ProductQuery) =>
  queryOptions({
    queryKey: ["products", query],
    queryFn: () => getProducts(query),
  });

export const useLazyGetProducts = () => {
  return useMutation<InternalQueryResponse<Product>, Error, ProductQuery>({
    mutationFn: (query: ProductQuery) => getProducts(query),
    onSuccess: (data) => {
      console.log("data", data);
      return data;
    },
    onError: (error) => {
      console.error("Error fetching products:", error);
    },
  });
};
