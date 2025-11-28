import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { GiftCard } from "./giftcards-client";

export const giftCardColumns: ColumnDef<GiftCard, unknown>[] = [
  {
    id: "brand",
    accessorFn: (row) => row.brand?.name,
    header: "Brand",
    cell: ({ row }) => {
      const brand = row.original.brand;
      return (
        <div className="flex items-center gap-2">
          {brand?.imageUrls && 
           brand.imageUrls["80w-326ppi"] && 
           typeof brand.imageUrls["80w-326ppi"] === 'string' && (
            <Image
              src={brand.imageUrls["80w-326ppi"]}
              alt={brand.name || 'Brand image'}
              width={24}
              height={24}
              className="rounded"
            />
          )}
          <span>{brand?.name || "N/A"}</span>
        </div>
      );
    },
  },
  {
    id: "rewardName",
    accessorKey: "rewardName",
    header: "Name",
  },
  {
    id: "valueType",
    accessorKey: "valueType",
    header: "Value Type",
    cell: ({ row }) => {
      const valueType = row.original.valueType;
      return (
        <Badge variant="outline">
          {valueType === "FIXED_VALUE" ? "Fixed" : "Variable"}
        </Badge>
      );
    },
  },
  {
    id: "values",
    accessorFn: (row) =>
      row.valueType === "FIXED_VALUE"
        ? row.giftCards.valuesList
        : `${row.minValue} - ${row.maxValue}`,
    header: "Values",
    cell: ({ row }) => {
      const card = row.original;
      if (card.valueType === "FIXED_VALUE") {
        return `$${card.giftCards.valuesList}`;
      }
      return `$${card.minValue} - $${card.maxValue}`;
    },
  },
  {
    id: "cardCount",
    accessorKey: "giftCards.count",
    header: "Cards",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.giftCards.count}</Badge>;
    },
  },
  {
    id: "providerPercentage",
    accessorFn: (row) => row.rebateInfo?.providerPercentage,
    header: "Prov%",
    cell: ({ row }) => {
      const percentage = row.original.rebateInfo?.providerPercentage;
      return percentage !== undefined
        ? `${(percentage * 100).toFixed(2)}%`
        : "N/A";
    },
  },
  {
    id: "basePercentage",
    accessorFn: (row) => row.rebateInfo?.basePercentage,
    header: "Base%",
    cell: ({ row }) => {
      const percentage = row.original.rebateInfo?.basePercentage;
      return percentage !== undefined
        ? `${(percentage * 100).toFixed(2)}%`
        : "N/A";
    },
  },
  {
    id: "customerPercentage",
    accessorFn: (row) => row.rebateInfo?.customerPercentage,
    header: "Cust%",
    cell: ({ row }) => {
      const percentage = row.original.rebateInfo?.customerPercentage;
      return percentage !== undefined
        ? `${(percentage * 100).toFixed(2)}%`
        : "N/A";
    },
  },
  {
    id: "cpPercentage",
    accessorFn: (row) => row.rebateInfo?.cpPercentage,
    header: "CP%",
    cell: ({ row }) => {
      const percentage = row.original.rebateInfo?.cpPercentage;
      return percentage !== undefined
        ? `${(percentage * 100).toFixed(2)}%`
        : "N/A";
    },
  },
  {
    id: "provider",
    accessorFn: (row) => row.provider?.code,
    header: "Source",
    cell: ({ row }) => row.original.provider?.code || "N/A",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge 
          variant="secondary"
          className={status !== "active" ? "text-destructive" : ""}
        >
          {status}
        </Badge>
      );
    },
  },
];
