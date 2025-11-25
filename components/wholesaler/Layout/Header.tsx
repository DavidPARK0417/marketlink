/**
 * @file components/wholesaler/Layout/Header.tsx
 * @description 도매 페이지 헤더
 *
 * 도매 전용 헤더 컴포넌트입니다.
 * 사용자 정보와 알림 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 페이지 제목 영역 (경로별 동적 표시)
 * 2. 알림 아이콘 (새 주문 알림 표시 - UI만 구현, 로직은 추후)
 * 3. 사용자 드롭다운 메뉴 (Clerk UserButton 사용)
 * 4. 반응형 디자인 (모바일에서 제목 숨김)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton)
 * - next/navigation (usePathname)
 * - lucide-react (아이콘)
 */

"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

// 경로별 페이지 제목 매핑 (Sidebar의 menuItems와 일관성 유지)
const pageTitleMap: Record<string, string> = {
  "/wholesaler/dashboard": "대시보드",
  "/wholesaler/products": "상품 관리",
  "/wholesaler/market-prices": "시세 조회",
  "/wholesaler/orders": "주문 관리",
  "/wholesaler/settlements": "정산 관리",
  "/wholesaler/inquiries": "문의 관리",
  "/wholesaler/settings": "설정",
};

export default function WholesalerHeader() {
  const pathname = usePathname();

  // 현재 경로에 따른 페이지 제목 결정
  const getPageTitle = (): string => {
    // 대시보드는 정확히 일치해야 함
    if (pathname === "/wholesaler/dashboard") {
      return pageTitleMap["/wholesaler/dashboard"] || "도매 관리";
    }

    // 나머지는 경로가 시작하는지 확인 (하위 경로 포함)
    for (const [path, title] of Object.entries(pageTitleMap)) {
      if (path !== "/wholesaler/dashboard" && pathname.startsWith(path)) {
        return title;
      }
    }

    // 매핑되지 않은 경우 기본값
    return "도매 관리";
  };

  const pageTitle = getPageTitle();

  // 알림 상태 (추후 실제 알림 로직으로 연결 예정)
  const hasNewNotifications = false;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      {/* 페이지 제목 영역 */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900 hidden md:block">
          {pageTitle}
        </h2>
      </div>

      {/* 오른쪽 영역: 알림 + 사용자 메뉴 */}
      <div className="flex items-center gap-4">
        {/* 알림 아이콘 */}
        <button
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="알림"
          onClick={() => {
            // 추후 알림 목록 드롭다운 연결 예정
            console.log("알림 클릭");
          }}
        >
          <Bell className="w-5 h-5" />
          {/* 알림 배지 (새 알림이 있을 때만 표시) */}
          {hasNewNotifications && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* 사용자 드롭다운 메뉴 */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </header>
  );
}
