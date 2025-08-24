import { SupplierAttribute } from "../types/attribute";
import { DashboardContent } from "./_components/dashboard-content";
import { Payment } from "./_components/table/columns";

async function getData(): Promise<Payment[]> {
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
    console.log("data", data);
  }

  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "a1b2c3d4",
      amount: 250,
      status: "success",
      email: "alice@example.com",
    },
    {
      id: "e5f6g7h8",
      amount: 75,
      status: "failed",
      email: "bob@example.com",
    },
    {
      id: "i9j0k1l2",
      amount: 320,
      status: "processing",
      email: "carol@example.com",
    },
    {
      id: "m3n4o5p6",
      amount: 150,
      status: "pending",
      email: "dave@example.com",
    },
    {
      id: "q7r8s9t0",
      amount: 500,
      status: "success",
      email: "eve@example.com",
    },
    {
      id: "u1v2w3x4",
      amount: 60,
      status: "failed",
      email: "frank@example.com",
    },
    {
      id: "y5z6a7b8",
      amount: 200,
      status: "processing",
      email: "grace@example.com",
    },
    {
      id: "c9d0e1f2",
      amount: 90,
      status: "pending",
      email: "heidi@example.com",
    },
    {
      id: "g3h4i5j6",
      amount: 400,
      status: "success",
      email: "ivan@example.com",
    },
    {
      id: "k7l8m9n0",
      amount: 120,
      status: "failed",
      email: "judy@example.com",
    },
    // ...
  ];
}

export default async function Home() {
  const data = await getData();

  return (
    <main>
      <DashboardContent
        initialData={data}
        attributes={["name", "description"] as unknown as SupplierAttribute[]}
      />
      {/* <DataTable columns={columns} data={data} /> */}
    </main>
  );
}
