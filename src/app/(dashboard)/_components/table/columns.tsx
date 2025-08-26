"use client";

import { Product, ProductAttribute } from "@/app/types/product";
import { ColumnDef, Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { InternalQuerySort } from "@/app/types/query-engine/common";
import { cn } from "@/lib/utils";

const getAttribute = (attributes: ProductAttribute[], key: string) => {
  return attributes.find((a) => a.key === key);
};

type MetaType = {
  sort: InternalQuerySort | undefined;
  onSortChange: ((sort: InternalQuerySort | undefined) => void) | undefined;
};

/**
 * Sortable header component that displays sort indicators and handles API sort requests
 * Shows different icons based on current sort state and cycles through: unsorted -> ASC -> DESC -> unsorted
 */
const SortableHeader = ({
  field,
  children,
  table,
}: {
  field: string;
  children: React.ReactNode;
  table: Table<Product>;
}) => {
  const sort = (table.options.meta as MetaType)?.sort as
    | InternalQuerySort
    | undefined;
  const onSortChange = (table.options.meta as MetaType)?.onSortChange as
    | ((sort: InternalQuerySort | undefined) => void)
    | undefined;

  const isCurrentSort = sort?.field === field;
  const currentOrder = isCurrentSort ? sort.order : null;

  const handleSort = () => {
    if (!onSortChange) return;

    if (!isCurrentSort) {
      // Not currently sorted, set to ASC
      onSortChange({ field, order: "ASC" });
    } else if (currentOrder === "ASC") {
      // Currently ASC, change to DESC
      onSortChange({ field, order: "DESC" });
    } else {
      // Currently DESC, remove sort
      onSortChange(undefined);
    }
  };

  const getSortIcon = () => {
    if (!isCurrentSort) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50 " />;
    }

    return currentOrder === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4 text-teal-600" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-teal-600" />
    );
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className={cn(
        "h-full p-0 hover:bg-transparent font-medium rounded-none",
        isCurrentSort && "border-b-2  border-teal-600",
      )}
    >
      {children}
      {getSortIcon()}
    </Button>
  );
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "skuId",
    header: ({ table }) => (
      <SortableHeader field="skuId" table={table}>
        SKU ID
      </SortableHeader>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ table }) => (
      <SortableHeader field="updatedAt" table={table}>
        Updated At
      </SortableHeader>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ table }) => (
      <SortableHeader field="createdAt" table={table}>
        Created At
      </SortableHeader>
    ),
  },
  {
    header: "Attributes",
    columns: [
      {
        header: "Name",
        cell: ({ row }) => {
          return <>{getAttribute(row.original.attributes, "name")?.value}</>;
        },
      },
      {
        header: "Brand",
        cell: ({ row }) => {
          return <>{getAttribute(row.original.attributes, "brand")?.value}</>;
        },
      },
    ],
  },
];
