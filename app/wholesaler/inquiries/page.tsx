/**
 * @file app/wholesaler/inquiries/page.tsx
 * @description 상품 문의 페이지
 *
 * 소매점으로부터 들어온 문의를 관리하는 페이지입니다.
 * 문의 목록, 필터링, 답변 등의 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 문의 목록 표시
 * 2. 문의 상태 필터링 (탭 UI)
 * 3. 날짜 범위 필터링
 * 4. 제목/내용 검색
 * 5. 실시간 문의 업데이트 (Realtime 구독)
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - components/wholesaler/Inquiries/InquiryTable.tsx
 * - components/wholesaler/Inquiries/InquiryFilter.tsx
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InquiryTable from "@/components/wholesaler/Inquiries/InquiryTable";
import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";

// 문의 목록 조회 함수 (클라이언트에서 직접 호출)
async function fetchInquiries(filter: InquiryFilterType = {}) {
  console.log("🔍 [inquiries-page] 문의 목록 조회 요청", { filter });

  const response = await fetch("/api/wholesaler/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter }),
  });

  if (!response.ok) {
    let errorMessage = "문의 목록 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [inquiries-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [inquiries-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [inquiries-page] 문의 목록 조회 성공", {
    inquiriesCount: data.inquiries?.length ?? 0,
    total: data.total,
  });

  return data;
}

export default function InquiriesPage() {
  // 필터 상태
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [filter, setFilter] = React.useState<InquiryFilterType>({});

  // 탭 변경 시 필터 업데이트
  React.useEffect(() => {
    const statusMap: Record<string, InquiryStatus | undefined> = {
      all: undefined,
      open: "open",
      answered: "answered",
      closed: "closed",
    };

    setFilter((prev) => ({
      ...prev,
      status: statusMap[activeTab],
    }));
  }, [activeTab]);

  // 문의 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ["inquiries", filter],
    queryFn: () => fetchInquiries(filter),
    staleTime: 30 * 1000, // 30초
  });

  // 에러 처리
  React.useEffect(() => {
    if (error) {
      console.error("❌ [inquiries-page] 문의 목록 조회 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "문의 목록을 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <PageHeader
        title="상품 문의"
        description="소매점으로부터 들어온 문의를 확인하고 답변할 수 있습니다."
        hideTitle={true}
      />

      {/* 탭 UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="open">미답변</TabsTrigger>
          <TabsTrigger value="answered">답변완료</TabsTrigger>
          <TabsTrigger value="closed">종료</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* 필터 */}
          <InquiryFilter filter={filter} onFilterChange={setFilter} />

          {/* 문의 테이블 */}
          <InquiryTable
            inquiries={data?.inquiries || []}
            isLoading={isLoading}
            basePath="/wholesaler/inquiries"
          />

          {/* 통계 정보 */}
          {data && (
            <div className="text-sm text-gray-600">
              총 {data.total}개의 문의 (페이지 {data.page} / {data.totalPages})
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
