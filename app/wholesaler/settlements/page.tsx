/**
 * @file app/wholesaler/settlements/page.tsx
 * @description 정산 관리 페이지
 *
 * 정산 예정 및 완료 내역을 조회하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 정산 목록 표시 (예정/완료 필터)
 * 2. 정산 상태 필터링
 * 3. 날짜 범위 필터링
 * 4. 정산 상세 조회 (Dialog)
 * 5. 총 정산 예정 금액 표시
 * 6. 정산 통계 카드 표시
 * 7. 정렬 기능
 * 8. 페이지네이션
 *
 * @dependencies
 * - lib/supabase/queries/settlements.ts
 * - components/wholesaler/Settlements/SettlementDetailDialog.tsx
 * - components/wholesaler/Orders/OrderDateRangePicker.tsx
 */

"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { X, Calendar, ArrowUp, ArrowDown, ArrowUpDown, Eye, ChevronDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettlementTableSkeleton from "@/components/wholesaler/Settlements/SettlementTableSkeleton";
import SettlementDetailDialog from "@/components/wholesaler/Settlements/SettlementDetailDialog";
import OrderDateRangePicker from "@/components/wholesaler/Orders/OrderDateRangePicker";
import { useWholesaler } from "@/hooks/useWholesaler";
import type { SettlementFilter } from "@/types/settlement";
import type { SettlementStatus } from "@/types/database";
import { formatPrice } from "@/lib/utils/format";
import type { SettlementWithOrder } from "@/lib/supabase/queries/settlements";
import { updateSettlementStatus } from "@/actions/wholesaler/update-settlement-status";

// 정산 목록 조회 함수
async function fetchSettlements(
  filter: SettlementFilter = {},
  page: number = 1,
  pageSize: number = 20,
  sortBy:
    | "created_at"
    | "scheduled_payout_at"
    | "order_amount" = "scheduled_payout_at",
  sortOrder: "asc" | "desc" = "asc",
) {
  console.log("🔍 [settlements-page] 정산 목록 조회 요청", {
    filter,
    page,
    pageSize,
    sortBy,
    sortOrder,
  });

  const response = await fetch("/api/wholesaler/settlements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter, page, pageSize, sortBy, sortOrder }),
  });

  if (!response.ok) {
    let errorMessage = "정산 목록 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.details || errorData.error || errorMessage;
      console.error("❌ [settlements-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [settlements-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [settlements-page] 정산 목록 조회 성공", {
    settlementsCount: data.settlements?.length ?? 0,
    total: data.total,
  });

  return data;
}

// 정산 통계 조회 함수 (헤더용)
async function fetchSettlementStats() {
  console.log("📊 [settlements-page] 정산 통계 조회 요청");

  const response = await fetch("/api/wholesaler/settlements/stats");

  if (!response.ok) {
    let errorMessage = "정산 통계 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.details || errorData.error || errorMessage;
      console.error("❌ [settlements-page] 통계 API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [settlements-page] 통계 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [settlements-page] 정산 통계 조회 성공", data);

  return data;
}

type SortField = "scheduled_payout_at" | "order_amount";
type SortOrder = "asc" | "desc";

export default function SettlementsPage() {
  const {
    data: wholesaler,
    isLoading: isWholesalerLoading,
    error: wholesalerError,
  } = useWholesaler();

  // QueryClient 인스턴스 가져오기
  const queryClient = useQueryClient();

  // 필터 상태
  const [statusFilter, setStatusFilter] = React.useState<
    SettlementStatus | "all"
  >("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // 정렬 상태
  const [sortBy, setSortBy] = React.useState<SortField>("scheduled_payout_at");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");

  // 페이지네이션 상태
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Dialog 상태
  const [selectedSettlement, setSelectedSettlement] =
    React.useState<SettlementWithOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // 필터 객체 생성
  const filter: SettlementFilter = React.useMemo(() => {
    const filterObj: SettlementFilter = {};

    // 상태 필터
    if (statusFilter !== "all") {
      filterObj.status = statusFilter;
    }

    // 날짜 범위 필터
    if (dateRange?.from) {
      filterObj.start_date = format(dateRange.from, "yyyy-MM-dd");
    }
    if (dateRange?.to) {
      filterObj.end_date = format(dateRange.to, "yyyy-MM-dd");
    }

    return filterObj;
  }, [dateRange, statusFilter]);

  // 정산 목록 조회
  const {
    data: settlementsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settlements", filter, page, pageSize, sortBy, sortOrder],
    queryFn: () => fetchSettlements(filter, page, pageSize, sortBy, sortOrder),
    enabled: !!wholesaler?.id,
  });

  // 필터 변경 시 페이지를 1로 리셋
  React.useEffect(() => {
    setPage(1);
  }, [filter, sortBy, sortOrder]);

  // 정산 통계 조회 (헤더용)
  const { data: statsData } = useQuery({
    queryKey: ["settlements-stats"],
    queryFn: fetchSettlementStats,
    enabled: !!wholesaler?.id,
  });

  // 에러 처리
  React.useEffect(() => {
    if (wholesalerError) {
      console.error(
        "❌ [settlements-page] 도매점 정보 조회 오류:",
        wholesalerError instanceof Error
          ? wholesalerError.message
          : JSON.stringify(wholesalerError, null, 2),
      );
    }
  }, [wholesalerError]);

  React.useEffect(() => {
    if (error) {
      console.error("❌ [settlements-page] 정산 목록 조회 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "정산 목록을 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [error]);

  // 필터 변경 시 페이지 초기화
  React.useEffect(() => {
    setPage(1);
  }, [filter, sortBy, sortOrder]);

  // 필터 초기화
  const handleResetFilters = () => {
    setDateRange(undefined);
    setStatusFilter("all");
    setSortBy("scheduled_payout_at");
    setSortOrder("asc");
    setPage(1);
  };

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // 같은 필드면 정렬 순서 토글
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 다른 필드면 새로 설정하고 오름차순으로
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // 상세보기 핸들러
  const handleViewDetail = (settlement: SettlementWithOrder) => {
    setSelectedSettlement(settlement);
    setIsDialogOpen(true);
  };

  // 정산 상태 변경 핸들러
  const handleStatusChange = async (
    settlementId: string,
    newStatus: SettlementStatus,
  ) => {
    console.log("🔄 [settlements-page] 정산 상태 변경 요청", {
      settlementId,
      newStatus,
    });

    try {
      const result = await updateSettlementStatus(settlementId, newStatus);

      if (result.success) {
        toast.success(
          `정산 상태가 ${newStatus === "completed" ? "완료" : "대기"}로 변경되었습니다.`,
        );

        // 쿼리 캐시 무효화 및 재조회
        queryClient.invalidateQueries({ queryKey: ["settlements"] });
        queryClient.invalidateQueries({ queryKey: ["settlements-stats"] });
      } else {
        toast.error(result.error || "정산 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ [settlements-page] 정산 상태 변경 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "정산 상태 변경 중 오류가 발생했습니다.",
      );
    }
  };

  const wholesalerId = wholesaler?.id ?? null;

  // 도매점 ID가 없으면 로딩 또는 에러 표시
  if (isWholesalerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!wholesalerId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">도매점 정보를 불러올 수 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-2">
            도매점 등록이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  // 통계 데이터 계산
  const stats = statsData ?? {
    total_amount: 0,
    total_platform_fee: 0,
    total_wholesaler_amount: 0,
    pending_amount: 0,
    completed_amount: 0,
    pending_count: 0,
    completed_count: 0,
  };

  // 필터링된 정산 목록 (클라이언트 사이드 필터링은 하지 않음, 서버에서 필터링됨)
  const filteredSettlements = settlementsData?.settlements ?? [];
  const totalCount = settlementsData?.total ?? 0;
  const totalPages = settlementsData?.totalPages ?? 1;

  // 통계 카드는 항상 전체 통계를 표시
  const totalAmount = stats.total_wholesaler_amount; // 전체 정산 금액
  const pendingCount = stats.pending_count; // 전체 정산 대기 건수
  const completedCount = stats.completed_count; // 전체 정산 완료 건수

  // 필터 버튼의 건수는 필터에 맞는 전체 개수
  // totalCount는 서버에서 필터를 적용한 후 반환된 전체 개수
  const allCount = totalCount; // 서버에서 반환된 전체 개수 (필터 적용됨)
  const pendingCountForFilter =
    statusFilter === "pending"
      ? totalCount // 필터가 pending이면 서버에서 반환된 전체 개수
      : stats.pending_count; // 그 외에는 전체 통계
  const completedCountForFilter =
    statusFilter === "completed"
      ? totalCount // 필터가 completed이면 서버에서 반환된 전체 개수
      : stats.completed_count; // 그 외에는 전체 통계

  // 상태 텍스트 및 색상 함수
  const getStatusText = (status: SettlementStatus) => {
    return status === "pending" ? "정산 대기" : "정산 완료";
  };

  const getStatusColor = (status: SettlementStatus) => {
    return status === "pending"
      ? "bg-[#fbbf24] text-white"
      : "bg-[#10B981] text-white";
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // 페이지 번호 배열 생성 (최대 5개, 현재 페이지 중심)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPages = 5;
    const currentPage = page;

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
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">정산 관리</h1>
        <p className="mt-2 text-muted-foreground">
          투명한 정산 내역을 확인하고 관리하세요.
        </p>
      </div>

      {/* 정산 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 overflow-hidden transition-colors duration-200">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <p className="text-sm text-gray-600 dark:text-muted-foreground font-medium">총 정산 금액</p>
          <p className="text-3xl font-bold text-[#10B981] mt-2">
            {totalAmount.toLocaleString()}원
          </p>
        </div>
        <div className="relative group bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 overflow-hidden transition-colors duration-200">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <p className="text-sm text-gray-600 dark:text-muted-foreground font-medium">정산 대기</p>
          <p className="text-3xl font-bold text-[#fbbf24] mt-2">
            {pendingCount}건
          </p>
        </div>
        <div className="relative group bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 overflow-hidden transition-colors duration-200">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <p className="text-sm text-gray-600 dark:text-muted-foreground font-medium">정산 완료</p>
          <p className="text-3xl font-bold text-[#10B981] mt-2">
            {completedCount}건
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* 필터 버튼 */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              statusFilter === "all"
                ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 dark:shadow-[0_4px_20px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_6px_25px_rgba(16,185,129,0.35)]"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-colors duration-200"
            }`}
          >
            전체 ({allCount})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              statusFilter === "pending"
                ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 dark:shadow-[0_4px_20px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_6px_25px_rgba(16,185,129,0.35)]"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-colors duration-200"
            }`}
          >
            정산 대기 ({pendingCountForFilter})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              statusFilter === "completed"
                ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 dark:shadow-[0_4px_20px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_6px_25px_rgba(16,185,129,0.35)]"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-colors duration-200"
            }`}
          >
            정산 완료 ({completedCountForFilter})
          </button>
        </div>

        {/* 날짜 범위 선택 */}
        <div className="flex items-center gap-4 flex-wrap">
          <OrderDateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          {/* 필터 초기화 */}
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="md:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            초기화
          </Button>
        </div>
      </div>

      {/* 정산 내역 테이블 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        {error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-destructive">
              정산 목록을 불러오는 중 오류가 발생했습니다.
            </div>
          </div>
        ) : isLoading ? (
          <SettlementTableSkeleton />
        ) : filteredSettlements.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground dark:text-muted-foreground">
            해당 조건의 정산 내역이 없습니다.
          </div>
        ) : (
          <>
            {/* 데스크톱 테이블 */}
            <div className="hidden lg:block overflow-x-auto rounded-xl">
              <table className="w-full min-w-[800px]">
                <thead className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                      주문번호
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                      <button
                        onClick={() => handleSort("order_amount")}
                        className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        판매금액
                        {renderSortIcon("order_amount")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                      플랫폼 수수료 (5%)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                      최종 지급액
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                      <button
                        onClick={() => handleSort("scheduled_payout_at")}
                        className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        정산일
                        {renderSortIcon("scheduled_payout_at")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredSettlements.map((settlement) => {
                    const status = settlement.status as SettlementStatus;
                    return (
                      <tr
                        key={settlement.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        onClick={(e) => {
                          // select 클릭 시에는 상세보기로 이동하지 않도록
                          const target = e.target as HTMLElement;
                          if (target.closest("select")) {
                            return;
                          }
                          handleViewDetail(settlement);
                        }}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-foreground cursor-pointer">
                          {settlement.orders?.order_number || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground dark:text-foreground cursor-pointer">
                          {formatPrice(settlement.order_amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 dark:text-red-300 cursor-pointer">
                          -{formatPrice(settlement.platform_fee)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#10B981] cursor-pointer">
                          {formatPrice(settlement.wholesaler_amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground cursor-pointer">
                          {settlement.completed_at
                            ? format(new Date(settlement.completed_at), "yyyy-MM-dd")
                            : settlement.scheduled_payout_at
                              ? format(
                                  new Date(settlement.scheduled_payout_at),
                                  "yyyy-MM-dd",
                                )
                              : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block">
                            <select
                              value={status}
                              onChange={(e) =>
                                handleStatusChange(
                                  settlement.id,
                                  e.target.value as SettlementStatus,
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={`appearance-none pl-4 pr-10 py-2 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                                status,
                              )}`}
                            >
                              <option
                                value="pending"
                                className="text-gray-900 bg-white"
                              >
                                정산 대기
                              </option>
                              <option
                                value="completed"
                                className="text-gray-900 bg-white"
                              >
                                정산 완료
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
              {filteredSettlements.map((settlement) => {
                const status = settlement.status as SettlementStatus;
                return (
                  <div
                    key={settlement.id}
                    className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground block mb-1">
                          {settlement.completed_at
                            ? format(new Date(settlement.completed_at), "yyyy-MM-dd")
                            : settlement.scheduled_payout_at
                              ? format(
                                  new Date(settlement.scheduled_payout_at),
                                  "yyyy-MM-dd",
                                )
                              : "정산 예정"}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground dark:text-muted-foreground">
                          {settlement.orders?.order_number || "-"}
                        </span>
                      </div>
                      <div className="relative inline-block shrink-0">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(
                              settlement.id,
                              e.target.value as SettlementStatus,
                            )
                          }
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                            status,
                          )}`}
                        >
                          <option
                            value="pending"
                            className="text-gray-900 bg-white"
                          >
                            정산 대기
                          </option>
                          <option
                            value="completed"
                            className="text-gray-900 bg-white"
                          >
                            정산 완료
                          </option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-80" />
                      </div>
                    </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2 text-sm transition-colors duration-200">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground dark:text-muted-foreground">판매금액</span>
                      <span className="text-foreground dark:text-foreground">
                        {formatPrice(settlement.order_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-500 dark:text-red-300">
                      <span>수수료 (5%)</span>
                      <span>-{formatPrice(settlement.platform_fee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold text-[#10B981]">
                      <span>최종 지급액</span>
                      <span>{formatPrice(settlement.wholesaler_amount)}</span>
                    </div>
                  </div>

                  {/* 모바일 상세보기 버튼 */}
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(settlement)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      상세보기
                    </Button>
                  </div>
                  </div>
                );
              })}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                {/* 페이지 정보 및 페이지 크기 선택 */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  {/* 현재 페이지 정보 */}
                  <div className="text-sm text-muted-foreground dark:text-gray-300">
                    {(() => {
                      const startIndex = (page - 1) * pageSize + 1;
                      const endIndex = Math.min(page * pageSize, totalCount);
                      return `${startIndex}-${endIndex} / ${totalCount}건`;
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
                        setPageSize(Number(value));
                        setPage(1);
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-9 px-3"
                  >
                    이전
                  </Button>

                  {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
                  <div className="hidden md:flex items-center gap-1">
                    {pageNumbers.map((pageNum, index) => {
                      if (pageNum === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-sm text-muted-foreground dark:text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNumber = pageNum as number;
                      const isActive = pageNumber === page;

                      return (
                        <Button
                          key={pageNumber}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNumber)}
                          className={`h-9 min-w-[36px] ${
                            isActive
                              ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                              : ""
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  {/* 현재 페이지 번호 (모바일만 표시) */}
                  <div className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground dark:text-foreground">
                    {page} / {totalPages}
                  </div>

                  {/* 다음 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-9 px-3"
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 정산 안내 */}
      <div className="relative bg-emerald-50 dark:bg-gray-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-6 overflow-hidden transition-colors duration-200">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#10B981] dark:text-emerald-200 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-foreground mb-2">정산 안내</h3>
            <ul className="text-sm text-gray-700 dark:text-muted-foreground space-y-1">
              <li>• 정산은 주문 완료 후 익일 자동으로 처리됩니다.</li>
              <li>
                • 플랫폼 수수료는 판매금액의 5%이며, 투명하게 공개됩니다.
              </li>
              <li>• 정산 내역은 언제든지 확인 가능합니다.</li>
              <li>
                • 정산 관련 문의사항은 고객센터를 통해 접수해주시기 바랍니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 정산 상세 Dialog */}
      <SettlementDetailDialog
        settlement={selectedSettlement}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
