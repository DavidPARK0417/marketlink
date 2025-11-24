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
 * 5. status = 'pending' 또는 'rejected'이면 /wholesaler/pending-approval로 리다이렉트
 * 6. status = 'suspended'이면 /wholesaler/suspended로 리다이렉트
 * 7. status = 'approved'인 경우에만 대시보드 접근 허용
 * 8. 레이아웃 구조 설정 (Sidebar + Header + Main Content)
 *
 * @dependencies
 * - @clerk/nextjs/server (auth)
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/wholesaler/Layout/Sidebar.tsx
 * - components/wholesaler/Layout/Header.tsx
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import WholesalerSidebar from "@/components/wholesaler/Layout/Sidebar";
import WholesalerHeader from "@/components/wholesaler/Layout/Header";

export default async function WholesalerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🔍 [wholesaler-layout] 레이아웃 접근 시작");

  // 1. Clerk 인증 확인
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "⚠️ [wholesaler-layout] 인증되지 않음, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  console.log("✅ [wholesaler-layout] Clerk 인증 확인됨:", userId);

  // 2. 프로필 정보 조회 (wholesalers 정보 포함)
  const profile = await getUserProfile();

  if (!profile) {
    console.log(
      "⚠️ [wholesaler-layout] 프로필 없음, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  // 3. 도매점 역할 확인
  if (profile.role !== "wholesaler") {
    console.log("⚠️ [wholesaler-layout] 도매점 역할 아님, 홈으로 리다이렉트");
    redirect("/");
  }

  // 4. Supabase에서 wholesalers 정보 조회
  const supabase = createClerkSupabaseClient();

  // profile_id로 도매점 정보 조회
  const { data: wholesaler, error } = await supabase
    .from("wholesalers")
    .select("id, status, rejection_reason")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("❌ [wholesaler-layout] 도매점 정보 조회 오류:", error);
    // 에러 발생 시 온보딩으로 리다이렉트
    redirect("/wholesaler-onboarding");
  }

  // 5. wholesaler 정보가 없으면 온보딩으로 리다이렉트
  if (!wholesaler) {
    console.log(
      "ℹ️ [wholesaler-layout] 도매점 정보 없음, 온보딩 페이지로 리다이렉트",
    );
    redirect("/wholesaler-onboarding");
  }

  console.log("📊 [wholesaler-layout] 도매점 상태:", wholesaler.status);

  // 6. status = 'pending' 또는 'rejected'이면 승인 대기 페이지로 리다이렉트
  if (wholesaler.status === "pending" || wholesaler.status === "rejected") {
    console.log(
      "⏳ [wholesaler-layout] 승인 대기/반려 상태, 승인 대기 페이지로 리다이렉트",
    );
    redirect("/wholesaler/pending-approval");
  }

  // 7. status = 'suspended'이면 정지 페이지로 리다이렉트
  if (wholesaler.status === "suspended") {
    console.log(
      "🚫 [wholesaler-layout] 계정 정지 상태, 정지 페이지로 리다이렉트",
    );
    redirect("/wholesaler/suspended");
  }

  // 8. status = 'approved'인 경우에만 대시보드 접근 허용
  if (wholesaler.status !== "approved") {
    console.log("⚠️ [wholesaler-layout] 승인되지 않은 상태, 홈으로 리다이렉트");
    redirect("/");
  }

  console.log("✅ [wholesaler-layout] 승인된 도매점, 레이아웃 렌더링");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <WholesalerSidebar />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <WholesalerHeader />

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
