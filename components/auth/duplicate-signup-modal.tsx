/**
 * @file components/auth/duplicate-signup-modal.tsx
 * @description 중복 가입 방지 모달
 *
 * 이미 가입된 계정으로 회원가입을 시도할 때 표시되는 모달입니다.
 * 모달에서 안내 메시지를 표시하고 로그아웃 후 로그인 페이지로 이동합니다.
 *
 * 주요 기능:
 * 1. 중복 가입 시도 안내
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

export default function DuplicateSignupModal() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log("🚫 [duplicate-signup-modal] 중복 가입 모달 표시");

  // 모달이 열릴 때 로그
  useEffect(() => {
    if (isOpen) {
      console.log("🚫 [duplicate-signup-modal] 중복 가입 모달 표시");
    }
  }, [isOpen]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log("🚪 [duplicate-signup-modal] 로그아웃 시작");
      setIsLoggingOut(true);

      // Clerk 로그아웃
      await signOut();
      router.push("/sign-in");

      console.log("✅ [duplicate-signup-modal] 로그아웃 완료");
    } catch (error) {
      console.error("❌ [duplicate-signup-modal] 로그아웃 오류:", error);
      setIsLoggingOut(false);

      // 에러가 발생해도 강제로 로그인 페이지로 이동
      router.push("/sign-in");
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
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
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            이미 가입된 계정입니다
          </DialogTitle>
          <DialogDescription className="pt-2 text-base text-center">
            해당 계정으로 이미 가입되어 있습니다.
            <br />
            <br />
            로그인 페이지로 이동하여 기존 계정으로 로그인해주세요.
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

