/**
 * @file components/admin/VOCManagementClient.tsx
 * @description VOC 관리 클라이언트 컴포넌트
 *
 * VOC 피드백 목록을 표시하고, 검색 및 필터링 기능을 제공하는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. VOC 피드백 목록 표시
 * 2. 검색 기능
 * 3. 날짜 범위 필터링
 *
 * @dependencies
 * - actions/admin/voc.ts
 * - components/ui/input.tsx
 * - components/ui/button.tsx
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrderDateRangePicker from "@/components/wholesaler/Orders/OrderDateRangePicker";
import type { VOCFeedbackFilter } from "@/types/voc";
import type { VOCFeedback } from "@/types/voc";

export default function VOCManagementClient() {
  const [filter, setFilter] = React.useState<VOCFeedbackFilter>({});
  const [searchTerm, setSearchTerm] = React.useState("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilter((prev) => ({
      ...prev,
      search: value || undefined,
    }));
  };

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFilter((prev) => ({
      ...prev,
      start_date: range?.from
        ? range.from.toISOString().split("T")[0]
        : undefined,
      end_date: range?.to ? range.to.toISOString().split("T")[0] : undefined,
    }));
  };

  // 필터 초기화
  const handleReset = () => {
    setSearchTerm("");
    setDateRange(undefined);
    setFilter({});
  };

  // VOC 피드백 목록 조회 함수
  const fetchVOCFeedbacks = async (filter: VOCFeedbackFilter) => {
    const params = new URLSearchParams();
    if (filter.search) params.append("search", filter.search);
    if (filter.profile_id) params.append("profile_id", filter.profile_id);
    if (filter.start_date) params.append("start_date", filter.start_date);
    if (filter.end_date) params.append("end_date", filter.end_date);

    const response = await fetch(`/api/admin/voc?${params.toString()}`);
    if (!response.ok) {
      throw new Error("VOC 피드백 조회 실패");
    }
    const data = await response.json();
    return data.feedbacks as VOCFeedback[];
  };

  // VOC 피드백 목록 조회
  const { data: feedbacks = [], isLoading, error } = useQuery({
    queryKey: ["voc-feedbacks", filter],
    queryFn: () => fetchVOCFeedbacks(filter),
    staleTime: 30 * 1000,
  });

  return (
    <div className="space-y-6">
      {/* 필터 영역 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          {/* 검색 입력 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="제목 또는 내용 검색..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 날짜 범위 선택 */}
          <OrderDateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* 필터 초기화 버튼 */}
        {(filter.search || filter.start_date || filter.end_date) && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      {/* 피드백 목록 */}
      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            피드백 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            등록된 피드백이 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {feedbacks.map((feedback: VOCFeedback) => (
              <div
                key={feedback.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feedback.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {feedback.content}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {format(new Date(feedback.created_at), "yyyy-MM-dd HH:mm", {
                        locale: ko,
                      })}
                    </div>
                  </div>
                  {feedback.profile && (
                    <div className="text-xs text-gray-500">
                      제출자: {feedback.profile.email} ({feedback.profile.role})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 통계 정보 */}
      {feedbacks.length > 0 && (
        <div className="text-sm text-gray-600">
          총 {feedbacks.length}개의 피드백
        </div>
      )}
    </div>
  );
}

