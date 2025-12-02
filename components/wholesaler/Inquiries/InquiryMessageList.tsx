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
  currentUserId?: string; // 현재 사용자 ID (수정 권한 확인용)
  onEdit?: (message: InquiryMessage) => void; // 수정 핸들러
  onDelete?: (message: InquiryMessage) => void; // 삭제 핸들러
}

/**
 * 메시지 발신자 타입에 따른 스타일 반환
 */
function getMessageStyle(senderType: InquiryMessageSenderType) {
  switch (senderType) {
    case "user":
      return {
        container: "flex justify-start",
        bubble: "bg-blue-500 text-white",
        label: "문의자",
      };
    case "admin":
      return {
        container: "flex justify-start",
        bubble: "bg-green-500 text-white",
        label: "관리자",
      };
    case "wholesaler":
      return {
        container: "flex justify-start",
        bubble: "bg-purple-500 text-white",
        label: "도매사업자",
      };
    default:
      return {
        container: "flex justify-start",
        bubble: "bg-gray-100 text-gray-900",
        label: "알 수 없음",
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
  onEdit,
  onDelete,
}: {
  message: InquiryMessage;
  userEmail?: string;
  currentUserId?: string;
  onEdit?: (message: InquiryMessage) => void;
  onDelete?: (message: InquiryMessage) => void;
}) {
  const style = getMessageStyle(message.sender_type);
  const canEdit = message.sender_id === currentUserId; // 자신이 작성한 메시지만 수정 가능
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
    });
  }

  // 날짜 포맷팅 (2025-01-15 14:30 형식)
  const formattedDate = format(new Date(message.created_at), "yyyy-MM-dd HH:mm", {
    locale: ko,
  });

  return (
    <div className={cn("w-full", style.container)}>
      <div className="max-w-[80%] md:max-w-[70%] space-y-1">
        {/* 발신자 라벨 */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs font-medium text-gray-600">
            {style.label}
            {message.sender_type === "user" && userEmail && (
              <span className="ml-1 text-gray-500">({userEmail})</span>
            )}
          </span>
          <span className="text-xs text-gray-400">
            {formattedDate}
            {isEdited && (
              <span className="ml-1 text-gray-400">(수정됨)</span>
            )}
          </span>
          {canEdit && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onEdit(message)}
                >
                  수정
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(message)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 메시지 버블 */}
        <div
          className={cn(
            "rounded-lg px-4 py-2.5 shadow-sm",
            style.bubble,
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
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
  onEdit,
  onDelete,
}: InquiryMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">대화 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {messages.map((message) => (
        <InquiryMessageItem
          key={message.id}
          message={message}
          userEmail={userEmail}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

