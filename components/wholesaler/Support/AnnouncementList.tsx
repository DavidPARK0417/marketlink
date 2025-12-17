/**
 * @file components/wholesaler/Support/AnnouncementList.tsx
 * @description 공지사항 목록 컴포넌트
 *
 * 공지사항 목록을 표시합니다.
 * 최신순으로 정렬되며, 7일 이내 작성된 공지사항에는 "NEW" 라벨을 표시합니다.
 *
 * 주요 기능:
 * 1. 공지사항 목록 표시
 * 2. "NEW" 라벨 표시 (7일 이내)
 * 3. 날짜 표시
 * 4. 클릭 시 상세 페이지로 이동
 *
 * @dependencies
 * - types/announcement.ts
 * - date-fns
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Announcement } from "@/types/announcement";

interface AnnouncementListProps {
  /**
   * 공지사항 목록
   */
  announcements: Announcement[];
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 시작 번호 (기본값: 1)
   */
  startNumber?: number;
  /**
   * 전체 개수 (번호 역순 계산용)
   */
  total?: number;
}

export default function AnnouncementList({
  announcements,
  isLoading = false,
  startNumber = 1,
  total,
}: AnnouncementListProps) {
  // 7일 이내 작성된 공지사항인지 확인
  const isNew = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        
        {/* 데스크톱 스켈레톤 (md 이상) */}
        <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-5 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="h-5 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="h-5 w-full max-w-md animate-pulse rounded bg-gray-200 dark:bg-gray-700 flex-1" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700 shrink-0 ml-4" />
            </div>
          ))}
        </div>

        {/* 모바일 스켈레톤 (md 미만) */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-4 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 flex-1 min-w-0" />
                </div>
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700 shrink-0 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          공지사항
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">등록된 공지사항이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        공지사항
      </h2>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        {announcements.map((announcement, index) => {
          const newLabel = isNew(announcement.created_at);
          // 먼저 작성한 글이 1번이 되도록 번호 계산
          // 내림차순 정렬이므로 역순으로 계산: total - (startNumber + index - 1)
          const number = total 
            ? total - (startNumber + index - 1)
            : startNumber + index;
          return (
            <Link
              key={announcement.id}
              href={`/wholesaler/support/announcements/${announcement.id}`}
              className="block p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[2rem]">
                  {number}
                </span>
                {newLabel && (
                  <span className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                    NEW
                  </span>
                )}
                <span className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-[#10B981] transition-colors">
                  {announcement.title}
                </span>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {format(new Date(announcement.created_at), "yyyy-MM-dd", {
                  locale: ko,
                })}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

