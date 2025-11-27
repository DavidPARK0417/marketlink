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
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
async function fetchOrders(filter: OrderFilter = {}) {
  console.log("🔍 [orders-page] 주문 목록 조회 요청", { filter });

  const response = await fetch("/api/wholesaler/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter }),
  });

  if (!response.ok) {
    // 서버에서 반환한 상세 에러 메시지 추출
    let errorMessage = "주문 목록 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.details || errorData.error || errorMessage;
      console.error("❌ [orders-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [orders-page] 에러 응답 파싱 실패:", e);
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
  const {
    data: wholesaler,
    isLoading: isWholesalerLoading,
    error: wholesalerError,
  } = useWholesaler();

  // 필터 상태
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all",
  );
  const [searchTerm, setSearchTerm] = React.useState("");

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

  // 필터 객체 생성
  const filter: OrderFilter = React.useMemo(() => {
    const filterObj: OrderFilter = {};

    // 탭에 따른 상태 필터
    if (activeTab === "new") {
      filterObj.status = "pending";
    } else if (activeTab === "processing") {
      // 처리중: confirmed 또는 shipped
      // ⚠️ 주의: Supabase에서는 OR 조건이 복잡하므로, 일단 confirmed만 필터링
      // 실제로는 클라이언트에서 필터링하거나 별도 API 엔드포인트를 만들어야 할 수 있습니다.
      filterObj.status = "confirmed";
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

    // 주문번호 검색 (정확 일치)
    if (searchTerm.trim()) {
      filterObj.order_number = searchTerm.trim();
    }

    return filterObj;
  }, [activeTab, dateRange, statusFilter, searchTerm]);

  // 주문 목록 조회
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", filter],
    queryFn: () => fetchOrders(filter),
    enabled: !!wholesalerId, // 도매점 ID가 있을 때만 조회
  });

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="주문 관리"
        description="들어온 주문을 확인하고 처리하세요."
      />

      {/* 탭 UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="new">신규</TabsTrigger>
          <TabsTrigger value="processing">처리중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
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
                setStatusFilter(value as OrderStatus | "all")
              }
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
              orders={ordersData?.orders ?? []}
              isLoading={isLoading}
              onBatchStatusChange={handleBatchStatusChange}
              isBatchProcessing={batchStatusChangeMutation.isPending}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
