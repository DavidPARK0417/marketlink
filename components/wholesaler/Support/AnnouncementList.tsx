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
}

export default function AnnouncementList({
  announcements,
  isLoading = false,
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
      <div className="space-y-4 w-full">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="w-full rounded-md border bg-white">
        <div className="text-center py-12 w-full">
          <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md border bg-white">
      <div className="divide-y">
        {announcements.map((announcement) => {
          const newLabel = isNew(announcement.created_at);
          return (
            <Link
              key={announcement.id}
              href={`/wholesaler/support/announcements/${announcement.id}`}
              className="block w-full p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {newLabel && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        NEW
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 truncate">
                      {announcement.title}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {format(new Date(announcement.created_at), "yyyy-MM-dd", {
                    locale: ko,
                  })}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

