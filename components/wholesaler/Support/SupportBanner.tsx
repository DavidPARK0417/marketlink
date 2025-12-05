/**
 * @file components/wholesaler/Support/SupportBanner.tsx
 * @description 고객센터 상단 배너 컴포넌트
 *
 * 고객센터 페이지 상단에 표시되는 초록색 배너입니다.
 * FAQ 검색 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 고객센터 제목 및 설명 표시
 * 2. FAQ 검색 바 제공
 * 3. 검색 시 FAQ 탭으로 이동 및 검색어 적용
 *
 * @dependencies
 * - lucide-react (Search 아이콘)
 */

"use client";

import * as React from "react";
import { Search } from "lucide-react";

interface SupportBannerProps {
  /**
   * 검색어
   */
  searchQuery: string;
  /**
   * 검색어 변경 핸들러
   */
  onSearchChange: (query: string) => void;
  /**
   * 검색 실행 핸들러 (FAQ 탭으로 이동)
   */
  onSearch: (query: string) => void;
}

export default function SupportBanner({
  searchQuery,
  onSearchChange,
  onSearch,
}: SupportBannerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(searchQuery);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-8 text-white shadow-lg mb-8">
      <div className="flex flex-col gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">고객센터</h1>
          <p className="text-white/90">
            무엇을 도와드릴까요? <br className="block md:hidden" />
            궁금한 점을 검색해보세요.
          </p>
        </div>
        <div className="w-full relative">
          <input
            type="text"
            placeholder="자주 묻는 질문 검색"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-3 pl-12 pr-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#10B981]/30 shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
