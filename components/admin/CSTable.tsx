/**
 * @file components/admin/CSTable.tsx
 * @description CS 테이블 클라이언트 컴포넌트
 *
 * CS 목록을 표시하는 클라이언트 컴포넌트입니다.
 * 로딩 상태일 때 스켈레톤을 표시합니다.
 */

"use client";

import CSTableRow from "@/components/admin/CSTableRow";
import CSTableSkeleton from "@/components/admin/CSTableSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import type { CsThreadStatus } from "@/types/database";

interface CSThreadWithProfile {
  id: string;
  title: string;
  status: CsThreadStatus;
  created_at: string;
  closed_at: string | null;
  profiles: {
    email: string;
    role: "wholesaler" | "retailer" | "admin" | null;
  };
}

interface CSTableProps {
  threads: CSThreadWithProfile[];
  isLoading?: boolean;
  statusFilter?: CsThreadStatus;
  roleFilter?: "wholesaler" | "retailer";
}

export default function CSTable({
  threads,
  isLoading = false,
  statusFilter,
  roleFilter,
}: CSTableProps) {
  if (isLoading) {
    return <CSTableSkeleton />;
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <EmptyState
            message="CS 문의가 없습니다"
            description={
              statusFilter || roleFilter
                ? "선택한 필터 조건에 맞는 CS 문의가 없습니다. 필터를 변경해보세요."
                : "현재 등록된 CS 문의가 없습니다. 새로운 문의가 들어오면 여기에 표시됩니다."
            }
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
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                사용자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {threads.map((thread) => {
              const profileData =
                typeof thread.profiles === "object" &&
                thread.profiles !== null &&
                "email" in thread.profiles
                  ? (thread.profiles as { email: string; role: string | null })
                  : null;

              // role 타입 가드: 유효한 role 값인지 확인
              const validRole =
                profileData?.role === "wholesaler" ||
                profileData?.role === "retailer" ||
                profileData?.role === "admin"
                  ? (profileData.role as "wholesaler" | "retailer" | "admin")
                  : null;

              return (
                <CSTableRow
                  key={thread.id}
                  id={thread.id}
                  title={thread.title}
                  email={profileData?.email || "-"}
                  role={validRole}
                  status={thread.status}
                  created_at={thread.created_at}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {threads.map((thread) => {
          const profileData =
            typeof thread.profiles === "object" &&
            thread.profiles !== null &&
            "email" in thread.profiles
              ? (thread.profiles as { email: string; role: string | null })
              : null;

          const validRole =
            profileData?.role === "wholesaler" ||
            profileData?.role === "retailer" ||
            profileData?.role === "admin"
              ? (profileData.role as "wholesaler" | "retailer" | "admin")
              : null;

          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${year}-${month}-${day} ${hours}:${minutes}`;
          };

          return (
            <div
              key={thread.id}
              onClick={() => {
                window.location.href = `/admin/cs/${thread.id}`;
              }}
              className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {thread.title}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {profileData?.email || "-"}
                  </div>
                  {validRole && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {validRole === "wholesaler" ? "도매" : validRole === "retailer" ? "소매" : "관리자"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {thread.status === "open"
                      ? "대기"
                      : thread.status === "bot_handled"
                        ? "봇 처리"
                        : thread.status === "escalated"
                          ? "상급자 전달"
                          : "종료"}
                  </span>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(thread.created_at)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

