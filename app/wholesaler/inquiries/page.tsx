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
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import { Button } from "@/components/ui/button";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";
import type { InquiryDetail } from "@/types/inquiry";

// 문의 목록 조회 함수 (클라이언트에서 직접 호출)
async function fetchInquiries(
  filter: InquiryFilterType = {},
  page: number = 1,
  pageSize: number = 20,
) {
  console.log("🔍 [inquiries-page] 문의 목록 조회 요청", { filter, page, pageSize });

  const response = await fetch("/api/wholesaler/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter, page, pageSize }),
  });

  if (!response.ok) {
    let errorMessage = "문의 목록 조회 실패";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error("❌ [inquiries-page] API 에러 응답:", errorData);
      } else {
        // JSON이 아닌 경우 텍스트로 읽기
        const errorText = await response.text();
        console.error("❌ [inquiries-page] API 에러 응답 (텍스트):", errorText);
        errorMessage = `서버 오류 (${response.status}): ${errorText.substring(0, 100)}`;
      }
    } catch (e) {
      console.error("❌ [inquiries-page] 에러 응답 파싱 실패:", e);
      errorMessage = `서버 오류 (${response.status})`;
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

// 문의 통계 조회 함수
async function fetchInquiryStats() {
  console.log("🔍 [inquiries-page] 문의 통계 조회 요청");

  const response = await fetch("/api/wholesaler/inquiries/stats");

  if (!response.ok) {
    let errorMessage = "문의 통계 조회 실패";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error("❌ [inquiries-page] 통계 API 에러 응답:", errorData);
      } else {
        // JSON이 아닌 경우 텍스트로 읽기
        const errorText = await response.text();
        console.error("❌ [inquiries-page] 통계 API 에러 응답 (텍스트):", errorText);
        errorMessage = `서버 오류 (${response.status}): ${errorText.substring(0, 100)}`;
      }
    } catch (e) {
      console.error("❌ [inquiries-page] 통계 에러 응답 파싱 실패:", e);
      errorMessage = `서버 오류 (${response.status})`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [inquiries-page] 문의 통계 조회 성공", data);

  return data;
}

export default function InquiriesPage() {
  // 필터 상태
  const [filter, setFilter] = React.useState<InquiryFilterType>({});
  // 페이지 상태
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  // activeTab을 filter.status로부터 계산 (동기화 보장)
  const activeTab = React.useMemo(() => {
    if (filter.status === "open") return "open";
    if (filter.status === "answered") return "answered";
    return "all";
  }, [filter.status]);

  // 문의 통계 조회
  const { data: statsData } = useQuery({
    queryKey: ["inquiry-stats"],
    queryFn: fetchInquiryStats,
    staleTime: 30 * 1000, // 30초
  });

  // 문의 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ["inquiries", filter, page],
    queryFn: () => fetchInquiries(filter, page, pageSize),
    staleTime: 30 * 1000, // 30초
  });

  // 필터 변경 시 페이지를 1로 리셋
  React.useEffect(() => {
    setPage(1);
  }, [filter]);

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

  // 통계 카드 클릭 핸들러
  const handleStatsCardClick = (status: "all" | InquiryStatus) => {
    setFilter((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
    }));
  };

  // 상태 텍스트 및 색상 함수
  const getStatusText = (status: InquiryStatus) => {
    const statusMap: Record<InquiryStatus, string> = {
      open: "답변 대기",
      answered: "답변 완료",
      closed: "종료",
    };
    return statusMap[status];
  };

  const getStatusColor = (status: InquiryStatus) => {
    if (status === "open") {
      return "bg-[#fbbf24] text-white";
    }
    return "bg-[#10B981] text-white";
  };

  const getStatusIcon = (status: InquiryStatus) => {
    if (status === "open") {
      return <Clock className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">상품문의</h1>
        <p className="mt-2 text-muted-foreground">신속한 응대로 고객 신뢰도를 높이세요.</p>
      </div>

      {/* 문의 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 전체 문의 카드 */}
        <button
          onClick={() => handleStatsCardClick("all")}
          className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "all" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">전체 문의</p>
              <p className="text-3xl font-bold text-foreground dark:text-foreground mt-2">
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
          className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "open" ? "ring-2 ring-[#fbbf24]" : "hover:shadow-lg"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">답변 대기</p>
              <p className="text-3xl font-bold text-foreground dark:text-foreground mt-2">
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
          className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "answered" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">답변 완료</p>
              <p className="text-3xl font-bold text-foreground dark:text-foreground mt-2">
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

      {/* 문의 목록 (카드 리스트) */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-12 text-center text-muted-foreground dark:text-muted-foreground transition-colors duration-200">
            로딩 중...
          </div>
        ) : data?.inquiries && data.inquiries.length > 0 ? (
          data.inquiries.map((inquiry: InquiryDetail) => (
            <div
              key={inquiry.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-200"
            >
              <div className="p-6">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground dark:text-foreground">
                        {inquiry.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          inquiry.status
                        )}`}
                      >
                        {getStatusIcon(inquiry.status)}
                        {getStatusText(inquiry.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      {inquiry.user_anonymous_code && (
                        <>
                          <span>고객: {inquiry.user_anonymous_code}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        문의일:{" "}
                        {new Date(inquiry.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {inquiry.replied_at && (
                        <>
                          <span>•</span>
                          <span className="text-[#10B981]">
                            답변완료:{" "}
                            {new Date(inquiry.replied_at).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 문의 내용 */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 transition-colors duration-200">
                  <p className="text-sm text-foreground dark:text-foreground">{inquiry.content}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3">
                  {inquiry.status === "open" ? (
                    <Link
                      href={`/wholesaler/inquiries/${inquiry.id}`}
                      className="px-6 py-2 bg-[#10B981] text-white rounded-xl font-semibold hover:bg-[#059669] transition-colors shadow-md"
                    >
                      답변하기
                    </Link>
                  ) : (
                    <Link
                      href={`/wholesaler/inquiries/${inquiry.id}`}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-foreground rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      답변 확인
                    </Link>
                  )}
                  <Link
                    href={`/wholesaler/inquiries/${inquiry.id}`}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-foreground rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-12 text-center text-muted-foreground dark:text-muted-foreground transition-colors duration-200">
            해당 조건의 문의가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
          <div className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">
            총 <span className="text-[#10B981] font-bold">{data.total}</span>개 중{" "}
            <span className="text-[#10B981] font-bold">
              {(data.page - 1) * data.pageSize + 1}
            </span>
            -
            <span className="text-[#10B981] font-bold">
              {Math.min(data.page * data.pageSize, data.total)}
            </span>
            개 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="border-gray-200 dark:border-gray-700 hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
            <div className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-foreground">
              <span>{data.page}</span>
              <span className="text-gray-500 dark:text-muted-foreground">/</span>
              <span>{data.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
              className="border-gray-200 dark:border-gray-700 hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* 통계 정보 (페이지가 1개일 때만 표시) */}
      {data && data.totalPages <= 1 && (
        <div className="text-sm text-gray-600">
          총 {data.total}개의 문의
        </div>
      )}
    </div>
  );
}
