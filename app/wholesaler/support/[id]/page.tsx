/**
 * @file app/wholesaler/support/[id]/page.tsx
 * @description 고객지원 문의 상세 페이지
 *
 * 도매사업자가 관리자에게 보낸 문의의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 문의 상세 정보 표시
 * 2. 대화 히스토리 표시
 * 3. 추가 질문 작성
 * 4. 문의 삭제
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - components/wholesaler/Inquiries/InquiryFollowUpForm.tsx
 * - components/wholesaler/Inquiries/InquiryStatusBadge.tsx
 */

"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import InquiryStatusBadge from "@/components/wholesaler/Inquiries/InquiryStatusBadge";
import InquiryImageModal from "@/components/admin/InquiryImageModal";
import InquiryMessageList from "@/components/wholesaler/Inquiries/InquiryMessageList";
import InquiryFollowUpForm from "@/components/wholesaler/Inquiries/InquiryFollowUpForm";
import InquiryMessageEditForm from "@/components/wholesaler/Inquiries/InquiryMessageEditForm";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { InquiryMessage } from "@/types/database";

// 문의 상세 조회 함수
async function fetchInquiryDetail(inquiryId: string) {
  console.log("🔍 [support-inquiry-detail-page] 문의 상세 조회 요청", { inquiryId });

  const response = await fetch(`/api/wholesaler/inquiries/${inquiryId}`);

  if (!response.ok) {
    let errorMessage = "문의 상세 조회 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [support-inquiry-detail-page] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [support-inquiry-detail-page] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [support-inquiry-detail-page] 문의 상세 조회 성공");
  return data;
}

export default function SupportInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [inquiryId, setInquiryId] = React.useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [editingMessage, setEditingMessage] = React.useState<InquiryMessage | null>(null);
  const [currentProfileId, setCurrentProfileId] = React.useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");
  const [editContent, setEditContent] = React.useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  // 현재 사용자의 profile ID 조회
  React.useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        console.log("⚠️ [support-inquiry-detail-page] user가 없음");
        return;
      }

      try {
        console.log("🔍 [support-inquiry-detail-page] 프로필 조회 시작", {
          clerkUserId: user.id,
        });

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError) {
          console.error("❌ [support-inquiry-detail-page] 프로필 조회 오류:", profileError);
          return;
        }

        if (profile) {
          console.log("✅ [support-inquiry-detail-page] 프로필 조회 성공:", profile.id);
          setCurrentProfileId(profile.id);
        } else {
          console.warn("⚠️ [support-inquiry-detail-page] 프로필 없음");
        }
      } catch (error) {
        console.error("❌ [support-inquiry-detail-page] 프로필 조회 예외:", error);
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

  // 문의 수정 초기값 동기화
  React.useEffect(() => {
    if (inquiry) {
      setEditTitle(inquiry.title ?? "");
      setEditContent(inquiry.content ?? "");
    }
  }, [inquiry]);

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

  // 최초 문의 본문이 메시지 목록에 중복 노출되는 경우 제외
  const filteredMessages = React.useMemo(() => {
    if (!messagesData || !inquiry) return messagesData || [];
    const inquiryContent = (inquiry.content || "").trim();
    const inquiryAuthorId = inquiry.user_id;
    return messagesData.filter((message) => {
      const sameContent = message.content.trim() === inquiryContent;
      const sameAuthor = message.sender_id === inquiryAuthorId;
      const isUserLike =
        message.sender_type === "user" || message.sender_type === "wholesaler";
      if (sameContent && sameAuthor && isUserLike) return false;
      return true;
    });
  }, [messagesData, inquiry]);

  // 답변 작성 성공 핸들러
  const handleReplySuccess = () => {
    // 문의 상세 정보 갱신
    queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
    queryClient.invalidateQueries({ queryKey: ["inquiries-to-admin"] });
    queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });
  };

  // 문의 수정 뮤테이션
  const updateInquiryMutation = useMutation({
    mutationFn: async (payload: { title: string; content: string }) => {
      if (!inquiryId) throw new Error("문의 ID가 없습니다.");
      console.log("✏️ [support-inquiry-detail-page] 문의 수정 요청", {
        inquiryId,
        payload,
      });
      const response = await fetch(`/api/wholesaler/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "문의 수정에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("문의가 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["inquiries-to-admin"] });
      setIsEditDialogOpen(false);
    },
    onError: (err) => {
      console.error("❌ [support-inquiry-detail-page] 문의 수정 오류:", err);
      toast.error(
        err instanceof Error ? err.message : "문의 수정 중 오류가 발생했습니다.",
      );
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (trimmedTitle.length === 0) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (trimmedTitle.length > 120) {
      toast.error("제목은 120자 이하로 입력해주세요.");
      return;
    }
    if (trimmedContent.length < 10) {
      toast.error("내용은 최소 10자 이상 입력해주세요.");
      return;
    }
    if (trimmedContent.length > 5000) {
      toast.error("내용은 최대 5000자까지 입력할 수 있습니다.");
      return;
    }

    updateInquiryMutation.mutate({
      title: trimmedTitle,
      content: trimmedContent,
    });
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
      console.log("🗑️ [support-inquiry-detail-page] 문의글 삭제 요청:", inquiryId);

      const response = await fetch(`/api/wholesaler/inquiries/${inquiryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "문의 삭제 실패");
      }

      console.log("✅ [support-inquiry-detail-page] 문의글 삭제 성공");
      
      // 목록 캐시 무효화하여 삭제된 글이 바로 반영되도록
      queryClient.invalidateQueries({ queryKey: ["inquiries-to-admin"] });
      
      toast.success("문의가 삭제되었습니다.");
      
      // 고객지원 페이지로 이동
      router.push("/wholesaler/support");
    } catch (error) {
      console.error("❌ [support-inquiry-detail-page] 문의글 삭제 오류:", error);
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
      console.log("🗑️ [support-inquiry-detail-page] 메시지 삭제 요청:", message.id);

      const response = await fetch(
        `/api/wholesaler/inquiries/messages/${message.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "메시지 삭제 실패");
      }

      console.log("✅ [support-inquiry-detail-page] 메시지 삭제 성공");
      toast.success("메시지가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
    } catch (error) {
      console.error("❌ [support-inquiry-detail-page] 메시지 삭제 오류:", error);
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
      console.error("❌ [support-inquiry-detail-page] 문의 상세 조회 오류:", error);
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
      <div className="space-y-6 w-full max-w-full">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  // 고객지원 페이지로 돌아가기
  const backPath = "/wholesaler/support";

  if (error || !inquiry) {
    return (
      <div className="space-y-6 w-full max-w-full">
        <Link href={backPath}>
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

  // 도매→관리자 문의가 아니면 에러
  if (inquiry.inquiry_type !== "wholesaler_to_admin") {
    return (
      <div className="space-y-6 w-full max-w-full">
        <Link href={backPath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>잘못된 문의 유형</CardTitle>
            <CardDescription>
              이 문의는 고객지원 페이지에서 조회할 수 없습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* 뒤로가기 버튼 */}
      <Link href={backPath}>
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
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <InquiryStatusBadge status={inquiry.status} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="text-sm"
              >
                <Pencil className="mr-2 h-4 w-4" />
                수정
              </Button>
              {/* 도매→관리자 문의인 경우에만 삭제 버튼 표시 */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteInquiry}
                className="ml-2"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">
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

      {/* 대화 이력 */}
      <Card>
        <CardHeader>
          <CardTitle>대화 이력</CardTitle>
          <CardDescription>
            {isMessagesLoading
              ? "로딩 중..."
              : `총 ${filteredMessages?.length ?? 0}개의 메시지`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isMessagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          ) : (
            <InquiryMessageList
              messages={filteredMessages || []}
              userEmail={undefined}
              currentUserId={currentProfileId || undefined}
              onEdit={(message) => {
                console.log("✏️ [support-inquiry-detail-page] 수정 버튼 클릭:", {
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

      {/* 추가 질문 폼 (도매→관리자 문의인 경우) */}
      {inquiry.inquiry_type === "wholesaler_to_admin" &&
        inquiry.status !== "closed" && (
          <Card>
            <CardHeader>
              <CardTitle>추가 질문 작성</CardTitle>
              <CardDescription>
                추가 문의가 있다면 자유롭게 남겨주세요. 관리자 확인 후 안내해드릴게요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InquiryFollowUpForm
                inquiryId={inquiry.id}
                onSuccess={handleReplySuccess}
                apiEndpoint={`/api/wholesaler/inquiries/${inquiry.id}/follow-up`}
              />
            </CardContent>
          </Card>
        )}

      {/* 이미 답변 완료된 경우 안내 */}
      {inquiry.status === "answered" && (
        <Card>
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

      {/* 메시지 수정 폼 */}
      <InquiryMessageEditForm
        message={editingMessage}
        isOpen={editingMessage !== null}
        onClose={() => setEditingMessage(null)}
        apiEndpoint="/api/wholesaler/inquiries/messages"
        inquiryId={inquiry.id}
      />

      {/* 문의 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>문의 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">제목</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={120}
                placeholder="제목을 입력해주세요"
              />
              <p className="text-xs text-muted-foreground">{editTitle.length} / 120자</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">내용</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                maxLength={5000}
                placeholder="내용을 입력해주세요 (최소 10자)"
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{editContent.length} / 5000자</p>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateInquiryMutation.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={updateInquiryMutation.isPending}>
                {updateInquiryMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

