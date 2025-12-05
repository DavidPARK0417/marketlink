/**
 * @file components/admin/CSMessageList.tsx
 * @description CS 대화 이력 표시 컴포넌트
 *
 * CS 스레드의 대화 이력을 채팅형 UI로 표시하는 컴포넌트입니다.
 * 사용자/봇/관리자 메시지를 구분하여 표시합니다.
 *
 * 메시지 타입별 스타일:
 * - 사용자 메시지: 왼쪽 정렬, 파란색 배경
 * - 봇 메시지: 오른쪽 정렬, 회색 배경
 * - 관리자 메시지: 왼쪽 정렬, 초록색 배경
 *
 * @dependencies
 * - types/database.ts (CsMessage, CsMessageSenderType)
 * - date-fns (format)
 */

"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { CsMessage, CsMessageSenderType } from "@/types/database";
import { cn } from "@/lib/utils";

interface CSMessageListProps {
  messages: CsMessage[];
  userEmail?: string; // 사용자 이메일 (사용자 메시지 표시용)
}

/**
 * 메시지 발신자 타입에 따른 스타일 반환
 */
function getMessageStyle(senderType: CsMessageSenderType) {
  switch (senderType) {
    case "user":
      return {
        container: "flex justify-start",
        bubble: "bg-[#10B981] text-white",
        label: "사용자",
      };
    case "bot":
      return {
        container: "flex justify-end",
        bubble: "bg-gray-200 text-gray-900",
        label: "봇",
      };
    case "admin":
      return {
        container: "flex justify-start",
        bubble: "bg-green-500 text-white",
        label: "관리자",
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
function CSMessageItem({
  message,
  userEmail,
}: {
  message: CsMessage;
  userEmail?: string;
}) {
  const style = getMessageStyle(message.sender_type);

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
          <span className="text-xs text-gray-400">{formattedDate}</span>
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
 * CS 메시지 리스트 컴포넌트
 */
export default function CSMessageList({
  messages,
  userEmail,
}: CSMessageListProps) {
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
        <CSMessageItem key={message.id} message={message} userEmail={userEmail} />
      ))}
    </div>
  );
}

