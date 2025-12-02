/**
 * @file components/admin/CloseInquiryButton.tsx
 * @description 문의 종료 버튼 컴포넌트
 *
 * 관리자 또는 도매사업자가 문의를 종료하는 버튼 컴포넌트입니다.
 * Client Component로 구현하여 확인 다이얼로그를 표시합니다.
 *
 * @dependencies
 * - components/ui/button.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CloseInquiryButtonProps {
  inquiryId: string;
  currentStatus: string;
  apiEndpoint: string; // "/api/admin/inquiries/close" 또는 "/api/wholesaler/inquiries/close"
  onSuccess?: () => void;
}

export default function CloseInquiryButton({
  inquiryId,
  currentStatus,
  apiEndpoint,
  onSuccess,
}: CloseInquiryButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentStatus === "closed") {
    return null;
  }

  const handleClose = async () => {
    if (!confirm("정말 문의를 종료하시겠습니까?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("🔒 [close-inquiry-button] 문의 종료 요청:", inquiryId);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id: inquiryId }),
      });

      if (!response.ok) {
        let errorMessage = "문의 종료 실패";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("❌ [close-inquiry-button] API 에러 응답:", errorData);
        } catch (e) {
          console.error("❌ [close-inquiry-button] 에러 응답 파싱 실패:", e);
        }

        throw new Error(errorMessage);
      }

      console.log("✅ [close-inquiry-button] 문의 종료 성공");
      toast.success("문의가 종료되었습니다.");

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh(); // 페이지 새로고침
      }
    } catch (error) {
      console.error("❌ [close-inquiry-button] 문의 종료 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "문의 종료 중 오류가 발생했습니다.",
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
      {isSubmitting ? "종료 중..." : "문의 종료"}
    </Button>
  );
}

