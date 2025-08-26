"use client";

import { initialProductsOptions } from "@/app/services/products/getProducts";
import { SupplierAttribute } from "@/app/types/attribute";
import { InlineFilter } from "@/components/filter";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Suspense, useState } from "react";
import { DataTable } from "./table";
import { columns } from "./table/columns";

interface DashboardContentProps {
  attributes: SupplierAttribute[];
}

export function DashboardContent({ attributes }: DashboardContentProps) {
  const { data: productsData } = useSuspenseQuery(initialProductsOptions({}));
  const [data] = useState(productsData.data);
  const [filteredData, setFilteredData] = useState(productsData.data);

  const handleFilterChange = (rules: unknown[]) => {
    console.log("Filter rules:", rules);
    // Apply filters to data here
    // For now, just log the rules
    setFilteredData(data); // You can implement actual filtering logic
  };

  return (
    <main>
      <InlineFilter
        attributes={attributes}
        onFilterChange={handleFilterChange}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          columns={columns as ColumnDef<unknown>[]}
          data={filteredData}
        />
      </Suspense>
    </main>
  );
}
