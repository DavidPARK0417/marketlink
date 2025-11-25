/**
 * @file page.tsx
 * @description 소매점 온보딩 페이지 (서버 컴포넌트)
 *
 * 소매점 회원가입 시 기본 정보를 입력받는 페이지입니다.
 * 이미 등록된 소매점 정보가 있는 경우 대시보드로 리다이렉트합니다.
 *
 * 주요 기능:
 * 1. 서버 사이드에서 현재 사용자의 소매점 정보 확인
 * 2. role이 null이면 온보딩 폼 표시 (role은 폼 제출 시 설정됨)
 * 3. 이미 등록된 경우 대시보드로 리다이렉트
 * 4. 신규 사용자: 온보딩 폼 표시
 *
 * @dependencies
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - app/(auth)/retailer-onboarding/RetailerOnboardingForm.tsx
 * - actions/retailer/create-retailer.ts (role 자동 설정)
 */

import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import RetailerOnboardingForm from "./RetailerOnboardingForm";
import RetailerOnboardingClient from "./RetailerOnboardingClient";

export default async function RetailerOnboardingPage() {
  console.log("🔍 [retailer-onboarding] 페이지 접근");

  // 인증 확인
  const profile = await getUserProfile();

  // 프로필이 없으면 클라이언트 컴포넌트로 재시도 로직 처리
  if (!profile) {
    console.log("⚠️ [retailer-onboarding] 프로필 없음, 클라이언트 재시도 로직 실행");
    return <RetailerOnboardingClient />;
  }

  // 역할 확인: role이 null이면 온보딩 진행, null이 아니고 retailer가 아니면 메인 페이지로
  if (profile.role === null) {
    console.log("📝 [retailer-onboarding] 역할 없음, 온보딩 진행");
    // role은 createRetailer 액션에서 설정됨
  } else if (profile.role !== "retailer") {
    console.log(
      "⚠️ [retailer-onboarding] 소매점 역할 아님 (이미 다른 역할 설정됨), 메인페이지로 리다이렉트",
    );
    redirect("/");
  }

  // 이미 등록된 소매점 정보 확인
  const supabase = createClerkSupabaseClient();

  const { data: existingRetailer, error } = await supabase
    .from("retailers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("❌ [retailer-onboarding] 소매점 정보 조회 오류:", error);
    // 에러가 발생해도 폼을 보여줌 (사용자가 다시 시도할 수 있도록)
  }

  // 이미 등록된 소매점 정보가 있는 경우 대시보드로 리다이렉트
  if (existingRetailer) {
    console.log("✅ [retailer-onboarding] 이미 등록된 소매점:", existingRetailer.id);
    console.log("→ 대시보드로 이동");
    redirect("/retailer/dashboard");
  }

  console.log("📝 [retailer-onboarding] 신규 사용자, 온보딩 폼 표시");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <RetailerOnboardingForm />
      </div>
    </div>
  );
}

