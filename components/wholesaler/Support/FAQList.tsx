/**
 * @file components/wholesaler/Support/FAQList.tsx
 * @description FAQ 목록 컴포넌트
 *
 * 자주 묻는 질문 목록을 아코디언 형태로 표시합니다.
 * 디자인 핸드오프 스타일 적용 (Q./A. 스타일).
 *
 * 주요 기능:
 * 1. FAQ 목록 표시 (아코디언)
 * 2. 검색어로 필터링
 * 3. 표시 순서대로 정렬
 *
 * @dependencies
 * - types/faq.ts
 * - lucide-react (ChevronDown, ChevronUp)
 */

"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { FAQ } from "@/types/faq";

interface FAQListProps {
  /**
   * FAQ 목록
   */
  faqs: FAQ[];
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 검색어 (필터링용)
   */
  searchQuery?: string;
}

export default function FAQList({
  faqs,
  isLoading = false,
  searchQuery = "",
}: FAQListProps) {
  const [openFaqId, setOpenFaqId] = React.useState<string | null>(null);

  // 검색어로 필터링
  const filteredFAQs = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return faqs;
    }

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query),
    );
  }, [faqs, searchQuery]);

  // 표시 순서대로 정렬
  const sortedFAQs = React.useMemo(() => {
    return [...filteredFAQs].sort((a, b) => a.display_order - b.display_order);
  }, [filteredFAQs]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (sortedFAQs.length === 0) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "검색 결과가 없습니다."
              : "등록된 FAQ가 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        자주 묻는 질문
      </h2>
      {sortedFAQs.map((faq) => (
        <div
          key={faq.id}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <button
            onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-[#10B981] font-bold w-8">Q.</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {faq.question}
              </span>
            </div>
            {openFaqId === faq.id ? (
              <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          {openFaqId === faq.id && (
            <div className="px-5 pb-5 pt-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-4 mt-4">
                <span className="text-gray-400 dark:text-gray-500 font-bold w-8">
                  A.
                </span>
                <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

