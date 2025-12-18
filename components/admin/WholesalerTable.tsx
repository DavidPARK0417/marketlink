/**
 * @file components/admin/WholesalerTable.tsx
 * @description 도매사업자 테이블 클라이언트 컴포넌트
 *
 * 도매 승인 대기 목록을 표시하는 클라이언트 컴포넌트입니다.
 * 로딩 상태일 때 스켈레톤을 표시합니다.
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import WholesalerTableRow from "@/components/admin/WholesalerTableRow";
import WholesalerTableSkeleton from "@/components/admin/WholesalerTableSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/common/EmptyState";

interface PendingWholesaler {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  created_at: string;
  email: string | null; // 이메일을 직접 포함
  profiles?: {
    email: string;
  }[] | {
    email: string;
  } | null; // Supabase 조인 결과 (호환성 유지)
}

interface WholesalerTableProps {
  wholesalers: PendingWholesaler[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export default function WholesalerTable({
  wholesalers,
  isLoading = false,
  total = 0,
  page = 1,
  pageSize = 20,
  totalPages = 0,
}: WholesalerTableProps) {
  const router = useRouter();

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    router.push(`/admin/wholesalers/pending?${params.toString()}`);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("pageSize", String(newPageSize));
    params.set("page", "1"); // 페이지 크기 변경 시 첫 페이지로 이동
    router.push(`/admin/wholesalers/pending?${params.toString()}`);
  };
  if (isLoading) {
    return <WholesalerTableSkeleton />;
  }

  if (!wholesalers || wholesalers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <EmptyState
            message="승인 대기 중인 도매사업자가 없습니다"
            description="현재 승인 대기 상태인 도매사업자가 없습니다. 새로운 신청이 들어오면 여기에 표시됩니다."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-200">
      {/* 데스크톱 테이블 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20 min-w-[60px]">
                번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                상호명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                사업자번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                대표자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                신청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {wholesalers.map((wholesaler, index) => {
              // 타입 안전성을 위해 타입 단언
              const wholesalerData = wholesaler as unknown as PendingWholesaler;
              
              // email 필드가 직접 포함되어 있으면 사용, 없으면 profiles에서 추출
              let email: string | null = wholesalerData.email || null;
              
              // email이 없고 profiles가 있는 경우에만 추출 시도
              if (!email && wholesalerData.profiles) {
                if (Array.isArray(wholesalerData.profiles) && wholesalerData.profiles.length > 0) {
                  email = wholesalerData.profiles[0].email;
                } else if (typeof wholesalerData.profiles === 'object' && 'email' in wholesalerData.profiles) {
                  email = (wholesalerData.profiles as { email: string }).email;
                }
              }

              // 페이지네이션을 고려한 번호 계산
              const rowNumber = (page - 1) * pageSize + index + 1;

              return (
                <WholesalerTableRow
                  key={wholesalerData.id}
                  id={wholesalerData.id}
                  business_name={wholesalerData.business_name}
                  business_number={wholesalerData.business_number}
                  representative={wholesalerData.representative}
                  email={email}
                  created_at={wholesalerData.created_at}
                  rowNumber={rowNumber}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {wholesalers.map((wholesaler, index) => {
          const wholesalerData = wholesaler as unknown as PendingWholesaler;
          
          // email 필드가 직접 포함되어 있으면 사용, 없으면 profiles에서 추출
          let email: string | null = wholesalerData.email || null;
          
          // email이 없고 profiles가 있는 경우에만 추출 시도
          if (!email && wholesalerData.profiles) {
            if (Array.isArray(wholesalerData.profiles) && wholesalerData.profiles.length > 0) {
              email = wholesalerData.profiles[0].email;
            } else if (typeof wholesalerData.profiles === 'object' && 'email' in wholesalerData.profiles) {
              email = (wholesalerData.profiles as { email: string }).email;
            }
          }

          // 페이지네이션을 고려한 번호 계산
          const rowNumber = (page - 1) * pageSize + index + 1;

          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(date);
          };

          return (
            <div
              key={wholesalerData.id}
              onClick={() => {
                window.location.href = `/admin/wholesalers/${wholesalerData.id}`;
              }}
              className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground dark:text-gray-300 font-medium">
                    {rowNumber}.
                  </span>
                  <div className="text-sm font-medium text-foreground dark:text-white">
                    {wholesalerData.business_name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground dark:text-gray-300 mb-1">
                      사업자번호
                    </div>
                    <div className="text-foreground dark:text-gray-200">
                      {wholesalerData.business_number}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground dark:text-gray-300 mb-1">
                      대표자
                    </div>
                    <div className="text-foreground dark:text-gray-200">
                      {wholesalerData.representative}
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground dark:text-gray-300 mb-1">
                    이메일
                  </div>
                  <div className="text-foreground dark:text-gray-200">
                    {email || "-"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-300">
                  {formatDate(wholesalerData.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
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
                  handlePageSizeChange(Number(value));
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="h-9 px-3"
            >
              이전
            </Button>

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
                    <Button
                      key={pageNumber}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`h-9 min-w-[36px] ${
                        isActive
                          ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                          : ""
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* 현재 페이지 번호 (모바일만 표시) */}
            <div className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground dark:text-foreground">
              {page} / {totalPages}
            </div>

            {/* 다음 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-9 px-3"
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

