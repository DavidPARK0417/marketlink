/**
 * @file app/admin/inquiries/[id]/page.tsx
 * @description 관리자용 문의 상세 및 답변 페이지
 *
 * 관리자가 도매사업자 문의의 상세 정보를 확인하고 답변을 작성하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 문의 상세 정보 표시
 * 2. 도매사업자 익명 코드 표시
 * 3. 답변 작성 폼 (status가 'open'인 경우만)
 * 4. 기존 답변 표시
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - components/wholesaler/Inquiries/InquiryReplyForm.tsx
 * - components/wholesaler/Inquiries/InquiryStatusBadge.tsx
 */

"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InquiryStatusBadge from "@/components/wholesaler/Inquiries/InquiryStatusBadge";
import InquiryReplyForm from "@/components/wholesaler/Inquiries/InquiryReplyForm";
import InquiryImageModal from "@/components/admin/InquiryImageModal";

// 관리자용 문의 상세 조회 함수
async function fetchInquiryDetail(inquiryId: string) {
  console.log("🔍 [admin-inquiry-detail-page] 관리자용 문의 상세 조회 요청", {
    inquiryId,
  });

  const response = await fetch(`/api/admin/inquiries/${inquiryId}`);

  if (!response.ok) {
    let errorMessage = "문의 상세 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [admin-inquiry-detail-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [admin-inquiry-detail-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [admin-inquiry-detail-page] 관리자용 문의 상세 조회 성공");
  return data;
}

export default function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [inquiryId, setInquiryId] = React.useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const queryClient = useQueryClient();

  // params가 Promise이므로 await 처리
  React.useEffect(() => {
    params.then((p) => setInquiryId(p.id));
  }, [params]);

  // 문의 상세 조회
  const {
    data: inquiry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-inquiry", inquiryId],
    queryFn: () => fetchInquiryDetail(inquiryId!),
    enabled: !!inquiryId,
    staleTime: 30 * 1000, // 30초
  });

  // 답변 작성 성공 핸들러
  const handleReplySuccess = () => {
    // 문의 상세 정보 갱신
    queryClient.invalidateQueries({ queryKey: ["admin-inquiry", inquiryId] });
    queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
  };

  // 에러 처리
  React.useEffect(() => {
    if (error) {
      console.error(
        "❌ [admin-inquiry-detail-page] 관리자용 문의 상세 조회 오류:",
        error,
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "문의를 불러오는 중 오류가 발생했습니다.",
      );
    }
  }, [error]);

  if (!inquiryId) {
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

  if (error || !inquiry) {
    return (
      <div className="space-y-6">
        <Link href="/admin/inquiries">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>문의를 불러올 수 없습니다</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "문의를 찾을 수 없습니다."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 뒤로가기 버튼 */}
      <Link href="/admin/inquiries">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
      </Link>

      {/* 문의 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2">{inquiry.title}</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span>
                  문의일:{" "}
                  {format(new Date(inquiry.created_at), "yyyy-MM-dd HH:mm", {
                    locale: ko,
                  })}
                </span>
                {inquiry.user_anonymous_code && (
                  <span>도매사업자: {inquiry.user_anonymous_code}</span>
                )}
              </CardDescription>
            </div>
            <InquiryStatusBadge status={inquiry.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700 mb-4">
            {inquiry.content}
          </div>

          {/* 첨부 이미지 */}
          {inquiry.attachment_urls && inquiry.attachment_urls.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-3">첨부 이미지</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {inquiry.attachment_urls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer group"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <Image
                      src={url}
                      alt={`첨부 이미지 ${index + 1}`}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이미지 확대 모달 */}
      {inquiry.attachment_urls && inquiry.attachment_urls.length > 0 && (
        <InquiryImageModal
          images={inquiry.attachment_urls}
          currentIndex={selectedImageIndex}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onNavigate={setSelectedImageIndex}
        />
      )}

      {/* 기존 답변 표시 */}
      {inquiry.admin_reply && (
        <Card>
          <CardHeader>
            <CardTitle>답변</CardTitle>
            <CardDescription>
              {inquiry.replied_at &&
                `답변일: ${format(
                  new Date(inquiry.replied_at),
                  "yyyy-MM-dd HH:mm",
                  { locale: ko },
                )}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-700">
              {inquiry.admin_reply}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 답변 작성 폼 (status가 'open'인 경우만) */}
      {inquiry.status === "open" && (
        <Card>
          <CardHeader>
            <CardTitle>답변 작성</CardTitle>
            <CardDescription>
              문의에 대한 답변을 작성해주세요. 답변 작성 후 상태가
              &quot;답변완료&quot;로 변경됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InquiryReplyForm
              inquiryId={inquiry.id}
              onSuccess={handleReplySuccess}
              apiEndpoint="/api/admin/inquiries/reply"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
