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
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, ChevronDown } from "lucide-react";
import Link from "next/link";

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
import type { OrderDetail } from "@/types/order";
import type { OrderStatus } from "@/types/database";

interface OrderTableProps {
  orders: OrderDetail[];
  isLoading?: boolean;
  onBatchStatusChange?: (orderIds: string[], status: OrderStatus) => void;
  isBatchProcessing?: boolean;
}

export default function OrderTable({
  orders,
  isLoading = false,
  onBatchStatusChange,
  isBatchProcessing = false,
}: OrderTableProps) {
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
    getPaginationRowModel: getPaginationRowModel(),
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
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
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* 데스크톱 테이블 */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  주문번호
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  상품명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  수량
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  금액
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  배송지
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  주문일시
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => {
                const order = row.original;
                const status = order.status as OrderStatus;
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {order.product?.name || "-"}
                      {order.variant && ` (${order.variant.name})`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {order.quantity}박스
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {new Intl.NumberFormat("ko-KR").format(
                        order.total_amount
                      )}
                      원
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {order.delivery_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {format(new Date(order.created_at), "MM월 dd일 HH:mm", {
                        locale: ko,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
        <div className="lg:hidden divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => {
            const order = row.original;
            const status = order.status as OrderStatus;
            return (
              <div
                key={row.id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      {format(new Date(order.created_at), "yyyy년 MM월 dd일 HH:mm", {
                        locale: ko,
                      })}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {order.product?.name || "-"}
                      {order.variant && ` (${order.variant.name})`}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {order.order_number}
                    </p>
                  </div>
                  <div className="relative inline-block">
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

                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">주문 수량</span>
                    <span className="font-medium text-gray-900">
                      {order.quantity}박스
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-500">결제 금액</span>
                    <span className="font-bold text-[#10B981]">
                      {new Intl.NumberFormat("ko-KR").format(
                        order.total_amount
                      )}
                      원
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                  <span className="font-semibold whitespace-nowrap">배송지:</span>
                  <span>{order.delivery_address}</span>
                </div>
              </div>
            );
          })}
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            해당 조건의 주문이 없습니다.
          </div>
        )}
      </div>

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
  );
}
