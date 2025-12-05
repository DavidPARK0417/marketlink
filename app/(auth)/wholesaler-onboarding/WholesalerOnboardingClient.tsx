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

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import WholesalerOnboardingForm from "./WholesalerOnboardingForm";
import DuplicateSignupModal from "@/components/auth/duplicate-signup-modal";

interface WholesalerOnboardingClientProps {
  forceCheckDuplicate?: boolean;
}

export default function WholesalerOnboardingClient({
  forceCheckDuplicate = false,
}: WholesalerOnboardingClientProps) {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();
  const retryCountRef = useRef(0);
  const syncRetryCountRef = useRef(0);
  const sessionCheckRef = useRef(0);
  const [showForm, setShowForm] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const MAX_RETRIES = 3;
  const MAX_SYNC_RETRIES = 5; // 동기화 재시도는 더 많이 허용 (세션 준비 시간 고려)
  const MAX_SESSION_CHECKS = 10; // 서버 세션 확인 최대 횟수
  const RETRY_DELAY = 500; // 500ms
  const SYNC_RETRY_DELAY = 1000; // 동기화 재시도는 1초 대기
  const SESSION_CHECK_DELAY = 500; // 서버 세션 확인 간격

  // 서버 세션이 준비되었는지 확인하는 함수
  const checkServerSession = useCallback(async (): Promise<boolean> => {
    try {
      // getToken()이 성공하면 서버에서도 세션을 사용할 수 있음
      const token = await getToken();
      if (token) {
        console.log("✅ [wholesaler-onboarding] 서버 세션 토큰 확인 완료");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [getToken]);

  // 서버 세션 준비 대기 및 forceCheckDuplicate 처리
  useEffect(() => {
    // forceCheckDuplicate가 true이면 userId 없이도 중복 가입 확인 시도
    if (forceCheckDuplicate && isLoaded) {
      console.log(
        "🔍 [wholesaler-onboarding] 강제 중복 가입 확인 시작 (userId 대기 없이)",
      );

      const checkDuplicate = async (retryCount: number = 0) => {
        try {
          const syncResponse = await fetch("/api/sync-user", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const syncData = await syncResponse.json();

          // 중복 가입 감지 (409 Conflict)
          if (syncResponse.status === 409 && syncData.isDuplicate) {
            console.log("⚠️ [wholesaler-onboarding] 중복 가입 감지됨:", {
              message: syncData.message,
              profile: syncData.profile,
            });
            setShowDuplicateModal(true);
            return;
          }

          // 인증 실패 (401) - 세션이 아직 준비되지 않았을 수 있음
          if (syncResponse.status === 401) {
            if (retryCount < MAX_SYNC_RETRIES) {
              console.log(
                `⏳ [wholesaler-onboarding] 인증 실패, ${SYNC_RETRY_DELAY}ms 후 재시도 (${
                  retryCount + 1
                }/${MAX_SYNC_RETRIES})`,
              );
              setTimeout(() => {
                checkDuplicate(retryCount + 1);
              }, SYNC_RETRY_DELAY);
              return;
            } else {
              console.error(
                "❌ [wholesaler-onboarding] 중복 가입 확인 최대 재시도 횟수 초과 (인증 실패)",
              );
              // 최대 재시도 횟수 초과 시 userId가 준비될 때까지 대기
              // userId가 준비되면 일반 플로우로 진행
            }
          }

          // 성공했지만 중복이 아닌 경우 (정상 신규 가입)
          // userId가 준비될 때까지 대기
          if (!userId) {
            console.log(
              "⏳ [wholesaler-onboarding] 정상 신규 가입 확인, userId 대기 중...",
            );
            // userId가 준비되면 일반 플로우로 진행
            return;
          }
        } catch (error) {
          console.error(
            "❌ [wholesaler-onboarding] 중복 가입 확인 오류:",
            error,
          );
          if (retryCount < MAX_SYNC_RETRIES) {
            setTimeout(() => {
              checkDuplicate(retryCount + 1);
            }, SYNC_RETRY_DELAY);
          }
        }
      };

      checkDuplicate();
      // forceCheckDuplicate가 true이고 userId가 없으면 여기서 종료
      // userId가 준비되면 일반 플로우로 진행
      if (!userId) {
        return;
      }
    }

    // Clerk가 로드되지 않았거나 사용자가 없으면 대기
    if (!isLoaded || !userId) {
      console.log("⏳ [wholesaler-onboarding] Clerk 로딩 대기 중...", {
        isLoaded,
        userId,
        forceCheckDuplicate,
      });
      return;
    }

    const waitForSession = async () => {
      sessionCheckRef.current += 1;
      const checkCount = sessionCheckRef.current;

      console.log(
        `🔍 [wholesaler-onboarding] 서버 세션 확인 중... (${checkCount}/${MAX_SESSION_CHECKS})`,
      );

      const ready = await checkServerSession();

      if (ready) {
        console.log("✅ [wholesaler-onboarding] 서버 세션 준비 완료!");
        setIsSessionReady(true);
      } else if (checkCount < MAX_SESSION_CHECKS) {
        console.log(
          `⏳ [wholesaler-onboarding] 서버 세션 아직 준비 안됨, ${SESSION_CHECK_DELAY}ms 후 재확인`,
        );
        setTimeout(waitForSession, SESSION_CHECK_DELAY);
      } else {
        console.error(
          "❌ [wholesaler-onboarding] 서버 세션 확인 최대 횟수 초과",
        );
        setError("세션 준비에 실패했습니다. 페이지를 새로고침해주세요.");
      }
    };

    // 초기 지연 후 세션 확인 시작 (OAuth 콜백 처리 시간 확보)
    const timer = setTimeout(waitForSession, 300);
    return () => clearTimeout(timer);
  }, [isLoaded, userId, forceCheckDuplicate, checkServerSession]);

  // 서버 세션이 준비된 후 프로필 확인
  useEffect(() => {
    if (!isSessionReady || !userId) {
      return;
    }

    console.log(
      "✅ [wholesaler-onboarding] 서버 세션 준비 완료, 프로필 확인 시작",
      {
        userId,
      },
    );

    // 프로필 확인 및 동기화 시도
    const checkProfile = async () => {
      try {
        // 먼저 동기화 API를 호출하여 프로필 생성 시도
        let syncSuccess = false;
        let isDuplicate = false;

        try {
          console.log(
            `🔄 [wholesaler-onboarding] 동기화 API 호출 시도 (${
              syncRetryCountRef.current + 1
            }/${MAX_SYNC_RETRIES})`,
          );

          const syncResponse = await fetch("/api/sync-user", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          // 응답 파싱 (에러 응답도 JSON일 수 있음)
          let syncData;
          try {
            syncData = await syncResponse.json();
          } catch (parseError) {
            // JSON 파싱 실패 시 텍스트 응답으로 처리
            const text = await syncResponse.text();
            console.error("❌ [wholesaler-onboarding] 동기화 응답 파싱 실패:", {
              status: syncResponse.status,
              text,
            });
            throw new Error(`동기화 응답 파싱 실패: ${text}`);
          }

          // 중복 가입 감지 (409 Conflict)
          if (syncResponse.status === 409 && syncData.isDuplicate) {
            console.log("⚠️ [wholesaler-onboarding] 중복 가입 감지됨:", {
              message: syncData.message,
              profile: syncData.profile,
            });
            isDuplicate = true;
            setShowDuplicateModal(true);
            return; // 중복 가입이면 여기서 종료
          }

          // 인증 실패 (401) - 세션이 아직 준비되지 않았을 수 있음
          if (syncResponse.status === 401) {
            if (syncRetryCountRef.current < MAX_SYNC_RETRIES) {
              syncRetryCountRef.current += 1;
              console.log(
                `⏳ [wholesaler-onboarding] 인증 실패, ${SYNC_RETRY_DELAY}ms 후 재시도 (${syncRetryCountRef.current}/${MAX_SYNC_RETRIES})`,
              );
              setTimeout(() => {
                checkProfile();
              }, SYNC_RETRY_DELAY);
              return;
            } else {
              console.error(
                "❌ [wholesaler-onboarding] 동기화 최대 재시도 횟수 초과 (인증 실패)",
              );
              setError("인증에 실패했습니다. 페이지를 새로고침해주세요.");
              // 인증 실패해도 폼은 표시 (사용자가 직접 시도할 수 있도록)
              setShowForm(true);
              return;
            }
          }

          // 기타 오류
          if (!syncResponse.ok) {
            console.error("❌ [wholesaler-onboarding] 동기화 실패:", {
              status: syncResponse.status,
              data: syncData,
            });
            // 동기화 실패해도 프로필 확인은 계속 진행
          } else {
            console.log("✅ [wholesaler-onboarding] 사용자 동기화 완료");
            syncSuccess = true;
          }
        } catch (syncError) {
          console.warn(
            "⚠️ [wholesaler-onboarding] 동기화 예외 (무시하고 계속 진행):",
            syncError,
          );
          // 동기화 실패해도 프로필 확인은 계속 진행
        }

        // 중복 가입 모달이 표시되면 여기서 종료
        if (isDuplicate) {
          return;
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
              const wholesalerResponse = await fetch(
                "/api/check-wholesaler-status",
                {
                  method: "GET",
                  credentials: "include",
                },
              );

              if (wholesalerResponse.ok) {
                const wholesalerData = await wholesalerResponse.json();

                // rejected 상태이면 승인 대기 페이지로 리다이렉트
                if (wholesalerData.wholesaler?.status === "rejected") {
                  console.log(
                    "⚠️ [wholesaler-onboarding] 반려 처리된 계정, 승인 대기 페이지로 이동",
                  );
                  router.push("/pending-approval");
                  return;
                }

                // pending 상태이면 승인 대기 페이지로 리다이렉트
                if (wholesalerData.wholesaler?.status === "pending") {
                  console.log(
                    "⚠️ [wholesaler-onboarding] 승인 대기 중인 계정, 승인 대기 페이지로 이동",
                  );
                  router.push("/pending-approval");
                  return;
                }

                // approved 상태이면 대시보드로 리다이렉트
                if (wholesalerData.wholesaler?.status === "approved") {
                  console.log(
                    "✅ [wholesaler-onboarding] 이미 승인된 계정, 대시보드로 이동",
                  );
                  router.push("/wholesaler");
                  return;
                }
              }
            } catch (wholesalerError) {
              console.warn(
                "⚠️ [wholesaler-onboarding] 도매점 상태 확인 실패 (무시하고 계속 진행):",
                wholesalerError,
              );
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
            console.log(
              "⚠️ [wholesaler-onboarding] 최대 재시도 횟수 초과, 폼 표시 (프로필 없어도 진행)",
            );
            setShowForm(true);
          }
        } else {
          // API 오류 시 폼 표시 (프로필 없어도 진행 가능)
          console.log(
            "⚠️ [wholesaler-onboarding] 프로필 확인 API 오류, 폼 표시",
          );
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
  }, [isSessionReady, userId, router]);

  // 중복 가입 모달이 표시되면 모달만 렌더링
  if (showDuplicateModal) {
    return <DuplicateSignupModal />;
  }

  // 에러가 있으면 에러 메시지 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">오류가 발생했습니다</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-[#059669]"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중이거나 폼을 표시할 준비가 되지 않았으면 로딩 표시
  // isLoaded가 true여야 ClerkProvider가 완전히 마운트된 상태
  if (!isLoaded || !userId || !showForm) {
    // 로딩 상태에 따른 메시지
    let loadingMessage = "잠시만 기다려주세요...";
    if (!isLoaded) {
      loadingMessage = "인증 정보를 확인하고 있습니다...";
    } else if (!isSessionReady) {
      loadingMessage = "세션을 준비하고 있습니다...";
    } else if (!showForm) {
      loadingMessage = "프로필을 확인하고 있습니다...";
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#10B981] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Clerk가 완전히 로드된 후에만 폼 렌더링
  // 이렇게 하면 useClerk가 ClerkProvider 안에서 호출됨을 보장
  return <WholesalerOnboardingForm />;
}
