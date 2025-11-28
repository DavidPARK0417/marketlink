/**
 * @file app/wholesaler/support/page.tsx
 * @description 고객지원 페이지
 *
 * 도매사업자가 관리자에게 문의를 작성하고, 자신이 보낸 문의를 조회하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관리자에게 문의 작성
 * 2. 내가 보낸 문의 목록 조회
 * 3. 문의 상태 필터링 (탭 UI)
 * 4. 날짜 범위 필터링
 * 5. 제목/내용 검색
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - components/wholesaler/Support/InquiryCreateForm.tsx
 * - components/wholesaler/Inquiries/InquiryTable.tsx
 * - components/wholesaler/Inquiries/InquiryFilter.tsx
 */

"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InquiryCreateForm from "@/components/wholesaler/Support/InquiryCreateForm";
import InquiryTable from "@/components/wholesaler/Inquiries/InquiryTable";
import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";

// 관리자 문의 목록 조회 함수 (클라이언트에서 직접 호출)
async function fetchInquiriesToAdmin(filter: InquiryFilterType = {}) {
  console.log("🔍 [support-page] 관리자 문의 목록 조회 요청", { filter });

  const response = await fetch("/api/wholesaler/inquiries/to-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter }),
  });

  if (!response.ok) {
    let errorMessage = "문의 목록 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [support-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [support-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [support-page] 관리자 문의 목록 조회 성공", {
    inquiriesCount: data.inquiries?.length ?? 0,
    total: data.total,
  });

  return data;
}

export default function SupportPage() {
  const queryClient = useQueryClient();

  // 필터 상태
  const [activeTab, setActiveTab] = React.useState<string>("create");
  const [filter, setFilter] = React.useState<InquiryFilterType>({});

  // 탭 변경 시 필터 업데이트
  React.useEffect(() => {
    if (activeTab === "create") {
      // 문의 작성 탭에서는 필터 초기화
      setFilter({});
      return;
    }

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

  // 관리자 문의 목록 조회 (내가 보낸 문의 탭에서만)
  const { data, isLoading, error } = useQuery({
    queryKey: ["inquiries-to-admin", filter],
    queryFn: () => fetchInquiriesToAdmin(filter),
    enabled: activeTab !== "create", // 문의 작성 탭에서는 조회하지 않음
    staleTime: 30 * 1000, // 30초
  });

  // 에러 처리
  React.useEffect(() => {
    if (error) {
      console.error("❌ [support-page] 관리자 문의 목록 조회 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "문의 목록을 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [error]);

  // 문의 작성 성공 핸들러
  const handleInquiryCreated = () => {
    // 내가 보낸 문의 탭으로 전환
    setActiveTab("all");
    // 문의 목록 갱신
    queryClient.invalidateQueries({ queryKey: ["inquiries-to-admin"] });
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <PageHeader
        title="고객지원"
        description="관리자에게 문의를 작성하고, 내가 보낸 문의를 확인할 수 있습니다."
        hideTitle={true}
      />

      {/* 탭 UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create">문의 작성</TabsTrigger>
          <TabsTrigger value="all">내가 보낸 문의</TabsTrigger>
          <TabsTrigger value="open">미답변</TabsTrigger>
          <TabsTrigger value="answered">답변완료</TabsTrigger>
          <TabsTrigger value="closed">종료</TabsTrigger>
        </TabsList>

        {/* 문의 작성 탭 */}
        <TabsContent value="create" className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">관리자에게 문의하기</h2>
            <p className="mb-6 text-sm text-gray-600">
              정산, 계정, 기술 지원 등 어떤 내용이든 문의해주세요. 관리자가 확인
              후 답변드리겠습니다.
            </p>
            <InquiryCreateForm onSuccess={handleInquiryCreated} />
          </div>
        </TabsContent>

        {/* 내가 보낸 문의 탭들 */}
        <TabsContent value={activeTab} className="space-y-4">
          {/* 필터 */}
          {activeTab !== "create" && (
            <InquiryFilter filter={filter} onFilterChange={setFilter} />
          )}

          {/* 문의 테이블 */}
          {activeTab !== "create" && (
            <InquiryTable
              inquiries={data?.inquiries || []}
              isLoading={isLoading}
            />
          )}

          {/* 통계 정보 */}
          {activeTab !== "create" && data && (
            <div className="text-sm text-gray-600">
              총 {data.total}개의 문의 (페이지 {data.page} / {data.totalPages})
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
