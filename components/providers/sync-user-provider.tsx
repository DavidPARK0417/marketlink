"use client";

import { useSyncUser } from "@/hooks/use-sync-user";
import { useEffect } from "react";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 프로바이더
 *
 * RootLayout에 추가하여 로그인한 모든 사용자를 자동으로 Supabase에 동기화합니다.
 *
 * 개선 사항:
 * - 동기화 에러 상태 모니터링
 * - 에러 발생 시 상세 로깅
 * - 중복 가입 감지는 API에서 처리하되, 모달은 표시하지 않음 (이미 가입된 계정 로그인은 정상 동작)
 */
export function SyncUserProvider({ children }: { children: React.ReactNode }) {
  const { error, isSyncing, isDuplicate } = useSyncUser();

  useEffect(() => {
    if (error) {
      console.error("❌ [SyncUserProvider] 사용자 동기화 오류:", error);
      // 필요시 사용자에게 알림 표시 (예: toast, alert 등)
      // 현재는 콘솔 로그만 남김
    }
  }, [error]);

  useEffect(() => {
    if (isSyncing) {
      console.log("🔄 [SyncUserProvider] 사용자 동기화 진행 중...");
    }
  }, [isSyncing]);

  useEffect(() => {
    if (isDuplicate) {
      // 이미 가입된 계정이 로그인한 경우 - 정상 동작이므로 모달 표시하지 않음
      // 중복 가입 모달은 회원가입 페이지에서만 표시되어야 함
      console.log("ℹ️ [SyncUserProvider] 이미 가입된 계정 로그인 - 정상 동작");
    }
  }, [isDuplicate]);

  // 중복 가입 모달 제거 (이미 가입된 계정 로그인은 정상 동작)
  return <>{children}</>;
}
