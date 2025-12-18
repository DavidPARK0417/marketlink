/**
 * @file components/admin/AccountManagementTable.tsx
 * @description 계정 관리 테이블 컴포넌트
 *
 * 도매 및 소매 계정을 탭으로 구분하여 표시하는 테이블 컴포넌트입니다.
 * 각 계정에 정지/해제 버튼을 제공합니다.
 *
 * 주요 기능:
 * 1. 도매/소매 탭 전환
 * 2. 계정 목록 테이블 표시
 * 3. 상태 배지 표시
 * 4. 페이지네이션
 *
 * @dependencies
 * - components/admin/AccountManagementRow.tsx
 * - next/navigation (useRouter, useSearchParams)
 */

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AccountManagementRow from "@/components/admin/AccountManagementRow";
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
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface WholesalerAccount {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  phone: string;
  status: string;
  suspension_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
  }[];
}

interface RetailerAccount {
  id: string;
  business_name: string;
  phone: string;
  address: string;
  status: string;
  suspension_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
  }[];
}

interface AccountManagementTableProps {
  activeTab: string;
  wholesalers: WholesalerAccount[];
  retailers: RetailerAccount[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export default function AccountManagementTable({
  activeTab,
  wholesalers,
  retailers,
  isLoading = false,
  total = 0,
  page = 1,
  pageSize = 20,
  totalPages = 0,
}: AccountManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("search") || ""
  );
  const [isMobile, setIsMobile] = React.useState(false);

  // 화면 크기 감지
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // URL 파라미터 변경 시 검색어 상태 동기화
  React.useEffect(() => {
    const searchParam = searchParams.get("search") || "";
    setSearchQuery(searchParam);
  }, [searchParams]);

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // 검색 시 첫 페이지로
    router.push(`/admin/accounts?${params.toString()}`);
  };

  // 검색어 초기화 핸들러
  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`/admin/accounts?${params.toString()}`);
  };

  // 탭 전환 핸들러
  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.set("page", "1"); // 탭 변경 시 첫 페이지로
    router.push(`/admin/accounts?${params.toString()}`);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/accounts?${params.toString()}`);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", newPageSize);
    params.set("page", "1"); // 페이지 크기 변경 시 첫 페이지로
    router.push(`/admin/accounts?${params.toString()}`);
  };

  const accounts = activeTab === "wholesalers" ? wholesalers : retailers;
  const isWholesalersTab = activeTab === "wholesalers";

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <CardContent className="p-0">
        {/* 검색 영역 */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder={
                  isWholesalersTab
                    ? isMobile
                      ? "상호명, 이메일, 전화번호 검색"
                      : "상호명, 이메일, 전화번호, 대표자명으로 검색"
                    : isMobile
                      ? "상호명, 이메일, 전화번호 검색"
                      : "상호명, 이메일, 전화번호로 검색"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 md:pl-10 pr-9 md:pr-10 w-full text-sm md:text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="검색어 초기화"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex">
            <button
              onClick={() => handleTabChange("wholesalers")}
              className={cn(
                "px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium transition-colors duration-200 border-b-2",
                activeTab === "wholesalers"
                  ? "border-[#10B981] text-[#10B981] bg-[#10B981]/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
              )}
            >
              <span className="hidden sm:inline">도매 계정</span>
              <span className="sm:hidden">도매</span>
              <span className="ml-1">({wholesalers.length})</span>
            </button>
            <button
              onClick={() => handleTabChange("retailers")}
              className={cn(
                "px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium transition-colors duration-200 border-b-2",
                activeTab === "retailers"
                  ? "border-[#10B981] text-[#10B981] bg-[#10B981]/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
              )}
            >
              <span className="hidden sm:inline">소매 계정</span>
              <span className="sm:hidden">소매</span>
              <span className="ml-1">({retailers.length})</span>
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
          </div>
        )}

        {/* 빈 목록 */}
        {!isLoading && accounts.length === 0 && (
          <div className="py-12">
            <EmptyState
              message={searchQuery ? "검색 결과가 없습니다" : "계정이 없습니다"}
              description={
                searchQuery
                  ? `"${searchQuery}"에 대한 검색 결과가 없습니다. 다른 검색어를 시도해보세요.`
                  : isWholesalersTab
                    ? "승인된 도매 계정이 없습니다."
                    : "활성화된 소매 계정이 없습니다."
              }
            />
          </div>
        )}

        {/* 테이블 */}
        {!isLoading && accounts.length > 0 && (
          <>
            {/* 태블릿/데스크톱 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12 md:w-16">
                      번호
                    </th>
                    {isWholesalersTab ? (
                      <>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                          상호명
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell min-w-[100px]">
                          사업자번호
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell min-w-[80px]">
                          대표자
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell min-w-[150px]">
                          이메일
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                          상태
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell min-w-[120px]">
                          가입일
                        </th>
                        <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                          관리
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                          상호명
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                          연락처
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell min-w-[150px]">
                          이메일
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell min-w-[200px]">
                          주소
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                          상태
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell min-w-[120px]">
                          가입일
                        </th>
                        <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                          관리
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {accounts.map((account, index) => {
                    const rowNumber = (page - 1) * pageSize + index + 1;
                    return (
                      <AccountManagementRow
                        key={account.id}
                        account={account}
                        accountType={isWholesalersTab ? "wholesaler" : "retailer"}
                        rowNumber={rowNumber}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
              {accounts.map((account, index) => {
                const rowNumber = (page - 1) * pageSize + index + 1;
                return (
                  <AccountManagementRow
                    key={account.id}
                    account={account}
                    accountType={isWholesalersTab ? "wholesaler" : "retailer"}
                    isMobile
                    rowNumber={rowNumber}
                  />
                );
              })}
            </div>

            {/* 페이지네이션 */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 dark:border-gray-800">
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
                      handlePageSizeChange(value);
                      // 페이지 크기 변경 시 첫 페이지로 이동
                      handlePageChange(1);
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

                      const pageNumValue = pageNum as number;
                      const isActive = pageNumValue === page;

                      return (
                        <Button
                          key={pageNumValue}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumValue)}
                          className={`h-9 min-w-[36px] ${
                            isActive
                              ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                              : ""
                          }`}
                        >
                          {pageNumValue}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

