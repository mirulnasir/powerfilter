"use client";

import { initialProductsOptions } from "@/app/services/products/getProducts";

import { InternalQuerySort } from "@/app/types/query-engine/common";
import { InlineFilter } from "@/components/filter";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
  searchParamsToProductQuery,
  sortFromSearchParams,
  sortToSearchParams,
  paginationFromSearchParams,
} from "@/components/filter/search-params";
import { FilterRule } from "@/components/filter/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "./table";
import { columns } from "./table/columns";
import { DataTablePagination } from "./table/data-table-pagination";

interface DashboardContentProps {
  filterString: string | string[];
}

export function DashboardContent({ filterString }: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterRules = filtersFromSearchParams(filterString, "filter");
  const filterQuery = searchParamsToProductQuery(filterString, "filter");

  // Get sort from search params with default
  const sortParam = searchParams.get("sort");
  const currentSort = sortFromSearchParams(sortParam ?? undefined);

  // Get pagination from search params
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const currentPagination = paginationFromSearchParams(pageParam, limitParam);

  console.log({ filterRules, filterQuery, currentSort, currentPagination });

  const { data: productsData, isLoading } = useQuery(
    initialProductsOptions({
      filter: filterQuery,
      sort: currentSort,
      pagination: currentPagination,
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

  /**
   * Updates the limit parameter in URL and resets to page 1
   */
  const handlePageSizeChange = (limit: number) => {
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.set("limit", limit.toString());
    newSearchParams.set("page", "1"); // Reset to first page when changing limit

    router.push(`?${newSearchParams.toString()}`);
  };

  /**
   * Updates the page parameter in URL (1-based)
   */
  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.set("page", page.toString());

    router.push(`?${newSearchParams.toString()}`);
  };

  // Calculate current page from pagination data
  const currentPage =
    Math.floor(
      (productsData?.pagination.offset ?? 0) / currentPagination.limit,
    ) + 1;
  return (
    <div className="flex flex-col h-full">
      <div className="grow-0 shrink-0 ">
        <InlineFilter
          filters={filterRules}
          onFilterChange={handleFilterChange}
        />
      </div>
      <div className="h-full flex flex-col min-w-0 box-border overflow-hidden">
        <DataTable
          columns={columns as ColumnDef<unknown>[]}
          data={productsData?.data ?? []}
          sort={currentSort}
          onSortChange={handleSortChange}
          isLoading={isLoading}
        />
      </div>
      <div className="grow-0 shrink-0 py-2 border-t">
        <DataTablePagination
          totalResults={productsData?.total ?? 0}
          pageSize={currentPagination.limit}
          currentPage={currentPage}
          onPageSizeChange={handlePageSizeChange}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
