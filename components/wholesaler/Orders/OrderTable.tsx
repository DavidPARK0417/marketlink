/**
 * @file components/wholesaler/Orders/OrderTable.tsx
 * @description 주문 테이블 컴포넌트
 *
 * TanStack Table을 사용한 주문 목록 테이블입니다.
 * 체크박스 선택 및 일괄 상태 변경 기능을 포함합니다.
 *
 * @dependencies
 * - @tanstack/react-table
 * - components/ui/table.tsx
 * - components/ui/checkbox.tsx
 * - components/wholesaler/Orders/OrderStatusBadge.tsx
 */

"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderTableSkeleton from "./OrderTableSkeleton";
import type { OrderDetail } from "@/types/order";
import type { OrderStatus } from "@/types/database";

interface OrderTableProps {
  orders: OrderDetail[];
  isLoading?: boolean;
  onBatchStatusChange?: (orderIds: string[], status: OrderStatus) => void;
  isBatchProcessing?: boolean;
  // 서버 사이드 페이지네이션 props
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function OrderTable({
  orders,
  isLoading = false,
  onBatchStatusChange,
  isBatchProcessing = false,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: OrderTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // 선택된 주문 ID 배열
  const selectedOrderIds = React.useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => orders[parseInt(key)]?.id)
      .filter(Boolean) as string[];
  }, [rowSelection, orders]);

  // 일괄 접수 확인 핸들러
  const handleBatchConfirm = () => {
    if (selectedOrderIds.length === 0) return;
    if (!onBatchStatusChange) return;

    const confirmed = window.confirm(
      `선택한 ${selectedOrderIds.length}개의 주문을 접수 확인 처리하시겠습니까?`,
    );

    if (confirmed) {
      onBatchStatusChange(selectedOrderIds, "confirmed");
      // 선택 초기화
      setRowSelection({});
    }
  };

  // 일괄 출고 처리 핸들러
  const handleBatchShip = () => {
    if (selectedOrderIds.length === 0) return;
    if (!onBatchStatusChange) return;

    const confirmed = window.confirm(
      `선택한 ${selectedOrderIds.length}개의 주문을 출고 처리하시겠습니까?`,
    );

    if (confirmed) {
      onBatchStatusChange(selectedOrderIds, "shipped");
      // 선택 초기화
      setRowSelection({});
    }
  };

  // 상태별 색상 매핑 (디자인 핸드오프 스타일)
  const getStatusColor = (status: OrderStatus) => {
    const colorMap: Record<OrderStatus, string> = {
      pending: "bg-[#fbbf24] text-white",
      confirmed: "bg-[#10B981] text-white",
      shipped: "bg-[#3b82f6] text-white",
      completed: "bg-gray-400 text-white",
      cancelled: "bg-red-500 text-white",
    };
    return colorMap[status] || "bg-gray-400 text-white";
  };

  // 상태별 텍스트 매핑
  const getStatusText = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, string> = {
      pending: "신규",
      confirmed: "확인완료",
      shipped: "출고완료",
      completed: "배송완료",
      cancelled: "취소",
    };
    return statusMap[status] || status;
  };

  // 개별 주문 상태 변경 핸들러
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (!onBatchStatusChange) return;
    onBatchStatusChange([orderId], newStatus);
  };

  // 행 클릭 핸들러
  const handleRowClick = (orderId: string) => {
    console.log("🧭 [order-table] 행 클릭 → 상세 이동", { orderId });
    router.push(`/wholesaler/orders/${orderId}`);
  };

  const columns: ColumnDef<OrderDetail>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="전체 선택"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="행 선택"
            disabled={
              row.original.status === "completed" ||
              row.original.status === "cancelled"
            }
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "order_number",
        header: "주문번호",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("order_number")}</div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "주문일",
        cell: ({ row }) => {
          const date = new Date(row.getValue("created_at"));
          return format(date, "yyyy-MM-dd HH:mm", { locale: ko });
        },
      },
      {
        accessorKey: "product",
        header: "상품명",
        cell: ({ row }) => {
          const product = row.original.product;
          return <div className="font-medium">{product?.name || "-"}</div>;
        },
      },
      {
        accessorKey: "variant",
        header: "옵션",
        cell: ({ row }) => {
          const variant = row.original.variant;
          return <div>{variant?.name || "-"}</div>;
        },
      },
      {
        accessorKey: "quantity",
        header: "수량",
        cell: ({ row }) => {
          return <div className="text-center">{row.getValue("quantity")}</div>;
        },
      },
      {
        accessorKey: "total_amount",
        header: "금액",
        cell: ({ row }) => {
          const amount = row.getValue("total_amount") as number;
          return (
            <div className="text-right font-medium">
              {new Intl.NumberFormat("ko-KR").format(amount)}원
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => {
          const status = row.getValue("status") as OrderStatus;
          return (
            <div className="relative inline-block">
              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(
                    row.original.id,
                    e.target.value as OrderStatus
                  )
                }
                className={`appearance-none pl-4 pr-10 py-2 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                  status
                )}`}
              >
                <option value="pending" className="text-gray-900 bg-white">
                  신규
                </option>
                <option value="confirmed" className="text-gray-900 bg-white">
                  확인완료
                </option>
                <option value="shipped" className="text-gray-900 bg-white">
                  출고완료
                </option>
                <option value="completed" className="text-gray-900 bg-white">
                  배송완료
                </option>
                <option value="cancelled" className="text-gray-900 bg-white">
                  취소
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-80" />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "액션",
        cell: ({ row }) => {
          return (
            <Link href={`/wholesaler/orders/${row.original.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                상세보기
              </Button>
            </Link>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // 서버 사이드 페이지네이션 사용하므로 getPaginationRowModel 제거
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: (row) => {
      // 완료/취소된 주문은 선택 불가
      return (
        row.original.status !== "completed" &&
        row.original.status !== "cancelled"
      );
    },
    state: {
      sorting,
      rowSelection,
    },
  });

  if (isLoading) {
    return <OrderTableSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">주문이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 일괄 처리 버튼 */}
      {selectedOrderIds.length > 0 && onBatchStatusChange && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
          <span className="text-sm font-medium">
            {selectedOrderIds.length}개 선택됨
          </span>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleBatchConfirm}
              disabled={isBatchProcessing}
            >
              {isBatchProcessing ? "처리 중..." : "일괄 접수 확인"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleBatchShip}
              disabled={isBatchProcessing}
            >
              {isBatchProcessing ? "처리 중..." : "일괄 출고 처리"}
            </Button>
          </div>
        </div>
      )}

      {/* 주문 목록 컨테이너 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
        {/* 데스크톱 테이블 */}
        <div className="hidden lg:block overflow-x-auto max-w-full">
          <table className="w-full min-w-[960px] table-fixed">
            <thead className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-4 py-4 text-center text-sm font-semibold text-foreground dark:text-foreground w-16">
                  번호
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                  주문번호
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                  상품명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                  수량
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                  금액
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                  배송지
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                  주문일시
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {table.getRowModel().rows.map((row, index) => {
                const order = row.original;
                const status = order.status as OrderStatus;
                // 서버 사이드 페이지네이션: rowNumber는 서버에서 가져온 페이지 기준으로 계산
                const rowNumber = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                    onClick={(e) => {
                      // 체크박스나 select 클릭 시에는 이동하지 않도록
                      const target = e.target as HTMLElement;
                      if (
                        target.closest('input[type="checkbox"]') ||
                        target.closest('select')
                      ) {
                        return;
                      }
                      handleRowClick(order.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRowClick(order.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`주문 ${order.order_number} 상세보기`}
                  >
                    <td className="px-4 py-4 text-sm text-muted-foreground dark:text-gray-100 text-center">
                      {rowNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-foreground break-words">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground dark:text-gray-200 break-words">
                      <div className="leading-tight">
                        {order.product?.name || "-"}
                        {order.variant && ` (${order.variant.name})`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground dark:text-gray-200 text-center">
                      {order.quantity}박스
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground dark:text-foreground text-right">
                      {new Intl.NumberFormat("ko-KR").format(order.total_amount)}
                      원
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground dark:text-gray-200 break-words">
                      {order.delivery_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground dark:text-gray-300">
                      {format(new Date(order.created_at), "MM월 dd일 HH:mm", {
                        locale: ko,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as OrderStatus
                            )
                          }
                          className={`appearance-none pl-4 pr-10 py-2 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                            status
                          )}`}
                        >
                          <option
                            value="pending"
                            className="text-gray-900 bg-white"
                          >
                            신규
                          </option>
                          <option
                            value="confirmed"
                            className="text-gray-900 bg-white"
                          >
                            확인완료
                          </option>
                          <option
                            value="shipped"
                            className="text-gray-900 bg-white"
                          >
                            출고완료
                          </option>
                          <option
                            value="completed"
                            className="text-gray-900 bg-white"
                          >
                            배송완료
                          </option>
                          <option
                            value="cancelled"
                            className="text-gray-900 bg-white"
                          >
                            취소
                          </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-80" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 리스트 */}
        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-800">
          {table.getRowModel().rows.map((row, index) => {
            const order = row.original;
            const status = order.status as OrderStatus;
            // 서버 사이드 페이지네이션: rowNumber는 서버에서 가져온 페이지 기준으로 계산
            const rowNumber = (currentPage - 1) * pageSize + index + 1;
            return (
              <div
                key={row.id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 space-y-4 cursor-pointer"
                onClick={(e) => {
                  // select 클릭 시에는 이동하지 않도록
                  const target = e.target as HTMLElement;
                  if (target.closest('select')) {
                    return;
                  }
                  handleRowClick(order.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(order.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`주문 ${order.order_number} 상세보기`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-foreground dark:text-foreground">
                      {rowNumber}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <span className="text-xs text-muted-foreground dark:text-gray-300 block">
                        {format(new Date(order.created_at), "yyyy년 MM월 dd일 HH:mm", {
                          locale: ko,
                        })}
                      </span>
                      <h3 className="text-base font-bold text-foreground dark:text-gray-50 leading-snug break-words">
                        {order.product?.name || "-"}
                        {order.variant && ` (${order.variant.name})`}
                      </h3>
                      <p className="text-xs text-muted-foreground dark:text-gray-200 font-mono break-words">
                        {order.order_number}
                      </p>
                    </div>
                    <div className="relative inline-block shrink-0">
                      <select
                        value={status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as OrderStatus
                          )
                        }
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                          status
                        )}`}
                      >
                        <option value="pending" className="text-gray-900 bg-white">
                          신규
                        </option>
                        <option
                          value="confirmed"
                          className="text-gray-900 bg-white"
                        >
                          확인완료
                        </option>
                        <option value="shipped" className="text-gray-900 bg-white">
                          출고완료
                        </option>
                        <option
                          value="completed"
                          className="text-gray-900 bg-white"
                        >
                          배송완료
                        </option>
                        <option
                          value="cancelled"
                          className="text-gray-900 bg-white"
                        >
                          취소
                        </option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-80" />
                    </div>
                  </div>
                    <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transition-colors duration-200">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground dark:text-gray-300">주문 수량</span>
                        <span className="font-medium text-foreground dark:text-gray-50">
                        {order.quantity}박스
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-muted-foreground dark:text-gray-300">결제 금액</span>
                        <span className="font-bold text-[#10B981] dark:text-[#34d399]">
                        {new Intl.NumberFormat("ko-KR").format(
                          order.total_amount
                        )}
                        원
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground dark:text-gray-300 break-words">
                    <span className="font-semibold whitespace-nowrap text-foreground dark:text-gray-100">배송지:</span>
                    <span className="break-words text-foreground dark:text-gray-200">{order.delivery_address}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="py-12 text-center text-muted-foreground dark:text-muted-foreground">
            해당 조건의 주문이 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 페이지 정보 및 페이지 크기 선택 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* 현재 페이지 정보 */}
          <div className="text-sm text-muted-foreground dark:text-gray-300">
            {(() => {
              const startIndex = (currentPage - 1) * pageSize + 1;
              const endIndex = Math.min(currentPage * pageSize, total);
              return `${startIndex}-${endIndex} / ${total}건`;
            })()}
          </div>

          {/* 페이지 크기 선택 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground dark:text-gray-300 whitespace-nowrap">
              페이지당:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                onPageSizeChange(Number(value));
                // 페이지 크기 변경 시 첫 페이지로 이동
                onPageChange(1);
              }}
            >
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 페이지 네비게이션 */}
        <div className="flex items-center gap-2">
          {/* 이전 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-9 px-3"
          >
            이전
          </Button>

          {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
          <div className="hidden md:flex items-center gap-1">
            {(() => {
              const totalPages = Math.ceil(total / pageSize);
              const maxPages = 5;

              // 페이지 번호 배열 생성
              const getPageNumbers = (): (number | string)[] => {
                const pages: (number | string)[] = [];

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
                    pages.push("...");
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    // 뒷부분
                    pages.push(1);
                    pages.push("...");
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

              return pageNumbers.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-sm text-muted-foreground dark:text-gray-400"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={`h-9 min-w-[36px] ${
                      isActive
                        ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                        : ""
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              });
            })()}
          </div>

          {/* 현재 페이지 번호 (모바일만 표시) */}
          <div className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground dark:text-foreground">
            {currentPage} / {Math.ceil(total / pageSize)}
          </div>

          {/* 다음 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(total / pageSize)}
            className="h-9 px-3"
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
