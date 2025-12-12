/**
 * @file app/wholesaler/inquiries/[id]/page.tsx
 * @description 문의 상세 페이지
 *
 * 문의 상세 정보를 표시하고 답변을 작성할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. 문의 상세 정보 표시
 * 2. 문의자 익명 코드 표시 (실명/연락처 노출 금지)
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
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
import InquiryMessageList from "@/components/wholesaler/Inquiries/InquiryMessageList";
import InquiryFollowUpForm from "@/components/wholesaler/Inquiries/InquiryFollowUpForm";
import InquiryMessageEditForm from "@/components/wholesaler/Inquiries/InquiryMessageEditForm";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { InquiryMessage } from "@/types/database";

// 문의 상세 조회 함수
async function fetchInquiryDetail(inquiryId: string) {
  console.log("🔍 [inquiry-detail-page] 문의 상세 조회 요청", { inquiryId });

  const response = await fetch(`/api/wholesaler/inquiries/${inquiryId}`);

  if (!response.ok) {
    let errorMessage = "문의 상세 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [inquiry-detail-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [inquiry-detail-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [inquiry-detail-page] 문의 상세 조회 성공");
  return data;
}

export default function InquiryDetailPage({
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  // URL 쿼리 파라미터에서 문의 타입 확인
  const inquiryTypeFromUrl = React.useMemo(() => {
    const type = searchParams.get("type");
    if (type) {
      console.log("🔍 [inquiry-detail-page] URL에서 문의 타입 확인:", type);
    }
    return type;
  }, [searchParams]);

  // 현재 사용자의 profile ID 조회
  React.useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        console.log("⚠️ [inquiry-detail-page] user가 없음");
        return;
      }

      try {
        console.log("🔍 [inquiry-detail-page] 프로필 조회 시작", {
          clerkUserId: user.id,
        });

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError) {
          console.error("❌ [inquiry-detail-page] 프로필 조회 오류:", profileError);
          return;
        }

        if (profile) {
          console.log("✅ [inquiry-detail-page] 프로필 조회 성공:", profile.id);
          setCurrentProfileId(profile.id);
        } else {
          console.warn("⚠️ [inquiry-detail-page] 프로필 없음");
        }
      } catch (error) {
        console.error("❌ [inquiry-detail-page] 프로필 조회 예외:", error);
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
    queryKey: ["inquiry", inquiryId],
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
      const response = await fetch(`/api/wholesaler/inquiries/${inquiryId}/messages`);
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
    queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
    queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });
  };

  // 문의글 삭제 핸들러
  const handleDeleteInquiry = async () => {
    if (
      !confirm(
        "정말 이 문의를 삭제하시겠습니까?\n삭제된 문의는 복구할 수 없으며, 관련 메시지와 첨부파일도 함께 삭제됩니다.",
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ [inquiry-detail-page] 문의글 삭제 요청:", inquiryId);

      const response = await fetch(`/api/wholesaler/inquiries/${inquiryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "문의 삭제 실패");
      }

      console.log("✅ [inquiry-detail-page] 문의글 삭제 성공");
      
      // 목록 캐시 무효화하여 삭제된 글이 바로 반영되도록
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["inquiries-to-admin"] });
      
      toast.success("문의가 삭제되었습니다.");
      
      // 목록 페이지로 이동 (도매→관리자 문의는 support 페이지로)
      const redirectPath = inquiry?.inquiry_type === "wholesaler_to_admin"
        ? "/wholesaler/support"
        : "/wholesaler/inquiries";
      router.push(redirectPath);
    } catch (error) {
      console.error("❌ [inquiry-detail-page] 문의글 삭제 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "문의 삭제 중 오류가 발생했습니다.",
      );
    }
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
      console.log("🗑️ [inquiry-detail-page] 메시지 삭제 요청:", message.id);

      const response = await fetch(
        `/api/wholesaler/inquiries/messages/${message.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "메시지 삭제 실패");
      }

      console.log("✅ [inquiry-detail-page] 메시지 삭제 성공");
      toast.success("메시지가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
    } catch (error) {
      console.error("❌ [inquiry-detail-page] 메시지 삭제 오류:", error);
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
      console.error("❌ [inquiry-detail-page] 문의 상세 조회 오류:", error);
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

  // 문의 타입에 따른 목록 페이지 경로 결정
  // URL 쿼리 파라미터 우선, 없으면 inquiry 객체에서 확인
  const backPath = inquiryTypeFromUrl === "wholesaler_to_admin" || inquiry?.inquiry_type === "wholesaler_to_admin"
    ? "/wholesaler/support"
    : "/wholesaler/inquiries";

  if (error || !inquiry) {
    // 에러 상태에서도 URL 파라미터로 경로 결정
    const errorBackPath = inquiryTypeFromUrl === "wholesaler_to_admin"
      ? "/wholesaler/support"
      : "/wholesaler/inquiries";
    
    return (
      <div className="space-y-6">
        <Link href={errorBackPath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <Card className="w-full max-w-full">
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
    <div className="w-full max-w-full space-y-6">
      {/* 뒤로가기 버튼 */}
      <Link href={backPath}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
      </Link>

      {/* 문의 정보 */}
      <Card className="w-full max-w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="mb-2 break-words">{inquiry.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-4 break-words">
                <span>
                  문의일:{" "}
                  {format(new Date(inquiry.created_at), "yyyy-MM-dd HH:mm", {
                    locale: ko,
                  })}
                </span>
                {inquiry.user_anonymous_code && (
                  <span>문의자: {inquiry.user_anonymous_code}</span>
                )}
                {inquiry.order && (
                  <span>주문번호: {inquiry.order.order_number}</span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <InquiryStatusBadge status={inquiry.status} />
              {/* 도매→관리자 문의인 경우에만 삭제 버튼 표시 */}
              {inquiry.inquiry_type === "wholesaler_to_admin" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteInquiry}
                  className="ml-2"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-100 mb-4 w-full max-w-full overflow-x-hidden">
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

      {/* 관련 상품 정보 (소매→도매 문의이고 product_id가 있는 경우) */}
      {inquiry.inquiry_type === "retailer_to_wholesaler" &&
        inquiry.product_id &&
        inquiry.product && (
          <Card className="w-full max-w-full">
            <CardHeader>
              <CardTitle>관련 상품</CardTitle>
              <CardDescription>
                이 문의는 아래 상품에 대한 문의입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {inquiry.product.image_urls &&
                  inquiry.product.image_urls.length > 0 && (
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border">
                      <Image
                        src={inquiry.product.image_urls[0]}
                        alt={inquiry.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                    {inquiry.product.name}
                  </p>
                  <Link
                    href={`/wholesaler/products/${inquiry.product_id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                  >
                    상품 상세보기 →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* 대화 이력 */}
      <Card className="w-full max-w-full">
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
                console.log("✏️ [inquiry-detail-page] 수정 버튼 클릭:", {
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

      {/* 답변 작성 폼 (소매→도매 문의인 경우, status가 'open'인 경우만) */}
      {inquiry.inquiry_type === "retailer_to_wholesaler" &&
        inquiry.status === "open" && (
          <Card className="w-full max-w-full">
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
              />
            </CardContent>
          </Card>
        )}

      {/* 추가 질문 폼 (도매→관리자 문의인 경우, 답변이 완료된 경우) */}
      {inquiry.inquiry_type === "wholesaler_to_admin" &&
        inquiry.status !== "closed" && (
          <Card className="w-full max-w-full">
            <CardHeader>
              <CardTitle>
                {inquiry.status === "open"
                  ? "답변 대기 중"
                  : "추가 질문 작성"}
              </CardTitle>
              <CardDescription>
                {inquiry.status === "open"
                  ? "관리자의 답변을 기다리고 있습니다."
                  : "답변을 받으셨다면 추가로 궁금한 점이 있으시면 질문해주세요."}
              </CardDescription>
            </CardHeader>
            {inquiry.status !== "open" && (
              <CardContent>
                <InquiryFollowUpForm
                  inquiryId={inquiry.id}
                  onSuccess={handleReplySuccess}
                  apiEndpoint={`/api/wholesaler/inquiries/${inquiry.id}/follow-up`}
                />
              </CardContent>
            )}
          </Card>
        )}

      {/* 이미 답변 완료된 경우 안내 */}
      {inquiry.status === "answered" && (
        <Card className="w-full max-w-full">
          <CardContent className="pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                답변이 완료되었습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이미 종료된 경우 안내 */}
      {inquiry.status === "closed" && (
        <Card className="w-full max-w-full">
          <CardContent className="pt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-800">
                이 문의는 종료되었습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 메시지 수정 폼 */}
      <InquiryMessageEditForm
        message={editingMessage}
        isOpen={editingMessage !== null}
        onClose={() => setEditingMessage(null)}
        apiEndpoint="/api/wholesaler/inquiries/messages"
        inquiryId={inquiry.id}
      />
    </div>
  );
}
