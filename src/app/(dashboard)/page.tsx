import { getAttributeKeys } from "../services/products/getAttributeKeys";
import { SupplierAttribute } from "../types/attribute";
import { Product } from "../types/product";
import { InternalQueryResponse } from "../types/query-engine/common";
import { DashboardContent } from "./_components/dashboard-content";

async function getAttributes(): Promise<SupplierAttribute[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/attributes`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error();
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }
}

async function getData(): Promise<InternalQueryResponse<Product>> {
  // Fetch data from your API here.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const products = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        attributes: {
          netWeightPerUnitValue: {
            value: {
              $gt: 10,
            },
          },
        },
      },
    }),
  });
  if (!products.ok) {
    throw new Error();
  } else {
    const data = await products.json();
    return data;
  }
}

export default async function Home() {
  const data = await getData();
  const attributes = await getAttributes();
  const attributeKeys = await getAttributeKeys();
  console.log({ data });
  console.log({ attributes });
  console.log({ attributeKeys });

  return (
    <main>
      <DashboardContent
        initialData={data.data || []}
        attributes={["name", "description"] as unknown as SupplierAttribute[]}
      />
      {/* <DataTable columns={columns} data={data} /> */}
    </main>
  );
}
