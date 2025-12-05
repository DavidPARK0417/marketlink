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

import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function AdminHeader() {
  const { isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인 (Hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center justify-between px-8">
      {/* 왼쪽: 빈 공간 (필요시 추가 가능) */}
      <div></div>
      
      {/* 우측 상단: 사용자 드롭다운 메뉴 */}
      <div className="flex items-center justify-end">
        {mounted && isLoaded && (
          <UserButton afterSignOutUrl="/sign-in" />
        )}
      </div>
    </header>
  );
}

