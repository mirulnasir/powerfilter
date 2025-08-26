"use client";

import { Product, ProductAttribute } from "@/app/types/product";
import { InternalQuerySort } from "@/app/types/query-engine/common";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import {
  ArrowDownNarrowWide,
  ArrowUpDown,
  ArrowUpWideNarrow,
} from "lucide-react";

const getAttribute = (attributes: ProductAttribute[], key: string) => {
  return attributes.find((a) => a.key === key);
};

type MetaType = {
  sort: InternalQuerySort | undefined;
  onSortChange: ((sort: InternalQuerySort | undefined) => void) | undefined;
};

const AttributeCell = ({ row, name }: { row: Row<Product>; name: string }) => {
  return (
    <div
      className="max-w-[200px] truncate"
      title={getAttribute(row.original.attributes, name)?.value?.toString()}
    >
      {getAttribute(row.original.attributes, name)?.value?.toString()}
    </div>
  );
};

const AttributeHeader = ({ name }: { name: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium font-mono bg-muted px-2 py-1 rounded-md">
        attr
      </div>
      <div className="">{name}</div>
    </div>
  );
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
      return <ArrowUpDown className=" h-4 w-4 opacity-50 " />;
    }

    return currentOrder === "ASC" ? (
      <ArrowUpWideNarrow className="   h-4 w-4 text-teal-600" />
    ) : (
      <ArrowDownNarrowWide className=" h-4 w-4 text-teal-600" />
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
    accessorKey: "Name",
    header: ({}) => <AttributeHeader name="Name" />,
    cell: ({ row }) => {
      return <AttributeCell row={row} name="name" />;
    },
  },
  {
    accessorKey: "Brand",
    header: ({}) => <AttributeHeader name="Brand" />,
    cell: ({ row }) => {
      return <AttributeCell row={row} name="brand" />;
    },
  },
];
