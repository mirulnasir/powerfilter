import {
  paginationFromSearchParams,
  searchParamsToProductQuery,
  sortFromSearchParams,
} from "@/components/filter/search-params";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { initialProductsOptions } from "../services/products/getProducts";

import { DashboardContent } from "./_components/dashboard-content";

// async function getAttributes(): Promise<SupplierAttribute[]> {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
//   try {
//     const response = await fetch(`${baseUrl}/api/attributes`, {
//       method: "POST",
//     });
//     if (!response.ok) {
//       throw new Error();
//     } else {
//       const data = await response.json();
//       return data;
//     }
//   } catch (error) {
//     console.error("Error fetching attributes:", error);
//     return [];
//   }
// }

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    filter: string | string[];
    sort: string | string[];
    page: string;
    limit: string;
  }>;
}) {
  const params = await searchParams;

  const queryClient = getQueryClient();
  const productQuery = searchParamsToProductQuery(params.filter, "filter");
  const sort = sortFromSearchParams(params.sort);
  const pagination = paginationFromSearchParams(params.page, params.limit);
  void queryClient.prefetchQuery(
    initialProductsOptions({
      filter: productQuery,
      sort: sort,
      pagination: pagination,
    }),
  );

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardContent filterString={params.filter} />
      </HydrationBoundary>
      {/* <DataTable columns={columns} data={data} /> */}
    </main>
  );
}
