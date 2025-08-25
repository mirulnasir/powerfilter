"use client";

import { Product, ProductAttribute } from "@/app/types/product";
import { ColumnDef } from "@tanstack/react-table";

const getAttribute = (attributes: ProductAttribute[], key: string) => {
  return attributes.find((a) => a.key === key);
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "skuId",
    header: "SKU ID",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
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
