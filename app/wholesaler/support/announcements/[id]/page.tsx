/**
 * @file app/wholesaler/support/announcements/[id]/page.tsx
 * @description 공지사항 상세 페이지
 *
 * 공지사항의 상세 내용을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 공지사항 상세 내용 표시
 * 2. 목록으로 돌아가기 버튼
 * 3. "NEW" 라벨 표시 (7일 이내)
 *
 * @dependencies
 * - @tanstack/react-query
 * - components/ui/button.tsx
 * - components/ui/card.tsx
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Announcement } from "@/types/announcement";

// 공지사항 상세 조회 함수
async function fetchAnnouncementDetail(id: string) {
  console.log("🔍 [announcement-detail-page] 공지사항 상세 조회 요청", { id });

  const response = await fetch(`/api/wholesaler/announcements/${id}`);

  if (!response.ok) {
    let errorMessage = "공지사항 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [announcement-detail-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [announcement-detail-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [announcement-detail-page] 공지사항 상세 조회 성공");
  return data.announcement as Announcement;
}

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [announcementId, setAnnouncementId] = React.useState<string | null>(null);
  const router = useRouter();

  // params가 Promise이므로 await 처리
  React.useEffect(() => {
    params.then((p) => setAnnouncementId(p.id));
  }, [params]);

  // 공지사항 상세 조회
  const {
    data: announcement,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["announcement", announcementId],
    queryFn: () => fetchAnnouncementDetail(announcementId!),
    enabled: !!announcementId,
    staleTime: 60 * 1000, // 60초
  });

  // 7일 이내 작성된 공지사항인지 확인
  const isNew = React.useMemo(() => {
    if (!announcement) return false;
    const createdDate = new Date(announcement.created_at);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }, [announcement]);

  // 에러 처리
  React.useEffect(() => {
    if (error) {
      console.error("❌ [announcement-detail-page] 공지사항 조회 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "공지사항을 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [error]);

  if (!announcementId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/wholesaler/support?tab=announcements")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>공지사항을 불러올 수 없습니다</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "공지사항을 찾을 수 없습니다."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 뒤로가기 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/wholesaler/support?tab=announcements")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로
      </Button>

      {/* 공지사항 상세 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isNew && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    NEW
                  </span>
                )}
                <CardTitle>{announcement.title}</CardTitle>
              </div>
              <CardDescription>
                작성일:{" "}
                {format(new Date(announcement.created_at), "yyyy년 MM월 dd일", {
                  locale: ko,
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700">
            {announcement.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

