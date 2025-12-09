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
import SettlementCard from "./SettlementCard";
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

  // 페이지네이션 정보
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalCount = settlements.length;
  const startIndex = pageIndex * pageSize + 1;
  const endIndex = Math.min((pageIndex + 1) * pageSize, totalCount);
  const totalPages = table.getPageCount();

  // 페이지 번호 배열 생성 (최대 5개, 현재 페이지 중심)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPages = 5;
    const currentPage = pageIndex + 1;

    if (totalPages <= maxPages) {
      // 전체 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 중심으로 5개 표시
      if (currentPage <= 3) {
        // 앞부분
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 뒷부분
        pages.push(1);
        if (totalPages > 5) pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      <div className="space-y-4">
        {/* 데스크톱 테이블 (md 이상) */}
        <div className="hidden md:block">
          <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200">
            <Table>
              <TableHeader className="bg-white dark:bg-gray-900 transition-colors duration-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-gray-200 dark:border-gray-800">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-foreground dark:text-foreground">
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
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-foreground dark:text-foreground">
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
        </div>

        {/* 모바일 카드 (md 미만) */}
        <div className="block md:hidden space-y-4">
          {table.getRowModel().rows.map((row) => (
            <SettlementCard
              key={row.id}
              settlement={row.original}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>

        {/* 총 정산 예정 금액 표시 (하단) */}
        {totalPendingAmount > 0 && (
          <div className="flex justify-end rounded-lg border border-gray-200 dark:border-gray-800 bg-muted/50 dark:bg-gray-900/60 p-4 transition-colors duration-200">
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

        {/* 페이지네이션 (개선된 버전) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 총 개수 정보 */}
          <div className="text-sm text-muted-foreground">
            총 {totalCount}개 중 {startIndex}-{endIndex}개 표시
          </div>

          {/* 페이지네이션 컨트롤 */}
          <div className="flex items-center gap-2">
            {/* 이전 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              이전
            </Button>

            {/* 페이지 번호 */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-sm text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isCurrentPage = pageNum === pageIndex + 1;

                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    className="min-w-[2.5rem]"
                    onClick={() => table.setPageIndex(pageNum - 1)}
                    disabled={isCurrentPage}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* 다음 버튼 */}
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
