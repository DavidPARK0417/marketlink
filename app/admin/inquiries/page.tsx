/**
 * @file app/admin/inquiries/page.tsx
 * @description 관리자용 도매 문의 관리 페이지
 *
 * 관리자가 모든 도매사업자로부터 받은 문의를 조회하고 관리하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 모든 도매→관리자 문의 목록 조회
 * 2. 문의 상태 필터링 (탭 UI)
 * 3. 날짜 범위 필터링
 * 4. 제목/내용 검색
 * 5. 문의 상세 페이지로 이동
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - components/wholesaler/Inquiries/InquiryTable.tsx
 * - components/wholesaler/Inquiries/InquiryFilter.tsx
 * - lib/clerk/auth.ts (requireAdmin)
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import InquiryTable from "@/components/wholesaler/Inquiries/InquiryTable";
import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";

// 관리자용 문의 목록 조회 함수
async function fetchInquiriesForAdmin(filter: InquiryFilterType = {}) {
  console.log("🔍 [admin-inquiries-page] 관리자용 문의 목록 조회 요청", {
    filter,
  });

  const response = await fetch("/api/admin/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      filter,
      sortOrder: "desc", // 최신 글이 위에 (내림차순)
    }),
  });

  if (!response.ok) {
    let errorMessage = "문의 목록 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [admin-inquiries-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [admin-inquiries-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [admin-inquiries-page] 관리자용 문의 목록 조회 성공", {
    inquiriesCount: data.inquiries?.length ?? 0,
    total: data.total,
  });

  return data;
}

// 관리자용 문의 통계 조회 함수
async function fetchInquiryStatsForAdmin() {
  console.log("🔍 [admin-inquiries-page] 관리자용 문의 통계 조회 요청");

  const response = await fetch("/api/admin/inquiries/stats");

  if (!response.ok) {
    let errorMessage = "문의 통계 조회 실패";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error("❌ [admin-inquiries-page] 통계 API 에러 응답:", errorData);
      } else {
        const errorText = await response.text();
        console.error("❌ [admin-inquiries-page] 통계 API 에러 응답 (텍스트):", errorText);
        errorMessage = `서버 오류 (${response.status}): ${errorText.substring(0, 100)}`;
      }
    } catch (e) {
      console.error("❌ [admin-inquiries-page] 통계 에러 응답 파싱 실패:", e);
      errorMessage = `서버 오류 (${response.status})`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [admin-inquiries-page] 관리자용 문의 통계 조회 성공", data);

  return data;
}

export default function AdminInquiriesPage() {
  // 필터 상태
  const [filter, setFilter] = React.useState<InquiryFilterType>({});

  // activeTab을 filter.status로부터 계산 (동기화 보장)
  const activeTab = React.useMemo(() => {
    if (filter.status === "open") return "open";
    if (filter.status === "answered") return "answered";
    return "all";
  }, [filter.status]);

  // 관리자용 문의 통계 조회
  const { data: statsData } = useQuery({
    queryKey: ["admin-inquiry-stats"],
    queryFn: fetchInquiryStatsForAdmin,
    staleTime: 30 * 1000, // 30초
  });

  // 관리자용 문의 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-inquiries", filter],
    queryFn: () => fetchInquiriesForAdmin(filter),
    staleTime: 30 * 1000, // 30초
  });

  // 에러 처리
  React.useEffect(() => {
    if (error) {
      console.error(
        "❌ [admin-inquiries-page] 관리자용 문의 목록 조회 오류:",
        error,
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "문의 목록을 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [error]);

  // 통계 카드 클릭 핸들러
  const handleStatsCardClick = (status: "all" | InquiryStatus) => {
    setFilter((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 페이지 헤더 */}
      <PageHeader
        hideTitle
        description="도매사업자로부터 받은 문의를 조회하고 답변할 수 있습니다."
      />

      {/* 문의 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 전체 문의 카드 */}
        <button
          onClick={() => handleStatsCardClick("all")}
          className={`bg-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "all" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">전체 문의</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsData?.total ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <MessageSquare className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
        </button>

        {/* 답변 대기 카드 */}
        <button
          onClick={() => handleStatsCardClick("open")}
          className={`bg-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "open" ? "ring-2 ring-[#fbbf24]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">답변 대기</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsData?.open ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <Clock className="w-12 h-12 text-green-500" strokeWidth={1.5} />
            </div>
          </div>
        </button>

        {/* 답변 완료 카드 */}
        <button
          onClick={() => handleStatsCardClick("answered")}
          className={`bg-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "answered" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">답변 완료</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsData?.answered ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <CheckCircle className="w-12 h-12 text-purple-500" strokeWidth={1.5} />
            </div>
          </div>
        </button>
      </div>

      {/* 필터 */}
      <InquiryFilter filter={filter} onFilterChange={setFilter} />

      {/* 문의 테이블 */}
      <InquiryTable
        inquiries={data?.inquiries || []}
        isLoading={isLoading}
        basePath="/admin/inquiries"
        startNumber={
          data
            ? (data.page - 1) * (data.pageSize || 20) + 1
            : 1
        }
        total={data?.total}
      />

      {/* 통계 정보 */}
      {data && (
        <div className="text-sm text-gray-600">
          총 {data.total}개의 문의 (페이지 {data.page} / {data.totalPages})
        </div>
      )}
    </div>
  );
}
