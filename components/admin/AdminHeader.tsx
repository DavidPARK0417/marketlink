/**
 * @file components/admin/AdminHeader.tsx
 * @description 관리자 페이지 헤더
 *
 * 관리자 전용 헤더 컴포넌트입니다.
 * 현재 경로에 따라 동적으로 페이지 제목을 표시합니다.
 *
 * 주요 기능:
 * 1. 페이지 제목 영역 (경로별 동적 표시)
 * 2. 사용자 드롭다운 메뉴 (Clerk UserButton 사용)
 * 3. 반응형 디자인 (모바일에서 제목 숨김)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton, useUser)
 * - next/navigation (usePathname)
 */

"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// 경로별 페이지 제목 매핑 (AdminSidebar의 menuItems와 일관성 유지)
const pageTitleMap: Record<string, string> = {
  "/admin/dashboard": "관리자 대시보드",
  "/admin/wholesalers/pending": "도매 승인 대기",
  "/admin/inquiries": "도매 문의 관리",
  "/admin/audit-logs": "감사 로그",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인 (Hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 현재 경로에 따른 페이지 제목 결정
  const getPageTitle = (): string => {
    // 마운트되지 않았으면 기본값 반환 (서버 사이드 렌더링 시 Hydration 오류 방지)
    if (!mounted) {
      return "관리자 페이지";
    }

    // 대시보드는 정확히 일치해야 함
    if (pathname === "/admin/dashboard") {
      return pageTitleMap["/admin/dashboard"] || "관리자 페이지";
    }

    // 나머지는 경로가 시작하는지 확인 (하위 경로 포함)
    for (const [path, title] of Object.entries(pageTitleMap)) {
      if (path !== "/admin/dashboard" && pathname.startsWith(path)) {
        return title;
      }
    }

    // 매핑되지 않은 경우 기본값
    return "관리자 페이지";
  };

  const pageTitle = getPageTitle();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      {/* 페이지 제목 영역 */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900 hidden md:block">
          {pageTitle}
        </h2>
      </div>

      {/* 오른쪽 영역: 사용자 메뉴 */}
      <div className="flex items-center gap-4">
        {/* 사용자 드롭다운 메뉴 - 클라이언트 사이드에서만 렌더링 */}
        {mounted && isLoaded && (
          <UserButton />
        )}
      </div>
    </header>
  );
}

