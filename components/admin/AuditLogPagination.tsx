/**
 * @file components/admin/AuditLogPagination.tsx
 * @description 감사 로그 페이지네이션 컴포넌트
 *
 * 감사 로그 페이지의 페이지네이션 UI를 담당하는 클라이언트 컴포넌트입니다.
 *
 * @dependencies
 * - components/ui/button.tsx
 * - components/ui/select.tsx
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditLogPaginationProps {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  actionFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  userIdFilter?: string;
}

export default function AuditLogPagination({
  total,
  page,
  pageSize,
  totalPages,
  actionFilter,
  dateFrom,
  dateTo,
  userIdFilter,
}: AuditLogPaginationProps) {
  const buildQueryParams = (newPage: number, newPageSize?: number) => {
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (userIdFilter) params.set("user_id", userIdFilter);
    params.set("page", String(newPage));
    if (newPageSize !== undefined) {
      params.set("pageSize", String(newPageSize));
    } else if (pageSize !== 20) {
      params.set("pageSize", String(pageSize));
    }
    return params.toString();
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      {/* 페이지 정보 및 페이지 크기 선택 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* 현재 페이지 정보 */}
        <div className="text-sm text-muted-foreground dark:text-gray-300">
          {(() => {
            const startIndex = (page - 1) * pageSize + 1;
            const endIndex = Math.min(page * pageSize, total);
            return `${startIndex}-${endIndex} / ${total}건`;
          })()}
        </div>

        {/* 페이지 크기 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground dark:text-gray-300 whitespace-nowrap">
            페이지당:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              window.location.href = `/admin/audit-logs?${buildQueryParams(1, Number(value))}`;
            }}
          >
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 페이지 네비게이션 */}
      <div className="flex items-center gap-2">
        {/* 이전 버튼 */}
        <Link href={`/admin/audit-logs?${buildQueryParams(Math.max(1, page - 1))}`}>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            className="h-9 px-3"
          >
            이전
          </Button>
        </Link>

        {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
        <div className="hidden md:flex items-center gap-1">
          {(() => {
            const maxPages = 5;

            // 페이지 번호 배열 생성
            const getPageNumbers = (): (number | string)[] => {
              const pages: (number | string)[] = [];

              if (totalPages <= maxPages) {
                // 전체 페이지가 5개 이하면 모두 표시
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // 현재 페이지 중심으로 5개 표시
                if (page <= 3) {
                  // 앞부분
                  for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(totalPages);
                } else if (page >= totalPages - 2) {
                  // 뒷부분
                  pages.push(1);
                  pages.push("...");
                  for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // 중간
                  pages.push(1);
                  pages.push("...");
                  for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(totalPages);
                }
              }

              return pages;
            };

            const pageNumbers = getPageNumbers();

            return pageNumbers.map((pageNum, index) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-sm text-muted-foreground dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = pageNum as number;
              const isActive = pageNumber === page;

              return (
                <Link
                  key={pageNumber}
                  href={`/admin/audit-logs?${buildQueryParams(pageNumber)}`}
                >
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`h-9 min-w-[36px] ${
                      isActive
                        ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                        : ""
                    }`}
                  >
                    {pageNumber}
                  </Button>
                </Link>
              );
            });
          })()}
        </div>

        {/* 현재 페이지 번호 (모바일만 표시) */}
        <div className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground dark:text-foreground">
          {page} / {totalPages}
        </div>

        {/* 다음 버튼 */}
        <Link href={`/admin/audit-logs?${buildQueryParams(Math.min(totalPages, page + 1))}`}>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            className="h-9 px-3"
          >
            다음
          </Button>
        </Link>
      </div>
    </div>
  );
}

