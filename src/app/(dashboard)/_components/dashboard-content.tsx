"use client";

import { initialProductsOptions } from "@/app/services/products/getProducts";
import { SupplierAttribute } from "@/app/types/attribute";
import { InlineFilter } from "@/components/filter";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
  searchParamsToProductQuery,
} from "@/components/filter/search-params";
import { FilterRule } from "@/components/filter/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DataTable } from "./table";
import { columns } from "./table/columns";

interface DashboardContentProps {
  attributes: SupplierAttribute[];
  filterString: string | string[];
}

export function DashboardContent({
  attributes,
  filterString,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterRules = filtersFromSearchParams(filterString, "filter");
  const filterQuery = searchParamsToProductQuery(filterString, "filter");
  console.log({ filterRules, filterQuery });
  const { data: productsData } = useSuspenseQuery(
    initialProductsOptions({
      filter: filterQuery,
    }),
  );
  console.log("productsData", productsData);

  /**
   * Updates both the filter state and URL search parameters when filters change
   * This ensures the filter state is persisted in the URL for bookmarking and navigation
   */
  const handleFilterChange = async (rules: FilterRule[]) => {
    console.log("handle Filter rules:", rules);

    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.delete("filter");

    const filterParams = filtersToSearchParams(rules, "filter");
    filterParams.forEach((value, key) => {
      newSearchParams.append(key, value);
    });

    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <main>
      <InlineFilter
        attributes={attributes}
        filters={filterRules}
        onFilterChange={handleFilterChange}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          columns={columns as ColumnDef<unknown>[]}
          data={productsData.data}
        />
      </Suspense>
    </main>
  );
}
