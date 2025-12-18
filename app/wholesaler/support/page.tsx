/**
 * @file app/wholesaler/support/page.tsx
 * @description 고객센터 페이지
 *
 * 도매사업자가 고객센터 기능을 이용하는 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 상단 초록색 배너 (FAQ 검색 포함)
 * 2. 탭 구성: 문의내역, 자주묻는질문, 고객의 소리, 공지사항
 * 3. 문의 작성 모달
 * 4. FAQ 목록 (아코디언)
 * 5. 공지사항 목록
 * 6. 고객의 소리 제출 폼
 *
 * @dependencies
 * - components/wholesaler/Support/SupportBanner.tsx
 * - components/wholesaler/Support/InquiryCreateModal.tsx
 * - components/wholesaler/Support/FAQList.tsx
 * - components/wholesaler/Support/AnnouncementList.tsx
 * - components/wholesaler/Support/VOCForm.tsx
 * - components/wholesaler/Inquiries/InquiryTable.tsx
 * - components/wholesaler/Inquiries/InquiryFilter.tsx
 */

"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import SupportBanner from "@/components/wholesaler/Support/SupportBanner";
import InquiryCreateModal from "@/components/wholesaler/Support/InquiryCreateModal";
import FAQList from "@/components/wholesaler/Support/FAQList";
import AnnouncementList from "@/components/wholesaler/Support/AnnouncementList";
import InquiryTable from "@/components/wholesaler/Inquiries/InquiryTable";
import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";
import type { FAQ } from "@/types/faq";
import type { Announcement } from "@/types/announcement";

// 관리자 문의 목록 조회 함수
async function fetchInquiriesToAdmin(
  filter: InquiryFilterType = {},
  page: number = 1,
  pageSize: number = 20,
) {
  console.log("🔍 [support-page] 관리자 문의 목록 조회 요청", {
    filter,
    page,
    pageSize,
  });

  const response = await fetch("/api/wholesaler/inquiries/to-admin", {
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
    let errorPayload: unknown = null;
    try {
      const raw = await response.text();
      const parsed = raw ? JSON.parse(raw) : {};
      errorPayload = parsed;
      errorMessage =
        (typeof parsed === "object" && parsed && "error" in parsed
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (parsed as any).error
          : undefined) || raw || errorMessage;
      console.error("❌ [support-page] API 에러 응답:", parsed);
    } catch (e) {
      errorPayload = e;
      console.error("❌ [support-page] 에러 응답 파싱 실패:", e);
    }

    // 사용자에게 최대한 의미 있는 메시지 전달
    if (!errorMessage) {
      errorMessage = "문의 목록을 불러오는 중 오류가 발생했습니다.";
    }
    console.error("❌ [support-page] 문의 목록 조회 실패", {
      message: errorMessage,
      errorPayload,
    });

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [support-page] 관리자 문의 목록 조회 성공", {
    inquiriesCount: data.inquiries?.length ?? 0,
    total: data.total,
  });

  return data;
}

// FAQ 목록 조회 함수
async function fetchFAQs(searchQuery?: string) {
  console.log("🔍 [support-page] FAQ 목록 조회 요청", { searchQuery });

  const params = new URLSearchParams();
  if (searchQuery) {
    params.append("search", searchQuery);
  }

  const response = await fetch(`/api/wholesaler/faqs?${params.toString()}`);

  if (!response.ok) {
    throw new Error("FAQ 목록 조회 실패");
  }

  const data = await response.json();
  console.log("✅ [support-page] FAQ 목록 조회 성공", {
    faqsCount: data.faqs?.length ?? 0,
  });

  return data.faqs as FAQ[];
}

// 공지사항 목록 조회 함수
async function fetchAnnouncements(page: number = 1, pageSize: number = 20) {
  console.log("🔍 [support-page] 공지사항 목록 조회 요청", { page, pageSize });

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  const response = await fetch(`/api/wholesaler/announcements?${params.toString()}`);

  if (!response.ok) {
    throw new Error("공지사항 목록 조회 실패");
  }

  const data = await response.json();
  console.log("✅ [support-page] 공지사항 목록 조회 성공", {
    announcementsCount: data.announcements?.length ?? 0,
    total: data.total,
  });

  return data;
}

export default function SupportPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터에서 탭 및 검색어 읽기
  const allowedTabs = ["inquiry", "faq", "announcements"] as const;
  const initialTabParam = searchParams.get("tab");
  const initialTab = allowedTabs.includes(initialTabParam as typeof allowedTabs[number])
    ? (initialTabParam as string)
    : "inquiry";
  const initialSearch = searchParams.get("search") || "";

  // 상태 관리
  const [activeTab, setActiveTab] = React.useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = React.useState<string>(initialSearch);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<InquiryFilterType>({});

  // 페이지네이션 상태
  const [inquiryPage, setInquiryPage] = React.useState(1);
  const [inquiryPageSize, setInquiryPageSize] = React.useState(20);
  const [announcementPage, setAnnouncementPage] = React.useState(1);
  const [announcementPageSize, setAnnouncementPageSize] = React.useState(20);

  // 필터 변경 시 페이지를 1로 리셋
  React.useEffect(() => {
    setInquiryPage(1);
  }, [filter]);

  // URL 쿼리 파라미터 업데이트
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "inquiry") {
      params.set("tab", activeTab);
    }
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    const newUrl = params.toString()
      ? `/wholesaler/support?${params.toString()}`
      : "/wholesaler/support";
    router.replace(newUrl, { scroll: false });
  }, [activeTab, searchQuery, router]);

  // 탭 변경 시 필터 업데이트 (문의내역 탭만)
  React.useEffect(() => {
    if (activeTab !== "inquiry") {
      return;
    }

    const statusMap: Record<string, InquiryStatus | undefined> = {
      inquiry: undefined,
      open: "open",
      answered: "answered",
      closed: "closed",
    };

    // URL에서 상태 읽기 (필요시)
    const statusParam = searchParams.get("status");
    if (statusParam && statusMap[statusParam]) {
      setFilter((prev) => ({
        ...prev,
        status: statusMap[statusParam] as InquiryStatus,
      }));
    }
  }, [activeTab, searchParams]);

  // FAQ 검색 핸들러 (FAQ 탭으로 이동)
  const handleFAQSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
    setActiveTab("faq");
  }, []);

  // 관리자 문의 목록 조회 (문의내역 탭에서만)
  const {
    data: inquiriesData,
    isLoading: isInquiriesLoading,
    error: inquiriesError,
  } = useQuery({
    queryKey: ["inquiries-to-admin", filter, inquiryPage, inquiryPageSize],
    queryFn: () => fetchInquiriesToAdmin(filter, inquiryPage, inquiryPageSize),
    enabled: activeTab === "inquiry",
    staleTime: 30 * 1000,
  });

  // FAQ 목록 조회
  const { data: faqs = [], isLoading: isFAQsLoading } = useQuery({
    queryKey: ["faqs", searchQuery],
    queryFn: () => fetchFAQs(searchQuery),
    enabled: activeTab === "faq",
    staleTime: 60 * 1000,
  });

  // 공지사항 목록 조회
  const {
    data: announcementsData,
    isLoading: isAnnouncementsLoading,
  } = useQuery({
    queryKey: ["announcements", announcementPage, announcementPageSize],
    queryFn: () => fetchAnnouncements(announcementPage, announcementPageSize),
    enabled: activeTab === "announcements",
    staleTime: 60 * 1000,
  });

  // 에러 처리
  React.useEffect(() => {
    if (inquiriesError) {
      console.error(
        "❌ [support-page] 관리자 문의 목록 조회 오류:",
        inquiriesError,
      );
      toast.error(
        inquiriesError instanceof Error
          ? inquiriesError.message
          : "문의 목록을 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [inquiriesError]);

  // 문의 작성 성공 핸들러
  const handleInquiryCreated = () => {
    // 문의내역 탭으로 전환
    setActiveTab("inquiry");
    // 문의 목록 갱신
    queryClient.invalidateQueries({ queryKey: ["inquiries-to-admin"] });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 상단 배너 */}
      <SupportBanner
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleFAQSearch}
      />

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "inquiry", label: "문의내역" },
            { id: "faq", label: "자주묻는질문" },
            { id: "announcements", label: "공지사항" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[#10B981]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#10B981] rounded-t-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[400px] mt-8">
        {/* 문의내역 탭 */}
        {activeTab === "inquiry" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                1:1 문의 내역
              </h2>
              <Button
                onClick={() => setIsInquiryModalOpen(true)}
                className="flex items-center gap-2 bg-[#10B981] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#059669] transition-colors shadow-md text-sm"
              >
                <Plus className="w-4 h-4" />
                문의하기
              </Button>
            </div>

            {/* 필터 */}
            <InquiryFilter filter={filter} onFilterChange={setFilter} />

            {/* 문의 테이블 */}
            <InquiryTable
              inquiries={inquiriesData?.inquiries || []}
              isLoading={isInquiriesLoading}
              basePath="/wholesaler/support"
              startNumber={
                inquiriesData
                  ? (inquiriesData.page - 1) * (inquiriesData.pageSize || 20) + 1
                  : 1
              }
              total={inquiriesData?.total}
            />

            {/* 페이지네이션 */}
            {inquiriesData && inquiriesData.totalPages > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* 페이지 정보 및 페이지 크기 선택 */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  {/* 현재 페이지 정보 */}
                  <div className="text-sm text-muted-foreground dark:text-gray-300">
                    {(() => {
                      const startIndex = (inquiryPage - 1) * inquiryPageSize + 1;
                      const endIndex = Math.min(
                        inquiryPage * inquiryPageSize,
                        inquiriesData.total,
                      );
                      return `${startIndex}-${endIndex} / ${inquiriesData.total}건`;
                    })()}
                  </div>

                  {/* 페이지 크기 선택 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground dark:text-gray-300 whitespace-nowrap">
                      페이지당:
                    </span>
                    <Select
                      value={String(inquiryPageSize)}
                      onValueChange={(value) => {
                        setInquiryPageSize(Number(value));
                        setInquiryPage(1);
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
                    onClick={() => setInquiryPage((p) => Math.max(1, p - 1))}
                    disabled={inquiryPage <= 1}
                    className="h-9 px-3"
                  >
                    이전
                  </Button>

                  {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
                  <div className="hidden md:flex items-center gap-1">
                    {(() => {
                      const totalPages = inquiriesData.totalPages;
                      const maxPages = 5;
                      const currentPage = inquiryPage;

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

                      return pageNumbers.map((pageNum, index) => {
                        if (pageNum === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-2 text-sm text-muted-foreground dark:text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }

                        const pageNumber = pageNum as number;
                        const isActive = pageNumber === currentPage;

                        return (
                          <Button
                            key={pageNumber}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setInquiryPage(pageNumber)}
                            className={`h-9 min-w-[36px] ${
                              isActive
                                ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                                : ""
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      });
                    })()}
                  </div>

                  {/* 현재 페이지 번호 (모바일만 표시) */}
                  <div className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground dark:text-foreground">
                    {inquiryPage} / {inquiriesData.totalPages}
                  </div>

                  {/* 다음 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setInquiryPage((p) => Math.min(inquiriesData.totalPages, p + 1))
                    }
                    disabled={inquiryPage >= inquiriesData.totalPages}
                    className="h-9 px-3"
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 자주묻는질문 탭 */}
        {activeTab === "faq" && (
          <FAQList
            faqs={faqs}
            isLoading={isFAQsLoading}
            searchQuery={searchQuery}
          />
        )}

        {/* 공지사항 탭 */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <AnnouncementList
              announcements={announcementsData?.announcements || []}
              isLoading={isAnnouncementsLoading}
              startNumber={
                announcementsData
                  ? (announcementsData.page - 1) * announcementsData.pageSize + 1
                  : 1
              }
              total={announcementsData?.total}
            />

            {/* 페이지네이션 */}
            {announcementsData && announcementsData.totalPages > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* 페이지 정보 및 페이지 크기 선택 */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  {/* 현재 페이지 정보 */}
                  <div className="text-sm text-muted-foreground dark:text-gray-300">
                    {(() => {
                      const startIndex =
                        (announcementPage - 1) * announcementPageSize + 1;
                      const endIndex = Math.min(
                        announcementPage * announcementPageSize,
                        announcementsData.total,
                      );
                      return `${startIndex}-${endIndex} / ${announcementsData.total}건`;
                    })()}
                  </div>

                  {/* 페이지 크기 선택 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground dark:text-gray-300 whitespace-nowrap">
                      페이지당:
                    </span>
                    <Select
                      value={String(announcementPageSize)}
                      onValueChange={(value) => {
                        setAnnouncementPageSize(Number(value));
                        setAnnouncementPage(1);
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
                    onClick={() => setAnnouncementPage((p) => Math.max(1, p - 1))}
                    disabled={announcementPage <= 1}
                    className="h-9 px-3"
                  >
                    이전
                  </Button>

                  {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
                  <div className="hidden md:flex items-center gap-1">
                    {(() => {
                      const totalPages = announcementsData.totalPages;
                      const maxPages = 5;
                      const currentPage = announcementPage;

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

                      return pageNumbers.map((pageNum, index) => {
                        if (pageNum === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-2 text-sm text-muted-foreground dark:text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }

                        const pageNumber = pageNum as number;
                        const isActive = pageNumber === currentPage;

                        return (
                          <Button
                            key={pageNumber}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAnnouncementPage(pageNumber)}
                            className={`h-9 min-w-[36px] ${
                              isActive
                                ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                                : ""
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      });
                    })()}
                  </div>

                  {/* 현재 페이지 번호 (모바일만 표시) */}
                  <div className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground dark:text-foreground">
                    {announcementPage} / {announcementsData.totalPages}
                  </div>

                  {/* 다음 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAnnouncementPage((p) =>
                        Math.min(announcementsData.totalPages, p + 1),
                      )
                    }
                    disabled={announcementPage >= announcementsData.totalPages}
                    className="h-9 px-3"
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 문의 작성 모달 */}
      <InquiryCreateModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        onSuccess={handleInquiryCreated}
      />

    </div>
  );
}
