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
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import InquiryListSkeleton from "@/components/wholesaler/Inquiries/InquiryListSkeleton";
import { Button } from "@/components/ui/button";
import type {
  InquiryFilter as InquiryFilterType,
  InquiryDetail,
} from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";

type InquiriesResponse = {
  inquiries: InquiryDetail[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// 문의 목록 조회 함수 (클라이언트에서 직접 호출)
async function fetchInquiries(
  filter: InquiryFilterType = {},
  page: number = 1,
  pageSize: number = 20,
): Promise<InquiriesResponse> {
  console.log("🔍 [inquiries-page] 문의 목록 조회 요청", {
    filter,
    page,
    pageSize,
  });

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
        errorMessage = `서버 오류 (${response.status}): ${errorText.substring(
          0,
          100,
        )}`;
      }
    } catch (e) {
      console.error("❌ [inquiries-page] 에러 응답 파싱 실패:", e);
      errorMessage = `서버 오류 (${response.status})`;
    }

    throw new Error(errorMessage);
  }

  const data = (await response.json()) as InquiriesResponse;
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
        console.error(
          "❌ [inquiries-page] 통계 API 에러 응답 (텍스트):",
          errorText,
        );
        errorMessage = `서버 오류 (${response.status}): ${errorText.substring(
          0,
          100,
        )}`;
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
  const router = useRouter();

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

  const getStatusBadge = (status: InquiryStatus) => {
    const displayStatus: InquiryStatus =
      status === "closed" ? "answered" : status;

    const statusText: Record<"open" | "answered", string> = {
      open: "답변 대기",
      answered: "답변 완료",
    };

    const statusClass =
      displayStatus === "open"
        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100"
        : "bg-[#D1FAE5] text-[#10B981] dark:bg-emerald-900/40 dark:text-emerald-200";

    return (
      <span
        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}`}
      >
        {statusText[displayStatus === "open" ? "open" : "answered"]}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="상품 문의 관리"
        description="소매점에서 등록한 상품 문의를 한눈에 관리합니다."
      />

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
              <p className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">
                전체 문의
              </p>
              <p className="text-3xl font-bold text-foreground dark:text-foreground mt-2">
                {statsData?.total ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <MessageSquare
                className="w-12 h-12 text-[#10B981]"
                strokeWidth={1.5}
              />
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
              <p className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">
                답변 대기
              </p>
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
            activeTab === "answered"
              ? "ring-2 ring-[#10B981]"
              : "hover:shadow-lg"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">
                답변 완료
              </p>
              <p className="text-3xl font-bold text-foreground dark:text-foreground mt-2">
                {statsData?.answered ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <CheckCircle
                className="w-12 h-12 text-purple-500"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </button>
      </div>

      {/* 필터 */}
      <InquiryFilter filter={filter} onFilterChange={setFilter} />

      {/* 문의 목록 테이블 + 모바일 카드 (관리자 소매 문의 관리와 동일한 패턴) */}
      {isLoading ? (
        <InquiryListSkeleton />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
          {/* 데스크톱 테이블 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-200 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-16 text-center">
                    번호
                  </th>
                  <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-40">
                    고객 코드
                  </th>
                  <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">
                    문의 제목 / 내용
                  </th>
                  <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-28 text-center">
                    상태
                  </th>
                  <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-40 text-center">
                    생성일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {data?.inquiries?.map((inquiry, index) => {
                  const number = data.total
                    ? data.total -
                      ((data.page - 1) * (data.pageSize || pageSize) + index)
                    : index + 1;
                  const detailHref = `/wholesaler/inquiries/${inquiry.id}`;

                  return (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                      onClick={() => router.push(detailHref)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(detailHref);
                        }
                      }}
                    >
                      <td className="p-4 text-center text-muted-foreground dark:text-muted-foreground font-medium">
                        {number}
                      </td>
                      <td className="p-4">
                        <div className="text-foreground dark:text-foreground font-semibold">
                          {inquiry.user_anonymous_code || "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link
                          href={detailHref}
                          className="font-semibold text-foreground dark:text-foreground mb-1 hover:text-[#10B981] transition-colors"
                        >
                          {inquiry.title}
                        </Link>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground break-words line-clamp-2">
                          {inquiry.content}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(inquiry.status)}
                      </td>
                      <td className="p-4 text-center text-muted-foreground dark:text-muted-foreground">
                        {new Date(inquiry.created_at).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                    </tr>
                  );
                })}
                {data?.inquiries?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground dark:text-muted-foreground"
                    >
                      해당 조건의 문의가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {data?.inquiries?.map((inquiry, index) => {
              const number = data.total
                ? data.total -
                  ((data.page - 1) * (data.pageSize || pageSize) + index)
                : index + 1;
              const detailHref = `/wholesaler/inquiries/${inquiry.id}`;
              return (
                <Link
                  key={inquiry.id}
                  href={detailHref}
                  className="block p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                        #{number} •{" "}
                        {new Date(inquiry.created_at).toLocaleDateString(
                          "ko-KR",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                      <div className="text-sm font-semibold text-foreground dark:text-foreground">
                        고객: {inquiry.user_anonymous_code || "-"}
                      </div>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <div className="text-base font-semibold text-foreground dark:text-foreground mb-1">
                    {inquiry.title}
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground break-words line-clamp-2">
                    {inquiry.content}
                  </p>
                </Link>
              );
            })}
            {data?.inquiries?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground dark:text-muted-foreground">
                해당 조건의 문의가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
          <div className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">
            총 <span className="text-[#10B981] font-bold">{data.total}</span>개
            중{" "}
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
              <span className="text-gray-500 dark:text-muted-foreground">
                /
              </span>
              <span>{data.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() =>
                setPage((prev) => Math.min(data.totalPages, prev + 1))
              }
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
        <div className="text-sm text-gray-600 dark:text-gray-300">
          총 {data.total}개의 문의
        </div>
      )}
    </div>
  );
}
