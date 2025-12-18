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
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex">
            <button
              onClick={() => handleTabChange("wholesalers")}
              className={cn(
                "px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2",
                activeTab === "wholesalers"
                  ? "border-[#10B981] text-[#10B981] bg-[#10B981]/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
              )}
            >
              도매 계정 ({wholesalers.length})
            </button>
            <button
              onClick={() => handleTabChange("retailers")}
              className={cn(
                "px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2",
                activeTab === "retailers"
                  ? "border-[#10B981] text-[#10B981] bg-[#10B981]/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
              )}
            >
              소매 계정 ({retailers.length})
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
              message="계정이 없습니다"
              description={
                isWholesalersTab
                  ? "승인된 도매 계정이 없습니다."
                  : "활성화된 소매 계정이 없습니다."
              }
            />
          </div>
        )}

        {/* 테이블 */}
        {!isLoading && accounts.length > 0 && (
          <>
            {/* 데스크톱 테이블 */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {isWholesalersTab ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          상호명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          사업자번호
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          대표자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          이메일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          가입일
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          관리
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          상호명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          연락처
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          이메일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          주소
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          가입일
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          관리
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {accounts.map((account) => (
                    <AccountManagementRow
                      key={account.id}
                      account={account}
                      accountType={isWholesalersTab ? "wholesaler" : "retailer"}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-800">
              {accounts.map((account) => (
                <AccountManagementRow
                  key={account.id}
                  account={account}
                  accountType={isWholesalersTab ? "wholesaler" : "retailer"}
                  isMobile
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    페이지 크기:
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

