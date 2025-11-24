/**
 * @file components/wholesaler/Layout/Header.tsx
 * @description 도매 페이지 헤더
 *
 * 도매 전용 헤더 컴포넌트입니다.
 * 사용자 정보와 알림 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 페이지 제목 영역
 * 2. 알림 아이콘 (새 주문 알림 표시 - 추후 구현)
 * 3. 사용자 드롭다운 메뉴 (Clerk UserButton 사용)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton)
 * - lucide-react (아이콘)
 */

"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";

export default function WholesalerHeader() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* 페이지 제목 영역 (추후 동적으로 변경 가능) */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">도매 관리</h2>
      </div>

      {/* 오른쪽 영역: 알림 + 사용자 메뉴 */}
      <div className="flex items-center gap-4">
        {/* 알림 아이콘 (추후 구현) */}
        <button
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="알림"
        >
          <Bell className="w-5 h-5" />
          {/* 알림 배지 (추후 구현) */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </button>

        {/* 사용자 드롭다운 메뉴 */}
        <UserButton />
      </div>
    </header>
  );
}
