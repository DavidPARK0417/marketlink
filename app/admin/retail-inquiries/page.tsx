/**
 * @file app/admin/retail-inquiries/page.tsx
 * @description 관리자용 소매→관리자 문의 관리 페이지
 *
 * 소매→관리자 문의를 관리자 권한으로 조회하는 페이지입니다.
 * 기존 도매 문의 관리 UI와 동일한 레이아웃/스타일을 유지합니다.
 *
 * 주요 기능:
 * 1. 소매 문의 통계 조회 (전체/답변 대기/답변 완료)
 * 2. 상태/검색/기간 필터
 * 3. 문의 목록 테이블 (문의자명, 연락처, 내용, 상태, 생성일)
 *
 * @dependencies
 * - app/api/admin/retail-inquiries/route.ts
 * - app/api/wholesaler/inquiries/stats/route.ts
 * - components/common/PageHeader
 * - components/wholesaler/Inquiries/InquiryFilter
 * - types/inquiry.ts
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/common/PageHeader";
import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";

type RetailInquiryRow = {
  id: string;
  title: string;
  content: string;
  status: InquiryStatus;
  created_at: string;
  replied_at: string | null;
  retailer_business_name?: string | null;
  retailer_phone?: string | null;
};

type RetailInquiryResponse = {
  inquiries: RetailInquiryRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// 관리자용 소매 문의 목록 조회
async function fetchRetailInquiriesForAdmin(
  filter: InquiryFilterType = {},
): Promise<RetailInquiryResponse> {
  console.log("🔍 [admin-retail-inquiries-page] 소매 문의 목록 조회 요청", {
    filter,
  });

  const response = await fetch("/api/admin/retail-inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filter,
      sortOrder: "desc",
      sortBy: "created_at",
    }),
  });

  if (!response.ok) {
    let errorMessage = "소매 문의 목록 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error(
        "❌ [admin-retail-inquiries-page] API 에러 응답:",
        errorData,
      );
    } catch (e) {
      console.error(
        "❌ [admin-retail-inquiries-page] 에러 응답 파싱 실패:",
        e,
      );
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as RetailInquiryResponse;

  console.log("✅ [admin-retail-inquiries-page] 목록 조회 성공", {
    count: data.inquiries?.length ?? 0,
    total: data.total,
  });

  return data;
}

// 관리자용 소매→관리자 문의 통계 조회
async function fetchRetailInquiryStats() {
  console.log(
    "🔍 [admin-retail-inquiries-page] 소매→관리자 문의 통계 조회 요청",
  );

  const response = await fetch("/api/admin/retail-inquiries/stats");

  if (!response.ok) {
    let errorMessage = "소매 문의 통계 조회 실패";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error(
      "❌ [admin-retail-inquiries-page] 통계 API 에러 응답:",
          errorData,
        );
      } else {
        const errorText = await response.text();
        console.error(
          "❌ [admin-retail-inquiries-page] 통계 API 에러 텍스트:",
          errorText,
        );
        errorMessage = `서버 오류 (${response.status}): ${errorText.substring(
          0,
          100,
        )}`;
      }
    } catch (e) {
      console.error(
        "❌ [admin-retail-inquiries-page] 통계 응답 파싱 실패:",
        e,
      );
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [admin-retail-inquiries-page] 통계 조회 성공", data);
  return data as {
    total: number;
    open: number;
    answered: number;
    closed: number;
  };
}

export default function AdminRetailInquiriesPage() {
  const [filter, setFilter] = React.useState<InquiryFilterType>({});
  const router = useRouter();

  const activeTab = React.useMemo(() => {
    if (filter.status === "open") return "open";
    if (filter.status === "answered") return "answered";
    return "all";
  }, [filter.status]);

  const { data: statsData } = useQuery({
    queryKey: ["admin-retail-inquiry-stats"],
    queryFn: fetchRetailInquiryStats,
    staleTime: 30 * 1000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-retail-inquiries", filter],
    queryFn: () => fetchRetailInquiriesForAdmin(filter),
    staleTime: 30 * 1000,
  });

  React.useEffect(() => {
    if (error) {
      console.error(
        "❌ [admin-retail-inquiries-page] 소매 문의 목록 조회 오류:",
        error,
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "소매 문의를 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [error]);

  const handleStatsCardClick = (status: "all" | InquiryStatus) => {
    setFilter((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
    }));
  };

  const renderStatusBadge = (status: InquiryStatus) => {
    const statusText: Record<InquiryStatus, string> = {
      open: "답변 대기",
      answered: "답변 완료",
      closed: "종료",
    };

    const statusClass =
      status === "open"
        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100"
        : status === "answered"
          ? "bg-[#D1FAE5] text-[#10B981] dark:bg-emerald-900/40 dark:text-emerald-200"
          : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-200";

    return (
      <span
        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}`}
      >
        {statusText[status]}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="소매 문의 관리"
        description="소매점에서 관리자에게 접수된 문의를 한눈에 관리합니다."
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => handleStatsCardClick("all")}
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 text-left transition-colors duration-200 hover:-translate-y-1 ${
            activeTab === "all" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                전체 문의
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {statsData?.total ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <MessageSquare className="w-12 h-12 text-[#10B981]" strokeWidth={1.5} />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick("open")}
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 text-left transition-colors duration-200 hover:-translate-y-1 ${
            activeTab === "open" ? "ring-2 ring-[#fbbf24]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                답변 대기
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {statsData?.open ?? 0}건
              </p>
            </div>
            <div className="p-2">
              <Clock className="w-12 h-12 text-green-500" strokeWidth={1.5} />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick("answered")}
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 text-left transition-colors duration-200 hover:-translate-y-1 ${
            activeTab === "answered" ? "ring-2 ring-[#10B981]" : "hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                답변 완료
              </p>
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

      {/* 테이블 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-200 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-16 text-center">
                  번호
                </th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-40">
                  문의자명
                </th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-32">
                  연락처
                </th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">
                  문의 내용
                </th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-28 text-center">
                  상태
                </th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-32 text-center">
                  생성일
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground dark:text-muted-foreground"
                  >
                    로딩 중...
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.inquiries?.map((inquiry, index) => {
                  const number = data.total
                    ? data.total - ((data.page - 1) * (data.pageSize || 20) + index)
                    : index + 1;
                  const detailHref = `/admin/retail-inquiries/${inquiry.id}`;

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
                          {inquiry.retailer_business_name || "미등록 상호"}
                        </div>
                      </td>
                      <td className="p-4 text-foreground dark:text-foreground">
                        {inquiry.retailer_phone || "-"}
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
                        {renderStatusBadge(inquiry.status)}
                      </td>
                      <td className="p-4 text-center text-muted-foreground dark:text-muted-foreground">
                        {new Date(inquiry.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              {!isLoading && data?.inquiries?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground dark:text-muted-foreground"
                  >
                    소매 문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 */}
        <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground dark:text-muted-foreground">
              로딩 중...
            </div>
          )}
          {!isLoading &&
            data?.inquiries?.map((inquiry, index) => {
              const number = data.total
                ? data.total - ((data.page - 1) * (data.pageSize || 20) + index)
                : index + 1;
              const detailHref = `/admin/retail-inquiries/${inquiry.id}`;
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
                        {new Date(inquiry.created_at).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm font-semibold text-foreground dark:text-foreground">
                        {inquiry.retailer_business_name || "미등록 상호"}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                        {inquiry.retailer_phone || "-"}
                      </div>
                    </div>
                    {renderStatusBadge(inquiry.status)}
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
          {!isLoading && data?.inquiries?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground dark:text-muted-foreground">
              소매 문의가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


