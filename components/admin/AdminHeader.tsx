/**
 * @file components/admin/AdminHeader.tsx
 * @description 관리자 페이지 헤더 (간소화 버전)
 *
 * 관리자 전용 헤더 컴포넌트입니다.
 * 프로필 정보만 표시하는 간소화된 버전입니다.
 *
 * 주요 기능:
 * 1. 사용자 드롭다운 메뉴 (Clerk UserButton 사용)
 * 2. 반응형 디자인 (모바일에서는 사이드바에 포함)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton, useUser)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";

export default function AdminHeader() {
  const { isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // 클라이언트 사이드 마운트 확인 (Hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색어 패턴 감지 (도매 헤더 패턴과 유사하게 구성)
  const detectSearchType = (query: string) => {
    const trimmed = query.trim();
    if (/^\d{3}-\d{2}-\d{5}$/.test(trimmed) || /^\d{10,12}$/.test(trimmed)) {
      return "wholesaler";
    }
    if (/공지|announcement|notice/i.test(trimmed)) return "announcement";
    if (/faq/i.test(trimmed)) return "faq";
    if (/voc/i.test(trimmed)) return "voc";
    if (/로그|audit/i.test(trimmed)) return "audit";
    return "inquiry";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const type = detectSearchType(trimmed);
    const target =
      type === "wholesaler"
        ? `/admin/wholesalers/pending?search=${encodeURIComponent(trimmed)}`
        : type === "announcement"
          ? `/admin/announcements?search=${encodeURIComponent(trimmed)}`
          : type === "faq"
            ? `/admin/faqs?search=${encodeURIComponent(trimmed)}`
            : type === "voc"
              ? `/admin/voc?search=${encodeURIComponent(trimmed)}`
              : type === "audit"
                ? `/admin/audit-logs?search=${encodeURIComponent(trimmed)}`
                : `/admin/inquiries?search=${encodeURIComponent(trimmed)}`;

    console.log("🔍 [admin-header-search] 검색 실행", { query: trimmed, type, target });
    router.push(target);
  };

  return (
    <header className="hidden md:flex sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-16 items-center justify-between px-6 lg:px-8 gap-4">
      {/* 좌측/중앙: 검색창 */}
      <form onSubmit={handleSearch} className="flex-1 max-w-3xl min-w-[240px] relative group">
        <input
          type="text"
          placeholder="사업자번호, 문의, 공지, FAQ, VOC 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:bg-white dark:focus:bg-gray-700 transition-all"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#10B981]" />
      </form>

      {/* 우측: 사용자 드롭다운 메뉴 */}
      <div className="flex items-center justify-end">
        {mounted && isLoaded && <UserButton afterSignOutUrl="/sign-in" />}
      </div>
    </header>
  );
}

