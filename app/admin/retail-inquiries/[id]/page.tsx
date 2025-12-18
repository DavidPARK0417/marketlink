/**
 * @file app/admin/retail-inquiries/[id]/page.tsx
 * @description 관리자용 소매 문의 상세/답변 페이지
 *
 * 관리자 권한으로 소매→관리자 문의의 상세 정보와 대화 이력을 확인하고
 * 답변을 작성할 수 있습니다. 도매 문의 상세와 동일한 UX를 유지합니다.
 *
 * 주요 기능:
 * 1. 문의 상세 표시(제목, 내용, 첨부 이미지, 생성일)
 * 2. 대화 이력 조회 및 메시지 삭제/수정
 * 3. 답변 작성(상태 업데이트 포함)
 * 4. 반응형 레이아웃 및 다크모드 색상 쌍 적용
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
import { useUser } from "@clerk/nextjs";

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
import InquiryMessageList from "@/components/wholesaler/Inquiries/InquiryMessageList";
import InquiryMessageEditForm from "@/components/wholesaler/Inquiries/InquiryMessageEditForm";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { InquiryMessage } from "@/types/database";

// 문의 상세 조회
async function fetchRetailInquiryDetail(inquiryId: string) {
  console.log("🔍 [admin-retail-inquiry-detail-page] 문의 상세 조회 요청", {
    inquiryId,
  });

  const response = await fetch(`/api/admin/retail-inquiries/${inquiryId}`);
  if (!response.ok) {
    let errorMessage = "문의 상세 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error(
        "❌ [admin-retail-inquiry-detail-page] API 에러 응답:",
        errorData,
      );
    } catch (e) {
      console.error(
        "❌ [admin-retail-inquiry-detail-page] 에러 응답 파싱 실패:",
        e,
      );
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [admin-retail-inquiry-detail-page] 문의 상세 조회 성공");
  return data;
}

// 대화 이력 조회
async function fetchRetailInquiryMessages(inquiryId: string) {
  console.log("🔍 [admin-retail-inquiry-detail-page] 대화 이력 조회 요청", {
    inquiryId,
  });

  const response = await fetch(
    `/api/admin/retail-inquiries/${inquiryId}/messages`,
  );
  if (!response.ok) {
    throw new Error("대화 이력을 불러올 수 없습니다.");
  }
  const data = await response.json();
  return data.messages as InquiryMessage[];
}

export default function AdminRetailInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [inquiryId, setInquiryId] = React.useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [editingMessage, setEditingMessage] = React.useState<InquiryMessage | null>(
    null,
  );
  const [currentProfileId, setCurrentProfileId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  // 현재 사용자의 profile ID 조회 (메시지 작성/표시에 사용)
  React.useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        console.log("⚠️ [admin-retail-inquiry-detail-page] user가 없음");
        return;
      }

      try {
        console.log("🔍 [admin-retail-inquiry-detail-page] 프로필 조회 시작", {
          clerkUserId: user.id,
        });

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError) {
          console.error(
            "❌ [admin-retail-inquiry-detail-page] 프로필 조회 오류:",
            profileError,
          );
          return;
        }

        if (profile) {
          console.log(
            "✅ [admin-retail-inquiry-detail-page] 프로필 조회 성공:",
            profile.id,
          );
          setCurrentProfileId(profile.id);
        } else {
          console.warn("⚠️ [admin-retail-inquiry-detail-page] 프로필 없음");
        }
      } catch (error) {
        console.error(
          "❌ [admin-retail-inquiry-detail-page] 프로필 조회 예외:",
          error,
        );
      }
    };

    fetchProfileId();
  }, [user, supabase]);

  // params Promise 처리
  React.useEffect(() => {
    params.then((p) => setInquiryId(p.id));
  }, [params]);

  // 문의 상세 조회
  const {
    data: inquiry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-retail-inquiry", inquiryId],
    queryFn: () => fetchRetailInquiryDetail(inquiryId!),
    enabled: !!inquiryId,
    staleTime: 30 * 1000,
  });

  // 대화 이력 조회
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
  } = useQuery({
    queryKey: ["admin-retail-inquiry-messages", inquiryId],
    queryFn: () => fetchRetailInquiryMessages(inquiryId!),
    enabled: !!inquiryId,
    staleTime: 10 * 1000,
  });

  // 답변 작성 성공 시 refetch
  const handleReplySuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-retail-inquiry", inquiryId] });
    queryClient.invalidateQueries({ queryKey: ["admin-retail-inquiry-messages", inquiryId] });
    queryClient.invalidateQueries({ queryKey: ["admin-retail-inquiries"] });
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
      console.log(
        "🗑️ [admin-retail-inquiry-detail-page] 메시지 삭제 요청:",
        message.id,
      );

      const response = await fetch(`/api/admin/inquiries/messages/${message.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "메시지 삭제 실패");
      }

      console.log("✅ [admin-retail-inquiry-detail-page] 메시지 삭제 성공");
      toast.success("메시지가 삭제되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ["admin-retail-inquiry-messages", inquiryId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-retail-inquiry", inquiryId] });
    } catch (err) {
      console.error("❌ [admin-retail-inquiry-detail-page] 메시지 삭제 오류:", err);
      toast.error(
        err instanceof Error ? err.message : "메시지 삭제 중 오류가 발생했습니다.",
      );
    }
  };

  React.useEffect(() => {
    if (error) {
      console.error(
        "❌ [admin-retail-inquiry-detail-page] 문의 상세 조회 오류:",
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
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="text-center">
          <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-3 md:mb-4" />
          <p className="text-xs md:text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
        <div className="h-6 md:h-8 w-32 md:w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-48 md:h-64 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
        <Link href="/admin/retail-inquiries">
          <Button variant="ghost" size="sm" className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm">
            <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            목록으로
          </Button>
        </Link>
        <Card className="w-full max-w-full">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">문의를 불러올 수 없습니다</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {error instanceof Error ? error.message : "문의를 찾을 수 없습니다."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
      {/* 뒤로가기 */}
      <Link href="/admin/retail-inquiries">
        <Button variant="ghost" size="sm" className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm">
          <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          목록으로
        </Button>
      </Link>

      {/* 문의 정보 */}
      <Card className="w-full max-w-full">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="mb-2 md:mb-3 text-lg md:text-xl lg:text-2xl break-words">
                {inquiry.title}
              </CardTitle>
              <CardDescription className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 md:gap-4 text-xs md:text-sm break-words">
                {inquiry.retailer_business_name && (
                  <span>문의자명: {inquiry.retailer_business_name}</span>
                )}
                {inquiry.retailer_phone && (
                  <span className="break-all">연락처: {inquiry.retailer_phone}</span>
                )}
                {inquiry.user_anonymous_code && (
                  <span className="break-all">소매사업자 코드: {inquiry.user_anonymous_code}</span>
                )}
                <span>
                  문의일:{" "}
                  {format(new Date(inquiry.created_at), "yyyy-MM-dd HH:mm", {
                    locale: ko,
                  })}
                </span>
              </CardDescription>
            </div>
            <div className="shrink-0">
              <InquiryStatusBadge status={inquiry.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="whitespace-pre-wrap break-words text-xs md:text-sm lg:text-base text-gray-800 dark:text-gray-100 mb-3 md:mb-4 w-full max-w-full overflow-x-hidden">
            {inquiry.content}
          </div>

          {/* 첨부 이미지 */}
          {inquiry.attachment_urls && inquiry.attachment_urls.length > 0 && (
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t">
              <h3 className="text-xs md:text-sm font-medium mb-2 md:mb-3">첨부 이미지</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                {inquiry.attachment_urls.map((url: string, index: number) => (
                  <div
                    key={url}
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
                        <Download className="h-5 w-5 md:h-6 md:w-6 text-white" />
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
      <Card className="w-full max-w-full">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">대화 이력</CardTitle>
          <CardDescription className="text-xs md:text-sm">
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
              userEmail={undefined}
              currentUserId={currentProfileId || undefined}
              viewerRole="admin"
              onEdit={(message) => {
                console.log("✏️ [admin-retail-inquiry-detail-page] 수정 버튼 클릭:", {
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

      {/* 메시지 수정 폼 */}
      {editingMessage && inquiryId && (
        <InquiryMessageEditForm
          message={editingMessage}
          isOpen={editingMessage !== null}
          onClose={() => setEditingMessage(null)}
          apiEndpoint="/api/admin/inquiries/messages"
          inquiryId={inquiryId}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["admin-retail-inquiry-messages", inquiryId],
            });
            queryClient.invalidateQueries({
              queryKey: ["admin-retail-inquiry", inquiryId],
            });
          }}
        />
      )}

      {/* 추가 질문/답변 입력 */}
      {inquiry.status !== "closed" && (
        <Card className="w-full max-w-full">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">
              {inquiry.status === "open" ? "답변 작성" : "추가 답변 작성"}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {inquiry.status === "open"
                ? "문의에 대한 답변을 작성해주세요. 답변 작성 후 상태가 \"답변완료\"로 변경됩니다."
                : "추가 답변이 필요한 경우 작성해주세요."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <InquiryReplyForm
              inquiryId={inquiry.id}
              onSuccess={handleReplySuccess}
              apiEndpoint="/api/admin/inquiries/reply"
            />
          </CardContent>
        </Card>
      )}

      {/* 답변 완료 안내 */}
      {inquiry.status === "answered" && (
        <Card className="w-full max-w-full">
          <CardContent className="p-4 md:p-6">
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-3 md:p-4 transition-colors duration-200">
              <p className="text-xs md:text-sm text-green-800 dark:text-green-100">
                답변이 완료되었습니다. 추가 안내가 필요하면 메시지를 남겨주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


