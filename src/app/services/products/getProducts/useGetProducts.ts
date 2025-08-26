import { ProductQuery } from "@/app/types/query-engine/product";
import { queryOptions } from "@tanstack/react-query";
import { getProducts } from "./getProducts";

export const initialProductsOptions = (query: ProductQuery) =>
  queryOptions({
    queryKey: ["products", query],
    queryFn: () => getProducts(query),
  });
