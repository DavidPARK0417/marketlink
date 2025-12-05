/**
 * @file components/wholesaler/Inquiries/InquiryFilter.tsx
 * @description 문의 필터 컴포넌트
 *
 * 문의 목록을 필터링하는 UI 컴포넌트입니다.
 * 날짜 범위, 상태, 검색어 필터를 제공합니다.
 *
 * @dependencies
 * - react-day-picker
 * - components/ui/input.tsx
 * - components/ui/select.tsx
 * - components/ui/button.tsx
 * - components/wholesaler/Orders/OrderDateRangePicker.tsx
 */

"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderDateRangePicker from "@/components/wholesaler/Orders/OrderDateRangePicker";
import type { InquiryStatus } from "@/types/database";
import type { InquiryFilter } from "@/types/inquiry";

interface InquiryFilterProps {
  filter: InquiryFilter;
  onFilterChange: (filter: InquiryFilter) => void;
}

export default function InquiryFilter({
  filter,
  onFilterChange,
}: InquiryFilterProps) {
  const [searchTerm, setSearchTerm] = React.useState(filter.search || "");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    filter.start_date && filter.end_date
      ? {
          from: new Date(filter.start_date),
          to: new Date(filter.end_date),
        }
      : undefined,
  );

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({
      ...filter,
      search: value || undefined,
    });
  };

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFilterChange({
      ...filter,
      start_date: range?.from
        ? range.from.toISOString().split("T")[0]
        : undefined,
      end_date: range?.to ? range.to.toISOString().split("T")[0] : undefined,
    });
  };

  // 상태 필터 변경 핸들러
  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filter,
      status: status === "all" ? undefined : (status as InquiryStatus),
    });
  };

  // 필터 초기화
  const handleReset = () => {
    setSearchTerm("");
    setDateRange(undefined);
    onFilterChange({
      wholesaler_id: filter.wholesaler_id,
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
      {/* 검색 및 필터 */}
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

        {/* 상태 필터 */}
        <Select
          value={filter.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="open">답변 대기</SelectItem>
            <SelectItem value="answered">답변 완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 필터 초기화 버튼 */}
      {(filter.search ||
        filter.start_date ||
        filter.end_date ||
        filter.status) && (
        <Button variant="outline" size="sm" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          초기화
        </Button>
      )}
    </div>
  );
}
