/**
 * @file app/wholesaler/layout.tsx
 * @description 도매 페이지 레이아웃
 *
 * 모든 도매 페이지를 보호하는 레이아웃입니다.
 * Clerk 인증 확인, 도매점 정보 조회, 승인 상태 확인을 수행합니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인 (auth())
 * 2. 로그인하지 않은 경우 /sign-in으로 리다이렉트
 * 3. Supabase에서 wholesalers 정보 조회
 * 4. wholesaler 정보가 없으면 /wholesaler-onboarding으로 리다이렉트
 * 5. status = 'pending' 또는 'rejected'이면 /pending-approval로 리다이렉트
 * 6. status = 'suspended'이면 /wholesaler/suspended로 리다이렉트
 * 7. status = 'approved'인 경우에만 대시보드 접근 허용
 * 8. 레이아웃 구조 설정 (Sidebar + Header + Main Content)
 *
 * @dependencies
 * - @clerk/nextjs/server (auth)
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/wholesaler/Layout/WholesalerLayoutClient.tsx
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { requireWholesaler } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import WholesalerLayoutClient from "@/components/wholesaler/Layout/WholesalerLayoutClient";

// 인증이 필요한 레이아웃이므로 동적 렌더링 강제
export const dynamic = "force-dynamic";

/**
 * 인증이 필요한 도매 페이지이므로 검색 엔진 인덱싱 방지
 */
export const metadata: Metadata = {
  title: "도매 관리 - FarmToBiz",
  description: "도매 사업자 전용 관리 페이지",
  robots: "noindex, nofollow",
};

export default async function WholesalerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    console.log("🔍 [wholesaler-layout] 레이아웃 접근 시작");

    // 현재 경로 확인 (suspended 페이지 예외 처리용)
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const isSuspendedPage = pathname === "/wholesaler/suspended";

    console.log(
      "📍 [wholesaler-layout] 현재 경로:",
      pathname,
      "| suspended 페이지 여부:",
      isSuspendedPage,
    );

    // 1. 도매점 또는 관리자 권한 확인 (requireWholesaler 사용)
    const profile = await requireWholesaler();

    console.log(`✅ [wholesaler-layout] 권한 확인됨 (role: ${profile.role})`);

    // 2. 관리자인 경우 wholesaler 정보 체크를 건너뛰고 접근 허용
    if (profile.role === "admin") {
      console.log(
        "👑 [wholesaler-layout] 관리자 접근 - wholesaler 체크 건너뜀",
      );
      return (
        <WholesalerLayoutClient role={profile.role}>
          {children}
        </WholesalerLayoutClient>
      );
    }

    // 3. 도매점인 경우 wholesaler 정보 조회 및 상태 확인
    const supabase = createClerkSupabaseClient();

    // profile_id로 도매점 정보 조회
    const { data: wholesaler, error } = await supabase
      .from("wholesalers")
      .select("id, status, suspension_reason")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (error) {
      console.error("❌ [wholesaler-layout] 도매점 정보 조회 오류:", error);
      console.error("❌ [wholesaler-layout] 에러 상세:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      // 에러 발생 시 온보딩으로 리다이렉트
      redirect("/wholesaler-onboarding");
    }

    // 4. wholesaler 정보가 없으면 온보딩으로 리다이렉트
    if (!wholesaler) {
      console.log(
        "ℹ️ [wholesaler-layout] 도매점 정보 없음, 온보딩 페이지로 리다이렉트",
      );
      redirect("/wholesaler-onboarding");
    }

    console.log("📊 [wholesaler-layout] 도매점 상태:", wholesaler.status);

    // 5. status = 'pending' 또는 'rejected'이면 승인 대기 페이지로 리다이렉트
    if (wholesaler.status === "pending" || wholesaler.status === "rejected") {
      console.log(
        "⏳ [wholesaler-layout] 승인 대기/반려 상태, 홈으로 이동 후 모달 표시",
      );
      redirect("/");
    }

    // 6. status = 'suspended'인 경우 처리
    if (wholesaler.status === "suspended") {
      // 이미 suspended 페이지에 있으면 레이아웃 구조 없이 children만 렌더링
      if (isSuspendedPage) {
        console.log(
          "🚫 [wholesaler-layout] 정지 페이지 접근 - 레이아웃 구조 없이 렌더링",
        );
        return <>{children}</>;
      }
      // suspended 페이지가 아니면 정지 페이지로 리다이렉트
      console.log(
        "🚫 [wholesaler-layout] 계정 정지 상태, 정지 페이지로 리다이렉트",
      );
      redirect("/wholesaler/suspended");
    }

    // 7. status = 'approved'인 경우에만 대시보드 접근 허용
    if (wholesaler.status !== "approved") {
      console.log(
        "⚠️ [wholesaler-layout] 승인되지 않은 상태, 홈으로 리다이렉트",
      );
      redirect("/");
    }

    console.log("✅ [wholesaler-layout] 승인된 도매점, 레이아웃 렌더링");

    return (
      <WholesalerLayoutClient role={profile.role}>
        {children}
      </WholesalerLayoutClient>
    );
  } catch (error) {
    const isRedirect =
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");

    if (isRedirect) {
      // Next.js 리다이렉트 흐름은 그대로 전달하여 중복 처리 방지
      throw error;
    }
    console.error("❌ [wholesaler-layout] 레이아웃 렌더링 오류:", error);
    console.error(
      "❌ [wholesaler-layout] 에러 스택:",
      error instanceof Error ? error.stack : "스택 없음",
    );

    // 에러 발생 시 로그인 페이지로 리다이렉트
    redirect("/sign-in");
  }
}
