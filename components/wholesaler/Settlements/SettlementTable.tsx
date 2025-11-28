/**
 * @file components/wholesaler/Settlements/SettlementTable.tsx
 * @description 정산 테이블 컴포넌트
 *
 * TanStack Table을 사용한 정산 목록 테이블입니다.
 * 정산 상세 정보를 Dialog로 표시합니다.
 *
 * @dependencies
 * - @tanstack/react-table
 * - components/ui/table.tsx
 * - components/wholesaler/Settlements/SettlementStatusBadge.tsx
 * - components/wholesaler/Settlements/SettlementDetailDialog.tsx
 * - lib/utils/format.ts
 */

"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SettlementStatusBadge from "./SettlementStatusBadge";
import SettlementDetailDialog from "./SettlementDetailDialog";
import { formatPrice } from "@/lib/utils/format";
import type { SettlementWithOrder } from "@/lib/supabase/queries/settlements";

interface SettlementTableProps {
  settlements: SettlementWithOrder[];
  isLoading?: boolean;
  totalPendingAmount?: number; // 총 정산 예정 금액 (하단 표시용)
}

export default function SettlementTable({
  settlements,
  isLoading = false,
  totalPendingAmount = 0,
}: SettlementTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedSettlement, setSelectedSettlement] =
    React.useState<SettlementWithOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // 상세보기 핸들러
  const handleViewDetail = (settlement: SettlementWithOrder) => {
    setSelectedSettlement(settlement);
    setIsDialogOpen(true);
  };

  // 컬럼 정의
  const columns: ColumnDef<SettlementWithOrder>[] = React.useMemo(
    () => [
      {
        accessorKey: "orders.order_number",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-8 px-2 lg:px-3"
            >
              주문번호
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const orderNumber = row.original.orders?.order_number;
          return <div className="font-medium">{orderNumber || "-"}</div>;
        },
      },
      {
        accessorKey: "orders.created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-8 px-2 lg:px-3"
            >
              주문일
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const orderDate = row.original.orders?.created_at;
          if (!orderDate) return <div>-</div>;
          return (
            <div className="text-sm">
              {format(new Date(orderDate), "yyyy-MM-dd", { locale: ko })}
            </div>
          );
        },
      },
      {
        accessorKey: "scheduled_payout_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-8 px-2 lg:px-3"
            >
              정산 예정일
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="text-sm">
              {format(
                new Date(row.getValue("scheduled_payout_at")),
                "yyyy-MM-dd",
                { locale: ko },
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "order_amount",
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="h-8 px-2 lg:px-3"
              >
                주문 금액
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const amount = row.getValue("order_amount") as number;
          return (
            <div className="text-right font-medium">{formatPrice(amount)}</div>
          );
        },
      },
      {
        accessorKey: "platform_fee",
        header: () => <div className="text-right">수수료</div>,
        cell: ({ row }) => {
          const fee = row.getValue("platform_fee") as number;
          return (
            <div className="text-right text-sm text-muted-foreground">
              {formatPrice(fee)}
            </div>
          );
        },
      },
      {
        accessorKey: "wholesaler_amount",
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="h-8 px-2 lg:px-3"
              >
                정산 금액
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const amount = row.getValue("wholesaler_amount") as number;
          return (
            <div className="text-right font-bold text-green-600">
              {formatPrice(amount)}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => {
          return <SettlementStatusBadge status={row.getValue("status")} />;
        },
      },
      {
        id: "actions",
        header: "액션",
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetail(row.original)}
            >
              <Eye className="h-4 w-4 mr-2" />
              상세보기
            </Button>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: settlements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (settlements.length === 0) {
    return null; // EmptyState는 페이지에서 처리
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 총 정산 예정 금액 표시 (하단) */}
        {totalPendingAmount > 0 && (
          <div className="flex justify-end rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                총 정산 예정 금액:
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatPrice(totalPendingAmount)}
              </span>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            다음
          </Button>
        </div>
      </div>

      {/* 정산 상세 Dialog */}
      <SettlementDetailDialog
        settlement={selectedSettlement}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
