"use client";

import { initialProductsOptions } from "@/app/services/products/getProducts";
import { SupplierAttribute } from "@/app/types/attribute";
import { InternalQuerySort } from "@/app/types/query-engine/common";
import { InlineFilter } from "@/components/filter";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
  searchParamsToProductQuery,
  sortFromSearchParams,
  sortToSearchParams,
} from "@/components/filter/search-params";
import { FilterRule } from "@/components/filter/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
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

  // Get sort from search params with default
  const sortParam = searchParams.get("sort");
  const currentSort = sortFromSearchParams(sortParam ?? undefined);

  console.log({ filterRules, filterQuery, currentSort });

  const { data: productsData, isLoading } = useQuery(
    initialProductsOptions({
      filter: filterQuery,
      sort: currentSort,
    }),
  );

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

  /**
   * Updates the sort parameter in URL and triggers new API call
   * Removes sort from URL if undefined (resets to default)
   */
  const handleSortChange = (sort: InternalQuerySort | undefined) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (sort) {
      newSearchParams.set("sort", sortToSearchParams(sort)!);
    } else {
      newSearchParams.delete("sort");
    }

    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <main>
      <InlineFilter
        attributes={attributes}
        filters={filterRules}
        onFilterChange={handleFilterChange}
      />
      <DataTable
        columns={columns as ColumnDef<unknown>[]}
        data={productsData?.data ?? []}
        sort={currentSort}
        onSortChange={handleSortChange}
        isLoading={isLoading}
      />
    </main>
  );
}
