/**
 * @file components/admin/AuditLogFilter.tsx
 * @description 감사 로그 필터 컴포넌트
 *
 * 감사 로그 목록을 액션 유형, 날짜 범위, 관리자별로 필터링하는 클라이언트 컴포넌트입니다.
 * URL 쿼리 파라미터를 사용하여 필터 상태를 관리합니다.
 *
 * @dependencies
 * - next/navigation (useRouter, useSearchParams)
 * - components/ui/select.tsx
 * - components/wholesaler/Orders/OrderDateRangePicker.tsx
 * - react-day-picker
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OrderDateRangePicker from "@/components/wholesaler/Orders/OrderDateRangePicker";

interface Admin {
  id: string;
  email: string;
}

interface AuditLogFilterProps {
  currentAction?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
  currentUserId?: string;
  actions: string[];
  admins: Admin[];
}

export default function AuditLogFilter({
  currentAction,
  currentDateFrom,
  currentDateTo,
  currentUserId,
  actions,
  admins,
}: AuditLogFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 날짜 범위 상태
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    currentDateFrom && currentDateTo
      ? {
          from: new Date(currentDateFrom),
          to: new Date(currentDateTo),
        }
      : undefined,
  );

  // 날짜 범위가 변경되면 URL 업데이트
  useEffect(() => {
    if (currentDateFrom && currentDateTo) {
      setDateRange({
        from: new Date(currentDateFrom),
        to: new Date(currentDateTo),
      });
    } else {
      setDateRange(undefined);
    }
  }, [currentDateFrom, currentDateTo]);

  // 액션 유형 변경 핸들러
  const handleActionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("action");
    } else {
      params.set("action", value);
    }

    // 페이지를 1로 리셋 (pageSize는 유지)
    params.set("page", "1");
    // pageSize가 있으면 유지
    if (!params.has("pageSize")) {
      params.set("pageSize", "20");
    }

    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    const params = new URLSearchParams(searchParams.toString());

    if (range?.from) {
      params.set("date_from", range.from.toISOString().split("T")[0]);
    } else {
      params.delete("date_from");
    }

    if (range?.to) {
      params.set("date_to", range.to.toISOString().split("T")[0]);
    } else {
      params.delete("date_to");
    }

    // 페이지를 1로 리셋 (pageSize는 유지)
    params.set("page", "1");
    // pageSize가 있으면 유지
    if (!params.has("pageSize")) {
      params.set("pageSize", "20");
    }

    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  // 관리자 변경 핸들러
  const handleAdminChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("user_id");
    } else {
      params.set("user_id", value);
    }

    // 페이지를 1로 리셋 (pageSize는 유지)
    params.set("page", "1");
    // pageSize가 있으면 유지
    if (!params.has("pageSize")) {
      params.set("pageSize", "20");
    }

    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  // 필터 초기화
  const handleReset = () => {
    router.push("/admin/audit-logs");
  };

  // 필터가 적용되어 있는지 확인
  const hasActiveFilters =
    currentAction || currentDateFrom || currentDateTo || currentUserId;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* 필터 컨트롤 */}
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-4">
        {/* 액션 유형 필터 */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            액션:
          </label>
          <Select
            value={currentAction || "all"}
            onValueChange={handleActionChange}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, " ").replace(/\b\w/g, (char) =>
                    char.toUpperCase(),
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 날짜 범위 선택 */}
        <div className="w-full md:w-auto">
          <OrderDateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* 관리자 필터 */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            관리자:
          </label>
          <Select
            value={currentUserId || "all"}
            onValueChange={handleAdminChange}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 필터 초기화 버튼 */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleReset} className="w-full md:w-auto">
          <X className="mr-2 h-4 w-4" />
          초기화
        </Button>
      )}
    </div>
  );
}

