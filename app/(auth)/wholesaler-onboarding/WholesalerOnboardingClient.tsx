/**
 * @file WholesalerOnboardingClient.tsx
 * @description 도매점 온보딩 클라이언트 컴포넌트 (프로필 재시도 로직)
 *
 * 회원가입 직후 프로필 동기화가 완료되지 않았을 때를 대비한 재시도 로직을 포함합니다.
 * 프로필이 없을 때 잠시 대기 후 페이지를 새로고침하여 재시도합니다.
 *
 * @dependencies
 * - next/navigation (useRouter)
 * - @clerk/nextjs (useAuth)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import WholesalerOnboardingForm from "./WholesalerOnboardingForm";

export default function WholesalerOnboardingClient() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 500; // 500ms

  useEffect(() => {
    // Clerk가 로드되지 않았거나 사용자가 없으면 대기
    if (!isLoaded || !userId) {
      return;
    }

    // 프로필 확인을 위해 서버에 요청
    const checkProfile = async () => {
      try {
        const response = await fetch("/api/check-profile", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            // 프로필이 있으면 폼 표시
            console.log("✅ [wholesaler-onboarding] 프로필 확인 완료");
            setShowForm(true);
          } else if (retryCount < MAX_RETRIES) {
            // 프로필이 없고 재시도 가능하면 재시도
            console.log(
              `⏳ [wholesaler-onboarding] 프로필 없음, ${RETRY_DELAY}ms 후 재시도 (${retryCount + 1}/${MAX_RETRIES})`,
            );
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              router.refresh(); // 페이지 새로고침
            }, RETRY_DELAY);
          } else {
            // 최대 재시도 횟수 초과 시 폼 표시 (동기화가 진행 중일 수 있음)
            console.log("⚠️ [wholesaler-onboarding] 최대 재시도 횟수 초과, 폼 표시");
            setShowForm(true);
          }
        } else {
          // API 오류 시 폼 표시
          console.log("⚠️ [wholesaler-onboarding] 프로필 확인 API 오류, 폼 표시");
          setShowForm(true);
        }
      } catch (error) {
        console.error("❌ [wholesaler-onboarding] 프로필 확인 예외:", error);
        // 오류 발생 시 폼 표시
        setShowForm(true);
      }
    };

    // 즉시 프로필 확인
    checkProfile();
  }, [isLoaded, userId, retryCount, router]);

  // 로딩 중이거나 폼을 표시할 준비가 되지 않았으면 로딩 표시
  // isLoaded가 true여야 ClerkProvider가 완전히 마운트된 상태
  if (!isLoaded || !userId || !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  // Clerk가 완전히 로드된 후에만 폼 렌더링
  // 이렇게 하면 useClerk가 ClerkProvider 안에서 호출됨을 보장
  return <WholesalerOnboardingForm />;
}

