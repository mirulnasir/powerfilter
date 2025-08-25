"use client";

import { SupplierAttribute } from "@/app/types/attribute";
import { Filter, InlineFilter } from "@/components/filter";
import { useState } from "react";
import { DataTable } from "./table";
import { columns } from "./table/columns";
import { ColumnDef } from "@tanstack/react-table";

interface DashboardContentProps {
  initialData: unknown[];
  attributes: SupplierAttribute[];
}

export function DashboardContent({
  initialData,
  attributes,
}: DashboardContentProps) {
  const [data] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);

  const handleFilterChange = (rules: unknown[]) => {
    console.log("Filter rules:", rules);
    // Apply filters to data here
    // For now, just log the rules
    setFilteredData(data); // You can implement actual filtering logic
  };

  return (
    <main>
      <Filter attributes={attributes} onFilterChange={handleFilterChange} />
      <InlineFilter
        attributes={attributes}
        onFilterChange={handleFilterChange}
      />
      <DataTable
        columns={columns as ColumnDef<unknown>[]}
        data={filteredData}
      />
    </main>
  );
}
