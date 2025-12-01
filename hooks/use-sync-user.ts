"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 훅
 *
 * 사용자가 로그인한 상태에서 이 훅을 사용하면
 * 자동으로 /api/sync-user를 호출하여 Supabase users 테이블에 사용자 정보를 저장합니다.
 *
 * 개선 사항:
 * - 재시도 로직 추가 (최대 3회)
 * - 에러 상태 관리 및 상세 로깅
 * - Clerk 세션 완전 생성 대기 (500ms 지연)
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useSyncUser } from '@/hooks/use-sync-user';
 *
 * export default function Layout({ children }) {
 *   useSyncUser();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useSyncUser() {
  const { isLoaded, userId } = useAuth();
  const syncedRef = useRef(false);
  const retryCountRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1초

  useEffect(() => {
    // 이미 동기화했거나, 로딩 중이거나, 로그인하지 않은 경우 무시
    if (syncedRef.current || !isLoaded || !userId || isSyncing) {
      return;
    }

    // 동기화 실행 (재시도 로직 포함)
    const syncUser = async (attempt: number = 1): Promise<void> => {
      setIsSyncing(true);
      setError(null);

      try {
        console.log(
          `🔄 [use-sync-user] 동기화 시도 ${attempt}/${MAX_RETRIES}, userId:`,
          userId,
        );

        const response = await fetch("/api/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // 중복 가입 감지 (409 Conflict)
          if (response.status === 409 && data.isDuplicate) {
            console.log("⚠️ [use-sync-user] 중복 가입 감지됨:", {
              message: data.message,
              profile: data.profile,
            });
            // 이미 가입된 계정이므로 동기화 완료로 처리 (무한루프 방지)
            syncedRef.current = true;
            setIsDuplicate(true);
            setIsSyncing(false);
            return;
          }

          const errorMessage =
            data.error || data.details || "사용자 동기화에 실패했습니다.";
          const errorCode = data.code || "UNKNOWN";
          const errorHint = data.hint || "";

          console.error("❌ [use-sync-user] 동기화 실패:", {
            attempt,
            error: errorMessage,
            code: errorCode,
            hint: errorHint,
            response: data,
          });

          // 재시도 가능한 경우 (401, 500 등)
          if (
            attempt < MAX_RETRIES &&
            (response.status === 500 || response.status === 401)
          ) {
            console.log(
              `⏳ [use-sync-user] ${RETRY_DELAY}ms 후 재시도 예정 (${
                attempt + 1
              }/${MAX_RETRIES})`,
            );
            setTimeout(() => {
              syncUser(attempt + 1);
            }, RETRY_DELAY);
            return;
          }

          // 재시도 불가능하거나 최대 재시도 횟수 초과
          setError(errorMessage);
          setIsSyncing(false);
          return;
        }

        console.log("✅ [use-sync-user] 동기화 성공:", {
          profile: data.profile,
          user: data.user,
          message: data.message,
        });

        syncedRef.current = true;
        retryCountRef.current = 0;
        setError(null);
        setIsSyncing(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";

        console.error("❌ [use-sync-user] 동기화 예외:", {
          attempt,
          error: errorMessage,
          errorObject: error,
        });

        // 네트워크 오류 등 재시도 가능한 경우
        if (attempt < MAX_RETRIES) {
          console.log(
            `⏳ [use-sync-user] ${RETRY_DELAY}ms 후 재시도 예정 (${
              attempt + 1
            }/${MAX_RETRIES})`,
          );
          setTimeout(() => {
            syncUser(attempt + 1);
          }, RETRY_DELAY);
          return;
        }

        setError(errorMessage);
        setIsSyncing(false);
      }
    };

    // Clerk 세션이 완전히 생성될 때까지 약간의 지연 추가
    // 회원가입 직후에는 서버 세션이 완전히 준비되지 않을 수 있음
    // OAuth 콜백 처리 후 서버 세션 전파에 시간이 필요
    const delay = 500; // 500ms 지연 (서버 세션 준비 시간 확보)
    const timer = setTimeout(() => {
      syncUser(1);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoaded, userId, isSyncing]);

  return { error, isSyncing, isDuplicate };
}
