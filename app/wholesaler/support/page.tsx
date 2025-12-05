/**
 * @file app/wholesaler/support/page.tsx
 * @description 고객센터 페이지
 *
 * 도매사업자가 고객센터 기능을 이용하는 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 상단 파란색 배너 (FAQ 검색 포함)
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
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupportBanner from "@/components/wholesaler/Support/SupportBanner";
import InquiryCreateModal from "@/components/wholesaler/Support/InquiryCreateModal";
import FAQList from "@/components/wholesaler/Support/FAQList";
import AnnouncementList from "@/components/wholesaler/Support/AnnouncementList";
import VOCForm from "@/components/wholesaler/Support/VOCForm";
import InquiryTable from "@/components/wholesaler/Inquiries/InquiryTable";
import InquiryFilter from "@/components/wholesaler/Inquiries/InquiryFilter";
import type { InquiryFilter as InquiryFilterType } from "@/types/inquiry";
import type { InquiryStatus } from "@/types/database";
import type { FAQ } from "@/types/faq";
import type { Announcement } from "@/types/announcement";

// 관리자 문의 목록 조회 함수
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
async function fetchAnnouncements() {
  console.log("🔍 [support-page] 공지사항 목록 조회 요청");

  const response = await fetch("/api/wholesaler/announcements");

  if (!response.ok) {
    throw new Error("공지사항 목록 조회 실패");
  }

  const data = await response.json();
  console.log("✅ [support-page] 공지사항 목록 조회 성공", {
    announcementsCount: data.announcements?.length ?? 0,
  });

  return data.announcements as Announcement[];
}

export default function SupportPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터에서 탭 및 검색어 읽기
  const initialTab = searchParams.get("tab") || "inquiry";
  const initialSearch = searchParams.get("search") || "";

  // 상태 관리
  const [activeTab, setActiveTab] = React.useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = React.useState<string>(initialSearch);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<InquiryFilterType>({});

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
    queryKey: ["inquiries-to-admin", filter],
    queryFn: () => fetchInquiriesToAdmin(filter),
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
  const { data: announcements = [], isLoading: isAnnouncementsLoading } =
    useQuery({
      queryKey: ["announcements"],
      queryFn: fetchAnnouncements,
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

  // VOC 제출 성공 핸들러
  const handleVOCSubmitted = () => {
    // 성공 메시지는 VOCForm 내부에서 처리됨
    console.log("✅ [support-page] VOC 제출 완료");
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* 상단 배너 */}
      <SupportBanner
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleFAQSearch}
      />

      {/* 탭 UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full min-w-0">
        <TabsList>
          <TabsTrigger 
            value="inquiry"
            className="data-[state=active]:text-[#10B981]"
          >
            문의내역
          </TabsTrigger>
          <TabsTrigger 
            value="faq"
            className="data-[state=active]:text-[#10B981]"
          >
            자주묻는질문
          </TabsTrigger>
          <TabsTrigger 
            value="voc"
            className="data-[state=active]:text-[#10B981]"
          >
            고객의 소리
          </TabsTrigger>
          <TabsTrigger 
            value="announcements"
            className="data-[state=active]:text-[#10B981]"
          >
            공지사항
          </TabsTrigger>
        </TabsList>

        {/* 문의내역 탭 */}
        <TabsContent value="inquiry" className="space-y-4 w-full max-w-full min-w-0">
          <div className="flex items-center justify-between w-full max-w-full min-w-0">
            <h2 className="text-lg font-semibold">1:1 문의 내역</h2>
            <Button onClick={() => setIsInquiryModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
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
          />

          {/* 통계 정보 */}
          {inquiriesData && (
            <div className="text-sm text-gray-600 w-full max-w-full min-w-0">
              총 {inquiriesData.total}개의 문의 (페이지 {inquiriesData.page} /{" "}
              {inquiriesData.totalPages})
            </div>
          )}
        </TabsContent>

        {/* 자주묻는질문 탭 */}
        <TabsContent value="faq" className="space-y-4 w-full max-w-full min-w-0">
          <h2 className="text-lg font-semibold w-full max-w-full min-w-0">자주 묻는 질문</h2>
          <FAQList
            faqs={faqs}
            isLoading={isFAQsLoading}
            searchQuery={searchQuery}
          />
        </TabsContent>

        {/* 고객의 소리 탭 */}
        <TabsContent value="voc" className="space-y-4 w-full max-w-full min-w-0">
          <VOCForm onSuccess={handleVOCSubmitted} />
        </TabsContent>

        {/* 공지사항 탭 */}
        <TabsContent
          value="announcements"
          className="space-y-4 w-full max-w-full min-w-0"
        >
          <h2 className="text-lg font-semibold w-full max-w-full min-w-0">공지사항</h2>
          <AnnouncementList
            announcements={announcements}
            isLoading={isAnnouncementsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* 문의 작성 모달 */}
      <InquiryCreateModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        onSuccess={handleInquiryCreated}
      />
    </div>
  );
}
