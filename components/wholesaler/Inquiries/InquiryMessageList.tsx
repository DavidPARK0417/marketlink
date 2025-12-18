/**
 * @file components/wholesaler/Inquiries/InquiryMessageList.tsx
 * @description 문의 대화 이력 표시 컴포넌트
 *
 * 문의의 대화 이력을 채팅형 UI로 표시하는 컴포넌트입니다.
 * 문의자/관리자/도매사업자 메시지를 구분하여 표시합니다.
 *
 * 메시지 타입별 스타일:
 * - 사용자 메시지: 왼쪽 정렬, 파란색 배경
 * - 관리자 메시지: 왼쪽 정렬, 초록색 배경
 * - 도매사업자 메시지: 왼쪽 정렬, 보라색 배경
 *
 * @dependencies
 * - types/database.ts (InquiryMessage, InquiryMessageSenderType)
 * - date-fns (format)
 */

"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import type {
  InquiryMessage,
  InquiryMessageSenderType,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InquiryMessageListProps {
  messages: InquiryMessage[];
  userEmail?: string; // 사용자 이메일 (사용자 메시지 표시용)
  currentUserId?: string; // 현재 사용자 ID (수정 권한 확인용 및 방향 결정용)
  viewerRole?: "wholesaler" | "admin"; // 뷰어 관점에 따른 기본 정렬
  onEdit?: (message: InquiryMessage) => void; // 수정 핸들러
  onDelete?: (message: InquiryMessage) => void; // 삭제 핸들러
}

/**
 * 메시지 발신자 타입에 따른 스타일 반환
 */
function getMessageStyle(senderType: InquiryMessageSenderType, isSelf: boolean) {
  const container = isSelf ? "flex justify-end" : "flex justify-start";

  switch (senderType) {
    case "user":
      return {
        container,
        bubble: "bg-[#10B981] text-white", // 그린색
        label: "문의자",
        isSelf,
      };
    case "admin":
      return {
        container,
        bubble: "bg-[#3B82F6] text-white", // 블루색
        label: "관리자",
        isSelf,
      };
    case "wholesaler":
      return {
        container,
        bubble: "bg-[#10B981] text-white", // 그린색
        label: "도매사업자",
        isSelf,
      };
    default:
      return {
        container,
        bubble: "bg-gray-100 text-gray-900",
        label: "알 수 없음",
        isSelf,
      };
  }
}

/**
 * 메시지 컴포넌트
 */
function InquiryMessageItem({
  message,
  userEmail,
  currentUserId,
  viewerRole = "wholesaler",
  onEdit,
  onDelete,
}: {
  message: InquiryMessage;
  userEmail?: string;
  currentUserId?: string;
  viewerRole?: "wholesaler" | "admin";
  onEdit?: (message: InquiryMessage) => void;
  onDelete?: (message: InquiryMessage) => void;
}) {
  // sender_id가 비어 있으면 관측자(viewerRole) 기준으로 정렬
  const isCurrentUser =
    currentUserId && message.sender_id
      ? message.sender_id === currentUserId
      : undefined;
  const fallbackIsSelf =
    viewerRole === "admin"
      ? message.sender_type === "admin"
      : message.sender_type !== "admin";
  const isSelf = isCurrentUser ?? fallbackIsSelf;

  const style = getMessageStyle(message.sender_type, isSelf);
  const canEdit =
    !!message.sender_id && !!currentUserId && message.sender_id === currentUserId; // sender_id 없으면 수정 불가
  const isEdited = message.edited_at !== null; // 수정된 메시지 표시

  // 디버깅 로그 (개발 환경에서만)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("🔍 [InquiryMessageItem] 수정 버튼 체크:", {
      messageId: message.id,
      sender_type: message.sender_type,
      sender_id: message.sender_id,
      currentUserId: currentUserId,
      canEdit: canEdit,
      hasOnEdit: !!onEdit,
      isEdited: isEdited,
      isSelf: isSelf,
      viewerRole: viewerRole,
    });
  }

  // 날짜 포맷팅 (2025-01-15 14:30 형식)
  const formattedDate = format(new Date(message.created_at), "yyyy-MM-dd HH:mm", {
    locale: ko,
  });

  const isLeft = !style.isSelf;
  
  return (
    <div className={cn("w-full", style.container)}>
      <div className={cn(
        "w-full max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] space-y-2 md:space-y-2.5",
        isLeft ? "items-start" : "items-end"
      )}>
        {/* 발신자 라벨 */}
        <div className={cn(
          "flex items-center gap-1.5 md:gap-2 px-1 md:px-2",
          isLeft ? "justify-start" : "justify-end"
        )}>
          {isLeft && (
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
              {style.label}
            </span>
          )}
          <span className="text-xs md:text-sm text-gray-400 dark:text-gray-500">
            {formattedDate}
            {isEdited && (
              <span className="ml-1">(수정됨)</span>
            )}
          </span>
          {!isLeft && (
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
              {style.label}
            </span>
          )}
          {canEdit && (
            <div className="flex gap-1 md:gap-1.5">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 md:h-8 px-2 md:px-2.5 text-xs md:text-sm"
                  onClick={() => onEdit(message)}
                >
                  수정
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 md:h-8 px-2 md:px-2.5 text-xs md:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  onClick={() => onDelete(message)}
                >
                  <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 메시지 버블 */}
        <div
          className={cn(
            "rounded-lg px-4 md:px-5 py-3 md:py-3.5 shadow-sm",
            style.bubble,
          )}
        >
          <p className="text-sm md:text-base lg:text-base whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 문의 메시지 리스트 컴포넌트
 */
export default function InquiryMessageList({
  messages,
  userEmail,
  currentUserId,
  viewerRole = "wholesaler",
  onEdit,
  onDelete,
}: InquiryMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 md:py-12 text-gray-500 dark:text-gray-400">
        <p className="text-xs md:text-sm">대화 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-4 md:p-5 lg:p-6 w-full max-w-full overflow-x-hidden">
      {messages.map((message) => (
        <InquiryMessageItem
          key={message.id}
          message={message}
          userEmail={userEmail}
          currentUserId={currentUserId}
          viewerRole={viewerRole}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

