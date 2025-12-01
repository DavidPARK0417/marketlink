/**
 * @file app/(auth)/pending-approval/page.tsx
 * @description 도매점 승인 대기 페이지
 *
 * 도매점 회원가입 후 관리자 승인을 기다리는 페이지입니다.
 * 실시간으로 승인 상태 변경을 감지하여 자동으로 리다이렉트합니다.
 *
 * 주요 기능:
 * 1. 현재 승인 상태 조회 (pending, approved, rejected)
 * 2. 실시간 승인 상태 변경 감지 (Supabase Realtime)
 * 3. 승인 완료 시 대시보드로 즉시 이동
 * 4. 승인 반려 시 반려 사유 표시 및 재신청 버튼
 *
 * @dependencies
 * - @clerk/nextjs (useUser, useClerk)
 * - lib/supabase/clerk-client.ts (useClerkSupabaseClient)
 * - lib/supabase/realtime.ts (subscribeToWholesalerStatus)
 * - components/ui/card.tsx, button.tsx
 * - lucide-react (아이콘)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { subscribeToWholesalerStatus } from "@/lib/supabase/realtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Hourglass,
  CheckCircle,
  XCircle,
  Mail,
  Building2,
  Loader2,
} from "lucide-react";
import type { Wholesaler } from "@/types/wholesaler";

// 문의 정보 (환경 변수 또는 상수로 관리 가능)
const CONTACT_EMAIL = "decidepyb@gmail.com";

export default function PendingApprovalPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();

  const [status, setStatus] = useState<
    "pending" | "approved" | "rejected" | "suspended" | "loading" | "error"
  >("loading");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // 초기 승인 상태 조회
  useEffect(() => {
    if (!isUserLoaded || !user) {
      console.log("⚠️ [pending-approval] 사용자 정보 로딩 중 또는 미인증");
      return;
    }

    const fetchWholesalerStatus = async () => {
      try {
        console.group("🔍 [pending-approval] 도매점 상태 조회 시작");
        console.log("Clerk userId:", user.id);

        // 프로필 조회
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, wholesalers(*)")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError) {
          console.error(
            "❌ [pending-approval] 프로필 조회 오류:",
            profileError,
          );
          setError("프로필 정보를 불러올 수 없습니다.");
          setStatus("error");
          return;
        }

        if (!profile) {
          console.log(
            "⚠️ [pending-approval] 프로필 없음, 온보딩으로 리다이렉트",
          );
          router.push("/wholesaler-onboarding");
          return;
        }

        // wholesalers 관계에서 도매점 정보 확인
        const wholesalers = profile.wholesalers as Wholesaler[] | null;

        if (!wholesalers || wholesalers.length === 0) {
          console.log(
            "⚠️ [pending-approval] 도매점 정보 없음, 온보딩으로 리다이렉트",
          );
          router.push("/wholesaler-onboarding");
          return;
        }

        const wholesaler = wholesalers[0];
        console.log("✅ [pending-approval] 도매점 정보 조회 완료:", {
          id: wholesaler.id,
          status: wholesaler.status,
        });

        setWholesalerId(wholesaler.id);
        setStatus(wholesaler.status);
        setRejectionReason(wholesaler.rejection_reason);

        // 이미 승인된 경우 즉시 대시보드로 이동
        if (wholesaler.status === "approved") {
          console.log("✅ [pending-approval] 이미 승인됨, 대시보드로 이동");
          router.push("/wholesaler");
          return;
        }

        // pending 상태인 경우 모달 표시
        if (wholesaler.status === "pending") {
          setShowPendingModal(true);
        }
      } catch (err) {
        console.error("❌ [pending-approval] 상태 조회 예외:", err);
        setError("상태를 불러오는 중 오류가 발생했습니다.");
        setStatus("error");
      } finally {
        console.groupEnd();
      }
    };

    fetchWholesalerStatus();
  }, [isUserLoaded, user, supabase, router]);

  // 실시간 승인 상태 구독
  useEffect(() => {
    if (!wholesalerId || status === "error") {
      return;
    }

    console.log("🔔 [pending-approval] 실시간 구독 시작:", wholesalerId);

    const unsubscribe = subscribeToWholesalerStatus(
      supabase,
      wholesalerId,
      (updatedWholesaler) => {
        console.group("🔄 [pending-approval] 승인 상태 변경 감지");
        console.log("새로운 상태:", updatedWholesaler.status);
        console.log("반려 사유:", updatedWholesaler.rejection_reason);

        setStatus(updatedWholesaler.status);
        setRejectionReason(updatedWholesaler.rejection_reason);

        // 승인 완료 시 모달 닫고 대시보드로 이동
        if (updatedWholesaler.status === "approved") {
          console.log("✅ [pending-approval] 승인 완료, 대시보드로 이동");
          setShowPendingModal(false);
          router.push("/wholesaler");
        }

        // pending 상태로 변경된 경우 모달 표시
        if (updatedWholesaler.status === "pending") {
          setShowPendingModal(true);
        }

        console.groupEnd();
      },
    );

    return () => {
      console.log("🧹 [pending-approval] 실시간 구독 해제");
      unsubscribe();
    };
  }, [wholesalerId, supabase, router, status]);

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (isUserLoaded && !user) {
      console.log("⚠️ [pending-approval] 인증되지 않음, 로그인 페이지로 이동");
      router.push("/sign-in");
    }
  }, [isUserLoaded, user, router]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      console.log("🚪 [pending-approval] 로그아웃 시작");
      await signOut({ redirectUrl: "/sign-in/wholesaler" });
    } catch (err) {
      console.error("❌ [pending-approval] 로그아웃 오류:", err);
    }
  };

  // Pending 모달 확인 핸들러
  const handlePendingConfirm = () => {
    setShowPendingModal(false);
    router.push("/");
  };

  // 로딩 중
  if (status === "loading" || !isUserLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              오류 발생
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {error || "알 수 없는 오류가 발생했습니다."}
            </p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 승인 완료 상태 (리다이렉트 중)
  if (status === "approved") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">승인 완료!</h2>
            <p className="text-gray-600 mb-4">도매 페이지로 이동합니다...</p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 승인 반려 상태
  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-700" />
            <span className="text-lg font-semibold text-gray-900">
              B2B Platform
            </span>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700"
          >
            로그아웃
          </Button>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">승인 반려</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                죄송합니다. 관리자가 회원가입을 반려했습니다.
              </p>
              {rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    반려 사유:
                  </p>
                  <p className="text-sm text-red-700">{rejectionReason}</p>
                </div>
              )}
              <Button
                onClick={() => router.push("/wholesaler-onboarding")}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                정보 수정 후 재신청
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 승인 대기 중 상태 (pending) - 모달로 표시
  return (
    <>
      {/* Pending 모달 */}
      <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <Hourglass className="w-16 h-16 text-yellow-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              관리자 승인 대기 중입니다.
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              회원님의 가입 신청이 정상적으로 접수되었습니다. 관리자가 사업자
              정보를 확인 후 신속하게 승인 처리해 드리겠습니다.
            </DialogDescription>
            <div className="space-y-4 pt-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  <strong>예상 소요 시간: 영업일 기준 1~2일</strong>
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium text-gray-700">
                  승인 관련 문의:
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{CONTACT_EMAIL}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 pt-2">
                승인 완료 시 자동으로 화면이 전환됩니다.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handlePendingConfirm}
              className="w-full sm:w-auto min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 배경 페이지 (메인 페이지로 리다이렉트) */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    </>
  );
}

