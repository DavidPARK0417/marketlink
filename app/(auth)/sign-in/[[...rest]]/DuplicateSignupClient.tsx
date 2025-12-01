/**
 * @file app/(auth)/sign-in/[[...rest]]/DuplicateSignupClient.tsx
 * @description 중복 가입 감지 시 표시되는 클라이언트 컴포넌트
 *
 * 이미 가입된 계정으로 회원가입을 시도할 때 표시되는 모달입니다.
 * "이미 가입된 계정입니다. 로그인을 시도하세요" 메시지를 표시하고
 * 로그인 페이지로 이동합니다.
 *
 * 주요 기능:
 * 1. 중복 가입 안내 모달 표시
 * 2. Clerk 컴포넌트 숨김 처리
 * 3. 확인 버튼 클릭 시 로그인 페이지로 리다이렉트
 *
 * @dependencies
 * - react (useEffect)
 * - components/auth/duplicate-signup-modal
 */

"use client";

import { useEffect } from "react";
import DuplicateSignupModal from "@/components/auth/duplicate-signup-modal";

export default function DuplicateSignupClient() {
  console.log("🚫 [DuplicateSignupClient] 중복 가입 감지 - 모달 표시");

  // Clerk 컴포넌트 숨기기
  useEffect(() => {
    const hideClerkComponents = () => {
      // Clerk 컴포넌트 숨기기
      const clerkSelectors = [
        "[class*='cl-rootBox']",
        "[class*='cl-card']",
        "[class*='cl-main']",
        "[class*='cl-form']",
      ];

      clerkSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          (element as HTMLElement).style.display = "none";
        });
      });
    };

    // 즉시 실행
    hideClerkComponents();

    // DOM 변화 감지를 위한 MutationObserver
    const observer = new MutationObserver(() => {
      hideClerkComponents();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <DuplicateSignupModal />;
}
