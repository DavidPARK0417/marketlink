/**
 * @file components/admin/CloseThreadButton.tsx
 * @description CS 티켓 종료 버튼 컴포넌트
 *
 * 관리자가 CS 티켓을 종료하는 버튼 컴포넌트입니다.
 * Client Component로 구현하여 확인 다이얼로그를 표시합니다.
 *
 * @dependencies
 * - actions/admin/cs-reply.ts (closeCSThread)
 * - components/ui/button.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { closeCSThread } from "@/actions/admin/cs-reply";

interface CloseThreadButtonProps {
  threadId: string;
  currentStatus: string;
}

export default function CloseThreadButton({
  threadId,
  currentStatus,
}: CloseThreadButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentStatus === "closed") {
    return null;
  }

  const handleClose = async () => {
    if (!confirm("정말 티켓을 종료하시겠습니까?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("🔒 [close-thread-button] 티켓 종료 요청:", threadId);

      await closeCSThread(threadId);

      console.log("✅ [close-thread-button] 티켓 종료 성공");
      toast.success("티켓이 종료되었습니다.");
      router.refresh(); // 페이지 새로고침
    } catch (error) {
      console.error("❌ [close-thread-button] 티켓 종료 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "티켓 종료 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleClose}
      disabled={isSubmitting}
      variant="outline"
      className="border-red-300 text-red-700 hover:bg-red-50"
    >
      {isSubmitting ? "종료 중..." : "티켓 종료"}
    </Button>
  );
}

