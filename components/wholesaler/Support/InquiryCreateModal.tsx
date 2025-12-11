/**
 * @file components/wholesaler/Support/InquiryCreateModal.tsx
 * @description 문의 작성 모달 컴포넌트
 *
 * 문의 작성을 위한 모달 다이얼로그입니다.
 * InquiryCreateForm을 모달로 감싸서 제공합니다.
 *
 * 주요 기능:
 * 1. 모달 열기/닫기
 * 2. 문의 작성 폼 표시
 * 3. 작성 완료 시 목록 갱신 및 모달 닫기
 *
 * @dependencies
 * - components/ui/dialog.tsx
 * - components/wholesaler/Support/InquiryCreateForm.tsx
 */

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InquiryCreateForm from "./InquiryCreateForm";

interface InquiryCreateModalProps {
  /**
   * 모달 열림 상태
   */
  open: boolean;
  /**
   * 모달 열림 상태 변경 핸들러
   */
  onOpenChange: (open: boolean) => void;
  /**
   * 문의 작성 성공 핸들러
   */
  onSuccess?: () => void;
}

export default function InquiryCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: InquiryCreateModalProps) {
  const handleCancel = () => {
    console.log("⏹️ [inquiry-create-modal] 취소 버튼 클릭 - 모달 닫기");
    onOpenChange(false);
  };

  const handleSuccess = () => {
    // 문의 작성 성공 시 모달 닫기
    onOpenChange(false);
    // 부모 컴포넌트의 성공 핸들러 호출
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>새 문의 작성</DialogTitle>
          <DialogDescription>
            관리자에게 문의할 내용을 작성해주세요. 정산, 계정, 기술 지원 등 어떤
            내용이든 문의해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0 mt-4 w-full min-w-0">
          <InquiryCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

