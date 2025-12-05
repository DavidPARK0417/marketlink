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

import { Button } from "@/components/ui/button";
import { Mic, Plus } from "lucide-react";
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
  const [isVocModalOpen, setIsVocModalOpen] = React.useState(false);
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
    setIsVocModalOpen(false);
    console.log("✅ [support-page] VOC 제출 완료");
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
            { id: "voc", label: "고객의 소리" },
            { id: "announcements", label: "공지사항" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
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
              <h2 className="text-xl font-bold text-gray-900">1:1 문의 내역</h2>
              <Button
                onClick={() => setIsInquiryModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md text-sm"
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
            />

            {/* 통계 정보 */}
            {inquiriesData && (
              <div className="text-sm text-gray-600">
                총 {inquiriesData.total}개의 문의 (페이지 {inquiriesData.page} /{" "}
                {inquiriesData.totalPages})
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

        {/* 고객의 소리 탭 */}
        {activeTab === "voc" && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              고객의 소리(VOC)
            </h2>
            <p className="text-gray-600 mb-8">
              서비스 이용 중 불편하셨던 점이나 개선할 점을 들려주세요.
              <br />
              고객님의 소중한 의견을 귀담아듣고 더 나은 서비스를 만들겠습니다.
            </p>
            <button
              onClick={() => setIsVocModalOpen(true)}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
            >
              의견 보내기
            </button>
          </div>
        )}

        {/* 공지사항 탭 */}
        {activeTab === "announcements" && (
          <AnnouncementList
            announcements={announcements}
            isLoading={isAnnouncementsLoading}
          />
        )}
      </div>

      {/* 문의 작성 모달 */}
      <InquiryCreateModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        onSuccess={handleInquiryCreated}
      />

      {/* VOC 모달 */}
      {isVocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsVocModalOpen(false)}
          />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              소중한 의견 보내기
            </h2>
            <p className="text-sm text-gray-500 mb-4 -mt-4">
              보내주신 의견은 서비스 개선을 위해 소중하게 활용됩니다.
            </p>
            <VOCForm
              onSuccess={handleVOCSubmitted}
              onCancel={() => setIsVocModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
