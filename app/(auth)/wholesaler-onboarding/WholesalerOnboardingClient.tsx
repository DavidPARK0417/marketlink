/**
 * @file WholesalerOnboardingClient.tsx
 * @description 도매점 온보딩 클라이언트 컴포넌트 (프로필 재시도 로직)
 *
 * 회원가입 직후 프로필 동기화가 완료되지 않았을 때를 대비한 재시도 로직을 포함합니다.
 * 프로필이 없을 때 잠시 대기 후 API를 다시 호출하여 재시도합니다.
 * router.refresh() 대신 API 재호출을 사용하여 무한 루프를 방지합니다.
 *
 * @dependencies
 * - @clerk/nextjs (useAuth)
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import WholesalerOnboardingForm from "./WholesalerOnboardingForm";

export default function WholesalerOnboardingClient() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const retryCountRef = useRef(0);
  const [showForm, setShowForm] = useState(false);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 500; // 500ms

  useEffect(() => {
    // Clerk가 로드되지 않았거나 사용자가 없으면 대기
    if (!isLoaded || !userId) {
      return;
    }

    // 프로필 확인 및 동기화 시도
    const checkProfile = async () => {
      try {
        // 먼저 동기화 API를 호출하여 프로필 생성 시도
        try {
          const syncResponse = await fetch("/api/sync-user", {
            method: "POST",
            credentials: "include",
          });
          if (syncResponse.ok) {
            console.log("✅ [wholesaler-onboarding] 사용자 동기화 완료");
          }
        } catch (syncError) {
          console.warn("⚠️ [wholesaler-onboarding] 동기화 실패 (무시하고 계속 진행):", syncError);
        }

        // 프로필 확인 (동기화 후 약간의 지연)
        await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms 대기
        
        const response = await fetch("/api/check-profile", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            console.log("✅ [wholesaler-onboarding] 프로필 확인 완료");

            // 반려 처리된 도매점 정보 확인
            try {
              const wholesalerResponse = await fetch("/api/check-wholesaler-status", {
                method: "GET",
                credentials: "include",
              });

              if (wholesalerResponse.ok) {
                const wholesalerData = await wholesalerResponse.json();
                
                // rejected 상태이면 승인 대기 페이지로 리다이렉트
                if (wholesalerData.wholesaler?.status === "rejected") {
                  console.log("⚠️ [wholesaler-onboarding] 반려 처리된 계정, 승인 대기 페이지로 이동");
                  router.push("/pending-approval");
                  return;
                }

                // pending 상태이면 승인 대기 페이지로 리다이렉트
                if (wholesalerData.wholesaler?.status === "pending") {
                  console.log("⚠️ [wholesaler-onboarding] 승인 대기 중인 계정, 승인 대기 페이지로 이동");
                  router.push("/pending-approval");
                  return;
                }

                // approved 상태이면 대시보드로 리다이렉트
                if (wholesalerData.wholesaler?.status === "approved") {
                  console.log("✅ [wholesaler-onboarding] 이미 승인된 계정, 대시보드로 이동");
                  router.push("/wholesaler");
                  return;
                }
              }
            } catch (wholesalerError) {
              console.warn("⚠️ [wholesaler-onboarding] 도매점 상태 확인 실패 (무시하고 계속 진행):", wholesalerError);
              // 도매점 상태 확인 실패해도 폼 표시 (신규 사용자일 수 있음)
            }

            // 프로필이 있고 도매점 정보가 없거나 신규인 경우 폼 표시
            setShowForm(true);
          } else if (retryCountRef.current < MAX_RETRIES) {
            // 프로필이 없고 재시도 가능하면 재시도
            retryCountRef.current += 1;
            console.log(
              `⏳ [wholesaler-onboarding] 프로필 없음, ${RETRY_DELAY}ms 후 재시도 (${retryCountRef.current}/${MAX_RETRIES})`,
            );
            setTimeout(() => {
              // API를 다시 호출하여 무한 루프 방지
              checkProfile();
            }, RETRY_DELAY);
          } else {
            // 최대 재시도 횟수 초과 시 폼 표시
            // 프로필이 없어도 폼을 표시하여 사용자가 온보딩을 진행할 수 있도록 함
            // 폼 제출 시 프로필이 생성되거나 업데이트됨
            console.log("⚠️ [wholesaler-onboarding] 최대 재시도 횟수 초과, 폼 표시 (프로필 없어도 진행)");
            setShowForm(true);
          }
        } else {
          // API 오류 시 폼 표시 (프로필 없어도 진행 가능)
          console.log("⚠️ [wholesaler-onboarding] 프로필 확인 API 오류, 폼 표시");
          setShowForm(true);
        }
      } catch (error) {
        console.error("❌ [wholesaler-onboarding] 프로필 확인 예외:", error);
        // 오류 발생 시 폼 표시 (프로필 없어도 진행 가능)
        setShowForm(true);
      }
    };

    // 즉시 프로필 확인 및 동기화 시도
    checkProfile();
  }, [isLoaded, userId, router]); // router 의존성 추가

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

