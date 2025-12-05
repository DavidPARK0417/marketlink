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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">공지사항</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">공지사항</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {announcements.map((announcement) => {
          const newLabel = isNew(announcement.created_at);
          return (
            <Link
              key={announcement.id}
              href={`/wholesaler/support/announcements/${announcement.id}`}
              className="block p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {newLabel && (
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                    NEW
                  </span>
                )}
                <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                  {announcement.title}
                </span>
              </div>
              <span className="text-sm text-gray-400">
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

