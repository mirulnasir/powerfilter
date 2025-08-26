import { getQueryClient } from "@/lib/react-query/get-query-client";
import { initialProductsOptions } from "../services/products/getProducts";
import { SupplierAttribute } from "../types/attribute";
import { DashboardContent } from "./_components/dashboard-content";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

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

export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(initialProductsOptions);

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardContent
          attributes={["name", "description"] as unknown as SupplierAttribute[]}
        />
      </HydrationBoundary>
      {/* <DataTable columns={columns} data={data} /> */}
    </main>
  );
}
