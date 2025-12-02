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
import CloseInquiryButton from "@/components/admin/CloseInquiryButton";
import InquiryMessageList from "@/components/wholesaler/Inquiries/InquiryMessageList";
import InquiryFollowUpForm from "@/components/wholesaler/Inquiries/InquiryFollowUpForm";
import InquiryMessageEditForm from "@/components/wholesaler/Inquiries/InquiryMessageEditForm";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { InquiryMessage } from "@/types/database";

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
  const [editingMessage, setEditingMessage] = React.useState<InquiryMessage | null>(null);
  const [currentProfileId, setCurrentProfileId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  // 현재 사용자의 profile ID 조회
  React.useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        console.log("⚠️ [admin-inquiry-detail-page] user가 없음");
        return;
      }

      try {
        console.log("🔍 [admin-inquiry-detail-page] 프로필 조회 시작", {
          clerkUserId: user.id,
        });

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError) {
          console.error("❌ [admin-inquiry-detail-page] 프로필 조회 오류:", profileError);
          return;
        }

        if (profile) {
          console.log("✅ [admin-inquiry-detail-page] 프로필 조회 성공:", profile.id);
          setCurrentProfileId(profile.id);
        } else {
          console.warn("⚠️ [admin-inquiry-detail-page] 프로필 없음");
        }
      } catch (error) {
        console.error("❌ [admin-inquiry-detail-page] 프로필 조회 예외:", error);
      }
    };

    fetchProfileId();
  }, [user, supabase]);

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

  // 대화 히스토리 조회
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
  } = useQuery({
    queryKey: ["inquiry-messages", inquiryId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/messages`);
      if (!response.ok) {
        throw new Error("대화 히스토리를 불러올 수 없습니다.");
      }
      const data = await response.json();
      return data.messages as InquiryMessage[];
    },
    enabled: !!inquiryId,
    staleTime: 10 * 1000, // 10초
  });

  // 답변 작성 성공 핸들러
  const handleReplySuccess = () => {
    // 문의 상세 정보 갱신
    queryClient.invalidateQueries({ queryKey: ["admin-inquiry", inquiryId] });
    queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });
  };

  // 메시지 삭제 핸들러
  const handleDeleteMessage = async (message: InquiryMessage) => {
    if (
      !confirm(
        "정말 이 메시지를 삭제하시겠습니까?\n삭제된 메시지는 복구할 수 없습니다.",
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ [admin-inquiry-detail-page] 메시지 삭제 요청:", message.id);

      const response = await fetch(
        `/api/admin/inquiries/messages/${message.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "메시지 삭제 실패");
      }

      console.log("✅ [admin-inquiry-detail-page] 메시지 삭제 성공");
      toast.success("메시지가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["admin-inquiry", inquiryId] });
    } catch (error) {
      console.error("❌ [admin-inquiry-detail-page] 메시지 삭제 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "메시지 삭제 중 오류가 발생했습니다.",
      );
    }
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

      {/* 대화 이력 */}
      <Card>
        <CardHeader>
          <CardTitle>대화 이력</CardTitle>
          <CardDescription>
            {isMessagesLoading
              ? "로딩 중..."
              : `총 ${messagesData?.length ?? 0}개의 메시지`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isMessagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          ) : (
            <InquiryMessageList
              messages={messagesData || []}
              userEmail={inquiry.user_anonymous_code || undefined}
              currentUserId={currentProfileId || undefined}
              onEdit={(message) => {
                console.log("✏️ [admin-inquiry-detail-page] 수정 버튼 클릭:", {
                  messageId: message.id,
                  sender_id: message.sender_id,
                  currentProfileId: currentProfileId,
                });
                setEditingMessage(message);
              }}
              onDelete={handleDeleteMessage}
            />
          )}
        </CardContent>
      </Card>

      {/* 답변 작성 폼 (status가 'open'인 경우 또는 추가 답변) */}
      {inquiry.status !== "closed" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {inquiry.status === "open" ? "답변 작성" : "추가 답변 작성"}
            </CardTitle>
            <CardDescription>
              {inquiry.status === "open"
                ? "문의에 대한 답변을 작성해주세요. 답변 작성 후 상태가 &quot;답변완료&quot;로 변경됩니다."
                : "추가 답변이 필요한 경우 작성해주세요."}
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

      {/* 문의 종료 버튼 (답변 완료된 경우 또는 답변 불가능한 경우) */}
      {inquiry.status !== "open" && inquiry.status !== "closed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <CloseInquiryButton
                inquiryId={inquiry.id}
                currentStatus={inquiry.status}
                apiEndpoint="/api/admin/inquiries/close"
                onSuccess={handleReplySuccess}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이미 답변 완료된 경우 안내 */}
      {inquiry.status === "answered" && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                답변이 완료되었습니다. 필요시 문의를 종료할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이미 종료된 경우 안내 */}
      {inquiry.status === "closed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-800">
                이 문의는 종료되었습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
