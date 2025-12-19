/**
 * @file app/wholesaler/orders/page.tsx
 * @description 주문 관리 페이지
 *
 * 소매점으로부터 들어온 주문을 관리하는 페이지입니다.
 * 주문 목록, 필터링, 상태 변경 등의 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 주문 목록 표시
 * 2. 주문 상태 필터링 (탭 UI)
 * 3. 날짜 범위 필터링
 * 4. 주문번호 검색 (정확 일치)
 * 5. 실시간 주문 업데이트 (Realtime 구독)
 *
 * @dependencies
 * - lib/supabase/queries/orders.ts
 * - components/wholesaler/Orders/OrderTable.tsx
 * - components/wholesaler/Orders/OrderDateRangePicker.tsx
 * - lib/supabase/realtime.ts
 */

"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderTable from "@/components/wholesaler/Orders/OrderTable";
import OrderDateRangePicker from "@/components/wholesaler/Orders/OrderDateRangePicker";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useWholesaler } from "@/hooks/useWholesaler";
import {
  subscribeToNewOrders,
  subscribeToOrderUpdates,
} from "@/lib/supabase/realtime";
import { batchUpdateOrderStatus } from "@/actions/wholesaler/batch-update-order-status";
import type { OrderStatus } from "@/types/database";
import type { OrderFilter } from "@/types/order";

// 주문 목록 조회 함수 (클라이언트에서 직접 호출)
async function fetchOrders(
  filter: OrderFilter = {},
  page: number = 1,
  pageSize: number = 20,
) {
  console.log("🔍 [orders-page] 주문 목록 조회 요청", {
    filter,
    page,
    pageSize,
  });

  const response = await fetch("/api/wholesaler/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter, page, pageSize }),
  });

  if (!response.ok) {
    // 서버에서 반환한 상세 에러 메시지 추출
    let errorMessage = "주문 목록 조회 실패";

    // 응답 상태 정보 로깅
    console.error("❌ [orders-page] API 에러 발생", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
    });

    try {
      // 응답 본문을 텍스트로 먼저 읽어서 확인
      const responseText = await response.text();
      console.log("🔍 [orders-page] 응답 본문 (텍스트):", responseText);

      // 빈 응답인지 확인
      if (!responseText || responseText.trim() === "") {
        console.error("❌ [orders-page] 응답 본문이 비어있음");
        errorMessage = `서버 오류 (${response.status} ${response.statusText})`;
      } else {
        // JSON 파싱 시도
        try {
          const errorData = JSON.parse(responseText);
          errorMessage =
            errorData.details ||
            errorData.error ||
            errorData.message ||
            errorMessage;
          console.error("❌ [orders-page] API 에러 응답:", errorData);
        } catch (parseError) {
          // JSON 파싱 실패 시 텍스트를 에러 메시지로 사용
          console.error(
            "❌ [orders-page] JSON 파싱 실패, 텍스트 사용:",
            parseError,
          );
          errorMessage = responseText || errorMessage;
        }
      }
    } catch (e) {
      console.error("❌ [orders-page] 에러 응답 읽기 실패:", e);
      errorMessage = `서버 오류 (${response.status} ${response.statusText})`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [orders-page] 주문 목록 조회 성공", {
    ordersCount: data.orders?.length ?? 0,
    total: data.total,
  });

  return data;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const supabase = useClerkSupabaseClient();
  const searchParams = useSearchParams();
  const {
    data: wholesaler,
    isLoading: isWholesalerLoading,
    error: wholesalerError,
  } = useWholesaler();

  // URL 쿼리 파라미터에서 초기값 읽기
  const initialSearchTerm = searchParams.get("search") || "";
  const initialCustomer = searchParams.get("customer") || "";
  const initialStatus = searchParams.get("status") || "";

  // 필터 상태
  // URL에서 status 파라미터가 있으면 해당 탭으로 초기화
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    if (initialStatus === "pending") return "pending";
    return "all";
  });
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all",
  );
  const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);

  // 서버 사이드 페이지네이션 상태
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // 필터 객체 생성
  const filter: OrderFilter = React.useMemo(() => {
    const filterObj: OrderFilter = {};

    // 필터 우선순위:
    // 1. 탭 필터 (전체, 신규, 처리중, 완료) - 탭 선택 시 statusFilter는 "all"로 리셋됨
    // 2. 상태 드롭다운 필터 - 상태 선택 시 activeTab은 "all"로 리셋됨
    // 따라서 두 필터가 동시에 적용되는 경우는 없음

    // 탭에 따른 상태 필터
    if (activeTab === "pending") {
      filterObj.status = "pending";
    } else if (activeTab === "confirmed") {
      // 처리중: confirmed와 shipped를 모두 포함
      filterObj.statuses = ["confirmed", "shipped"];
    } else if (activeTab === "completed") {
      filterObj.status = "completed";
    }
    // activeTab === "all"인 경우 필터 없음

    // 추가 상태 필터 (Select에서 선택한 경우)
    // 상태 드롭다운 선택 시 activeTab이 "all"로 리셋되므로, 이 필터가 우선 적용됨
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

    // 주문번호 검색 (정확 일치)
    if (searchTerm.trim()) {
      filterObj.order_number = searchTerm.trim();
    }

    // 고객명 검색 (URL 파라미터에서 읽음)
    if (initialCustomer.trim()) {
      filterObj.customer_name = initialCustomer.trim();
    }

    return filterObj;
  }, [activeTab, dateRange, statusFilter, searchTerm, initialCustomer]);

  // 필터 변경 시 페이지를 1로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, dateRange, statusFilter, searchTerm, initialCustomer]);

  // URL 파라미터 로깅
  React.useEffect(() => {
    if (initialStatus) {
      console.log("🔍 [orders-page] URL 상태 파라미터 감지", {
        status: initialStatus,
        activeTab: initialStatus === "pending" ? "pending" : "all",
      });
    }
  }, [initialStatus]);

  // 에러 로깅
  React.useEffect(() => {
    if (wholesalerError) {
      console.error(
        "❌ [orders-page] 도매점 정보 조회 오류:",
        wholesalerError instanceof Error
          ? wholesalerError.message
          : JSON.stringify(wholesalerError, null, 2),
      );
    }
  }, [wholesalerError]);

  const wholesalerId = wholesaler?.id ?? null;

  // 주문 목록 조회
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", filter, currentPage, pageSize],
    queryFn: () => fetchOrders(filter, currentPage, pageSize),
    enabled: !!wholesalerId, // 도매점 ID가 있을 때만 조회
  });

  // 서버 사이드 페이지네이션 사용하므로 클라이언트 필터링 제거
  // 서버에서 이미 필터링된 데이터를 받음
  const filteredOrders = ordersData?.orders ?? [];

  // 일괄 상태 변경 Mutation
  const batchStatusChangeMutation = useMutation({
    mutationFn: async ({
      orderIds,
      status,
    }: {
      orderIds: string[];
      status: OrderStatus;
    }) => {
      console.log("🔄 [orders-page] 일괄 상태 변경 시작", {
        orderIds,
        status,
        count: orderIds.length,
      });

      const result = await batchUpdateOrderStatus(orderIds, status);

      if (!result.success && result.failureCount === orderIds.length) {
        throw new Error(
          result.errors?.[0]?.error || "일괄 상태 변경 중 오류가 발생했습니다.",
        );
      }

      return result;
    },
    onSuccess: (result) => {
      console.log("✅ [orders-page] 일괄 상태 변경 완료", result);

      if (result.successCount > 0) {
        toast.success(`${result.successCount}개의 주문 상태가 변경되었습니다.`);
      }

      if (result.failureCount > 0) {
        toast.error(`${result.failureCount}개의 주문 처리에 실패했습니다.`, {
          description: result.errors
            ?.map((e) => `${e.orderId}: ${e.error}`)
            .join(", "),
        });
      }

      // 주문 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("❌ [orders-page] 일괄 상태 변경 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "일괄 상태 변경 중 오류가 발생했습니다.",
      );
    },
  });

  // 일괄 상태 변경 핸들러
  const handleBatchStatusChange = (orderIds: string[], status: OrderStatus) => {
    batchStatusChangeMutation.mutate({ orderIds, status });
  };

  // 실시간 업데이트 구독
  React.useEffect(() => {
    if (!wholesalerId) return;

    console.log("🔔 [orders-page] 실시간 구독 시작", { wholesalerId });

    // 새 주문 구독
    const unsubscribeNew = subscribeToNewOrders(
      supabase,
      wholesalerId,
      (order) => {
        console.log("🔔 새 주문 알림:", order);
        toast.success("새 주문이 들어왔습니다!", {
          description: `주문번호: ${order.order_number}`,
        });
        // 주문 목록 새로고침
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    );

    // 주문 상태 변경 구독
    const unsubscribeUpdates = subscribeToOrderUpdates(
      supabase,
      wholesalerId,
      (order) => {
        console.log("🔄 주문 상태 변경 알림:", order);
        // 주문 목록 새로고침
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    );

    // Cleanup
    return () => {
      console.log("🧹 [orders-page] 실시간 구독 해제");
      unsubscribeNew();
      unsubscribeUpdates();
    };
  }, [supabase, queryClient, wholesalerId]);

  // 필터 초기화
  const handleResetFilters = () => {
    setDateRange(undefined);
    setStatusFilter("all");
    setSearchTerm("");
    setActiveTab("all");
  };

  // 필터 버튼 데이터 (디자인 핸드오프 스타일)
  // ⚠️ 중요: Hook은 조건부 return 이전에 호출되어야 함
  const filterButtons = React.useMemo(() => {
    const counts = ordersData?.counts ?? {
      all: 0,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      processing: 0,
    };

    return [
      {
        label: "전체",
        value: "all" as const,
        count: counts.all,
      },
      {
        label: "신규",
        value: "pending" as const,
        count: counts.pending,
      },
      {
        label: "처리중",
        value: "confirmed" as const,
        count: counts.processing, // confirmed + shipped
      },
      {
        label: "완료",
        value: "completed" as const,
        count: counts.completed,
      },
    ];
  }, [ordersData?.counts]);

  // 필터 버튼 클릭 핸들러
  const handleFilterClick = (value: string) => {
    console.log("🔍 [orders-page] 필터 버튼 클릭", {
      value,
      activeTab,
      statusFilter,
    });
    setActiveTab(value);
    // 탭 선택 시 상태 드롭다운을 "all"로 리셋하여 충돌 방지
    // 탭 필터가 우선 적용되도록 함
    setStatusFilter("all");
  };

  // 도매점 ID가 없으면 로딩 또는 에러 표시
  // ⚠️ 중요: 모든 Hook 호출 후에 조건부 return 수행
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

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">주문 관리</h1>
        <p className="mt-2 text-muted-foreground">
          총 {ordersData?.total ?? 0}건의 주문을 관리하세요.
        </p>
      </div>

      {/* 필터 버튼 (디자인 핸드오프 스타일) */}
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleFilterClick(btn.value)}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === btn.value
                ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-colors duration-200"
            }`}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {/* 추가 필터 UI */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* 날짜 범위 선택 */}
        <OrderDateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* 상태 선택 */}
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            console.log("🔍 [orders-page] 상태 드롭다운 변경", {
              value,
              activeTab,
            });
            setStatusFilter(value as OrderStatus | "all");
            // 상태 드롭다운 선택 시 탭을 "all"로 리셋하여 충돌 방지
            if (value !== "all") {
              setActiveTab("all");
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="pending">신규 주문</SelectItem>
            <SelectItem value="confirmed">접수 확인</SelectItem>
            <SelectItem value="shipped">출고 완료</SelectItem>
            <SelectItem value="completed">배송 완료</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>

        {/* 주문번호 검색 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="주문번호 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

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

      {/* 주문 테이블 */}
      {error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">
            주문 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          isLoading={isLoading}
          onBatchStatusChange={handleBatchStatusChange}
          isBatchProcessing={batchStatusChangeMutation.isPending}
          total={ordersData?.total ?? 0}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
