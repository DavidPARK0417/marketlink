/**
 * @file components/wholesaler/Support/FAQList.tsx
 * @description FAQ 목록 컴포넌트
 *
 * 자주 묻는 질문 목록을 아코디언 형태로 표시합니다.
 * 한 번에 하나만 열 수 있습니다.
 *
 * 주요 기능:
 * 1. FAQ 목록 표시 (아코디언)
 * 2. 검색어로 필터링
 * 3. 표시 순서대로 정렬
 *
 * @dependencies
 * - components/ui/accordion.tsx
 * - types/faq.ts
 */

"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (sortedFAQs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchQuery
            ? "검색 결과가 없습니다."
            : "등록된 FAQ가 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {sortedFAQs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left">
            <span className="font-medium">{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="whitespace-pre-wrap text-gray-700 pt-2">
              {faq.answer}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

