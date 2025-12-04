/**
 * @file components/wholesaler/Layout/WholesalerLayoutClient.tsx
 * @description 도매 페이지 레이아웃 클라이언트 컴포넌트
 *
 * 모바일 햄버거 메뉴 상태를 관리하는 클라이언트 컴포넌트입니다.
 * 서버 컴포넌트인 Layout에서 사용됩니다.
 *
 * 주요 기능:
 * 1. 모바일 햄버거 메뉴 상태 관리
 * 2. 모바일에서 사이드바를 오버레이로 표시
 * 3. 데스크톱에서 사이드바를 항상 표시
 *
 * @dependencies
 * - components/wholesaler/Layout/Sidebar.tsx
 * - components/wholesaler/Layout/Header.tsx
 */

"use client";

import { useState, useEffect } from "react";
import WholesalerSidebar from "@/components/wholesaler/Layout/Sidebar";
import WholesalerHeader from "@/components/wholesaler/Layout/Header";
import type { UserRole } from "@/types/database";

interface WholesalerLayoutClientProps {
  children: React.ReactNode;
  role?: UserRole;
}

export default function WholesalerLayoutClient({
  children,
  role,
}: WholesalerLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 모바일 메뉴 토글
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // 모바일 메뉴 닫기
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // 모바일에서 메뉴 항목 클릭 시 메뉴 닫기
  useEffect(() => {
    if (isMobileMenuOpen) {
      // 스크롤 방지
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 데스크톱 사이드바 - 항상 표시 */}
      <aside className="hidden md:block">
        <WholesalerSidebar />
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col w-full">
        {/* 헤더 */}
        <WholesalerHeader
          role={role}
          onMobileMenuToggle={handleMobileMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* 메인 컨텐츠 */}
        <main className="flex-1 w-full max-w-full p-4 md:p-6 bg-gray-50 overflow-x-hidden">{children}</main>
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {mounted && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 오버레이 배경 */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
          />

          {/* 사이드바 */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform">
            <WholesalerSidebar />
          </div>
        </div>
      )}
    </div>
  );
}

