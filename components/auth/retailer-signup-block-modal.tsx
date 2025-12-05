/**
 * @file components/auth/retailer-signup-block-modal.tsx
 * @description 소매점 계정의 도매점 회원가입 차단 모달
 *
 * 소매점 계정으로 도매점 회원가입을 시도할 때 표시되는 모달입니다.
 * 모달에서 가입 불가 이유를 안내하고 첫 페이지로 리다이렉트합니다.
 *
 * 주요 기능:
 * 1. 소매점 계정의 도매점 회원가입 차단 안내
 * 2. 로그인/회원가입 버튼 비활성화 (Clerk 컴포넌트 숨김으로 처리)
 * 3. ESC 키 및 외부 클릭으로 닫히지 않도록 처리
 * 4. 확인 버튼 클릭 시 첫 페이지로 리다이렉트
 *
 * @dependencies
 * - next/navigation (useRouter)
 * - react (useState)
 * - components/ui/dialog (모달)
 * - lucide-react (AlertCircle)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function RetailerSignupBlockModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  console.log("🚫 [retailer-signup-block-modal] 모달 렌더링");

  // 첫 페이지로 리다이렉트
  const handleConfirm = () => {
    console.log("🏠 [retailer-signup-block-modal] 첫 페이지로 리다이렉트");
    setIsRedirecting(true);
    router.push("/");
  };

  // 모달 닫기 방지
  const handleOpenChange = (open: boolean) => {
    if (!open && !isRedirecting) {
      // 닫으려고 하면 확인 처리
      handleConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent
        className="sm:max-w-[425px]"
        style={{ zIndex: 9999 }}
        onEscapeKeyDown={(e) => {
          // ESC 키로 닫히지 않도록
          e.preventDefault();
          handleConfirm();
        }}
        onPointerDownOutside={(e) => {
          // 외부 클릭으로 닫히지 않도록
          e.preventDefault();
          handleConfirm();
        }}
      >
        <DialogHeader>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            회원가입이 불가능합니다
          </DialogTitle>
          <DialogDescription className="pt-2 text-base text-center">
            소매점으로 등록된 계정은 도매점에 회원가입할 수 없습니다.
            <br />
            <br />
            도매점 서비스를 이용하시려면 새로운 도매점 계정으로 회원가입해주세요.
            <br />
            <br />
            <span className="text-sm text-gray-600">
              현재 계정으로는 로그인 및 회원가입이 불가능합니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isRedirecting}
            className="min-w-[120px] bg-[#10B981] hover:bg-[#059669]"
          >
            {isRedirecting ? "이동 중..." : "확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

