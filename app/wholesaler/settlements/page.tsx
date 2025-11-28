/**
 * @file app/wholesaler/settlements/page.tsx
 * @description 정산 관리 페이지
 *
 * 정산 예정 및 완료 내역을 조회하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 정산 목록 표시 (예정/완료 탭)
 * 2. 정산 상태 필터링
 * 3. 날짜 범위 필터링
 * 4. 정산 상세 조회 (Dialog)
 * 5. 총 정산 예정 금액 표시
 *
 * @dependencies
 * - lib/supabase/queries/settlements.ts
 * - components/wholesaler/Settlements/SettlementTable.tsx
 * - components/wholesaler/Orders/OrderDateRangePicker.tsx
 * - components/common/PageHeader.tsx
 * - components/common/EmptyState.tsx
 */

"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { X, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettlementTable from "@/components/wholesaler/Settlements/SettlementTable";
import SettlementTableSkeleton from "@/components/wholesaler/Settlements/SettlementTableSkeleton";
import OrderDateRangePicker from "@/components/wholesaler/Orders/OrderDateRangePicker";
import { useWholesaler } from "@/hooks/useWholesaler";
import type { SettlementFilter } from "@/types/settlement";
import type { SettlementStatus } from "@/types/database";

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

export default function SettlementsPage() {
  const {
    data: wholesaler,
    isLoading: isWholesalerLoading,
    error: wholesalerError,
  } = useWholesaler();

  // 필터 상태
  const [activeTab, setActiveTab] = React.useState<string>("pending");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = React.useState<
    SettlementStatus | "all"
  >("all");

  // 필터 객체 생성
  const filter: SettlementFilter = React.useMemo(() => {
    const filterObj: SettlementFilter = {};

    // 탭에 따른 상태 필터
    if (activeTab === "pending") {
      filterObj.status = "pending";
    } else if (activeTab === "completed") {
      filterObj.status = "completed";
    }

    // 추가 상태 필터 (Select에서 선택한 경우)
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
  }, [activeTab, dateRange, statusFilter]);

  // 정산 목록 조회
  const {
    data: settlementsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settlements", filter],
    queryFn: () => fetchSettlements(filter),
    enabled: !!wholesaler?.id,
  });

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

  // 필터 초기화
  const handleResetFilters = () => {
    setDateRange(undefined);
    setStatusFilter("all");
    setActiveTab("pending");
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

  // 총 정산 예정 금액 (pending 상태만)
  const totalPendingAmount = statsData?.pending_amount ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="정산 관리"
        description={
          totalPendingAmount > 0
            ? `총 정산 예정 금액: ${new Intl.NumberFormat("ko-KR").format(
                totalPendingAmount,
              )}원`
            : "정산 예정 및 완료 내역을 확인하세요."
        }
        hideTitle={true}
      />

      {/* 탭 UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">정산 예정</TabsTrigger>
          <TabsTrigger value="completed">정산 완료</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* 필터 UI */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* 날짜 범위 선택 */}
            <OrderDateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            {/* 상태 선택 */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as SettlementStatus | "all")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="pending">정산 예정</SelectItem>
                <SelectItem value="completed">정산 완료</SelectItem>
              </SelectContent>
            </Select>

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

          {/* 정산 테이블 */}
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-destructive">
                정산 목록을 불러오는 중 오류가 발생했습니다.
              </div>
            </div>
          ) : isLoading ? (
            <SettlementTableSkeleton />
          ) : settlementsData?.settlements.length === 0 ? (
            <EmptyState
              message={
                activeTab === "pending"
                  ? "정산 예정 내역이 없습니다"
                  : "정산 완료 내역이 없습니다"
              }
              description={
                activeTab === "pending"
                  ? "정산 예정인 주문이 없습니다."
                  : "정산 완료된 주문이 없습니다."
              }
              icon={Receipt}
            />
          ) : (
            <SettlementTable
              settlements={settlementsData?.settlements ?? []}
              isLoading={isLoading}
              totalPendingAmount={
                activeTab === "pending" ? totalPendingAmount : 0
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
