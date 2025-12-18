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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";

// 관리자용 문의 목록 조회 함수
async function fetchInquiriesForAdmin(
  filter: InquiryFilterType = {},
  page: number = 1,
  pageSize: number = 20,
) {
  console.log("🔍 [admin-inquiries-page] 관리자용 문의 목록 조회 요청", {
    filter,
    page,
    pageSize,
  });

  const response = await fetch("/api/admin/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      filter,
      page,
      pageSize,
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

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // 필터 변경 시 페이지를 1로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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
    queryKey: ["admin-inquiries", filter, currentPage, pageSize],
    queryFn: () => fetchInquiriesForAdmin(filter, currentPage, pageSize),
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
        title="도매 문의 관리"
        description="도매사업자로부터 받은 문의를 조회하고 답변할 수 있습니다."
      />

      {/* 문의 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 전체 문의 카드 */}
        <button
          onClick={() => handleStatsCardClick("all")}
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 text-left transition-colors duration-200 hover:-translate-y-1 ${
            activeTab === "all" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">전체 문의</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {statsData?.total ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <MessageSquare className="w-12 h-12 text-[#10B981]" strokeWidth={1.5} />
            </div>
          </div>
        </button>

        {/* 답변 대기 카드 */}
        <button
          onClick={() => handleStatsCardClick("open")}
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 text-left transition-colors duration-200 hover:-translate-y-1 ${
            activeTab === "open" ? "ring-2 ring-[#fbbf24]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">답변 대기</p>
              <p className="text-3xl font-bold text-foreground mt-2">
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
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 text-left transition-colors duration-200 hover:-translate-y-1 ${
            activeTab === "answered" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">답변 완료</p>
              <p className="text-3xl font-bold text-foreground mt-2">
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

      {/* 페이지네이션 */}
      {data && data.totalPages > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 페이지 정보 및 페이지 크기 선택 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* 현재 페이지 정보 */}
            <div className="text-sm text-muted-foreground dark:text-gray-300">
              {(() => {
                const startIndex = (currentPage - 1) * pageSize + 1;
                const endIndex = Math.min(currentPage * pageSize, data.total);
                return `${startIndex}-${endIndex} / ${data.total}건`;
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
                  setCurrentPage(1);
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-9 px-3"
            >
              이전
            </Button>

            {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
            <div className="hidden md:flex items-center gap-1">
              {(() => {
                const totalPages = data.totalPages;
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
                      onClick={() => setCurrentPage(pageNum)}
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
              {currentPage} / {data.totalPages}
            </div>

            {/* 다음 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={currentPage >= data.totalPages}
              className="h-9 px-3"
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
