/**
 * @file components/auth/retailer-block-modal.tsx
 * @description 소매점 계정 차단 모달
 *
 * 소매점 계정이 도매점에 로그인하려고 할 때 표시되는 모달입니다.
 * 모달에서 안내 메시지를 표시하고 로그아웃을 처리합니다.
 *
 * 주요 기능:
 * 1. 소매점 계정 접근 차단 안내
 * 2. 자동 로그아웃 처리
 * 3. ESC 키 및 외부 클릭으로 닫히지 않도록 처리
 *
 * @dependencies
 * - @clerk/nextjs (signOut)
 * - next/navigation (useRouter)
 * - react (useState, useEffect)
 * - components/ui/dialog (모달)
 * - lucide-react (AlertCircle)
 */

"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
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

export default function RetailerBlockModal() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log("🚫 [retailer-block-modal] 모달 렌더링");

  // 모달이 열릴 때 로그
  useEffect(() => {
    if (isOpen) {
      console.log("🚫 [retailer-block-modal] 소매점 계정 차단 모달 표시");
    }
  }, [isOpen]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log("🚪 [retailer-block-modal] 로그아웃 시작");
      setIsLoggingOut(true);
      
      // Clerk 로그아웃
      await signOut();
      router.push("/sign-in/wholesaler");
      
      console.log("✅ [retailer-block-modal] 로그아웃 완료");
    } catch (error) {
      console.error("❌ [retailer-block-modal] 로그아웃 오류:", error);
      setIsLoggingOut(false);
      
      // 에러가 발생해도 강제로 로그인 페이지로 이동
      router.push("/sign-in/wholesaler");
    }
  };

  // 모달 닫기 (ESC 키 등으로 닫히지 않도록)
  const handleOpenChange = (open: boolean) => {
    // 모달을 닫으려고 하면 로그아웃 처리
    if (!open && !isLoggingOut) {
      handleLogout();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        style={{ zIndex: 9999 }}
        onEscapeKeyDown={(e) => {
          // ESC 키로 닫히지 않도록
          e.preventDefault();
          handleLogout();
        }}
        onPointerDownOutside={(e) => {
          // 외부 클릭으로 닫히지 않도록
          e.preventDefault();
          handleLogout();
        }}
      >
        <DialogHeader>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            접근이 제한되었습니다
          </DialogTitle>
          <DialogDescription className="pt-2 text-base text-center">
            소매점 계정은 도매점 플랫폼에 접근할 수 없습니다.
            <br />
            <br />
            도매점 서비스를 이용하시려면 도매점 계정으로 로그인해주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 pt-4">
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
          >
            {isLoggingOut ? "로그아웃 중..." : "확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

