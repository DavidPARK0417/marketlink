/**
 * @file page.tsx
 * @description 도매점 온보딩 페이지 (서버 컴포넌트)
 *
 * 도매점 회원가입 시 사업자 정보를 입력받는 페이지입니다.
 * 이미 등록된 도매점 정보가 있는 경우 승인 상태에 따라 리다이렉트합니다.
 *
 * 주요 기능:
 * 1. 서버 사이드에서 현재 사용자의 도매점 정보 확인
 * 2. role이 null이면 온보딩 폼 표시 (role은 폼 제출 시 설정됨)
 * 3. 이미 등록된 경우 승인 상태에 따라 분기:
 *    - pending/rejected: `/pending-approval`
 *    - approved: `/wholesaler`
 * 4. 신규 사용자: 온보딩 폼 표시
 *
 * 개선 사항 (v3):
 * - role이 null일 때 바로 온보딩 폼 표시
 * - role 설정은 createWholesaler 액션에서 처리
 * - 승인 상태별 리다이렉트 개선
 *
 * @dependencies
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/wholesaler/WholesalerOnboardingForm.tsx
 * - actions/wholesaler/create-wholesaler.ts (role 자동 설정)
 */

import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

// 인증 확인이 필요한 페이지이므로 동적 렌더링 강제
export const dynamic = "force-dynamic";
import WholesalerOnboardingForm from "./WholesalerOnboardingForm";
import WholesalerOnboardingClient from "./WholesalerOnboardingClient";

export default async function WholesalerOnboardingPage() {
  console.log("🔍 [wholesaler-onboarding] 페이지 접근");

  // 인증 확인
  const profile = await getUserProfile();

  // 프로필이 없으면 클라이언트 컴포넌트로 재시도 로직 처리
  if (!profile) {
    console.log(
      "⚠️ [wholesaler-onboarding] 프로필 없음, 클라이언트 재시도 로직 실행",
    );
    return <WholesalerOnboardingClient />;
  }

  // 🔍 온보딩 미완료 사용자 확인
  // role이 null이고 wholesalers가 없는 경우는 온보딩 미완료 사용자
  // 이 경우는 중복 가입이 아니라 온보딩 폼을 표시해야 함
  const wholesalersCount = profile.wholesalers?.length ?? 0;
  const isOnboardingIncomplete = profile.role === null && wholesalersCount === 0;

  console.log("🔍 [wholesaler-onboarding] 사용자 상태 확인:", {
    profileId: profile.id,
    role: profile.role,
    wholesalersCount,
    isOnboardingIncomplete,
  });

  // 온보딩 미완료 사용자는 중복 가입으로 처리하지 않고 온보딩 폼 표시
  // 아래 로직에서 처리되므로 여기서는 건너뜀

  // 소매점 계정의 도매점 회원가입 시도 차단
  if (profile.role === "retailer") {
    console.log("⚠️ [wholesaler-onboarding] 소매점 계정의 도매점 회원가입 시도 감지");
    redirect("/sign-in/wholesaler?error=retailer");
  }

  // role이 설정되어 있지만 wholesaler가 아닌 경우 (admin 등)
  if (profile.role !== null && profile.role !== "wholesaler") {
    console.log("⚠️ [wholesaler-onboarding] 이미 다른 역할이 설정된 계정");
    redirect("/");
  }

  // role이 null인 경우 온보딩 진행 (role은 createWholesaler 액션에서 설정됨)
  if (profile.role === null) {
    console.log("📝 [wholesaler-onboarding] 역할 없음, 온보딩 진행");
  }

  // 이미 등록된 도매점 정보 확인
  const supabase = createClerkSupabaseClient();

  const { data: existingWholesaler, error } = await supabase
    .from("wholesalers")
    .select(
      "id, status, business_name, business_number, representative, phone, address, address_detail, bank_account",
    )
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("❌ [wholesaler-onboarding] 도매점 정보 조회 오류:", error);
    // 에러가 발생해도 폼을 보여줌 (사용자가 다시 시도할 수 있도록)
  }

  // 이미 등록된 도매점 정보가 있는 경우 상태별 처리
  if (existingWholesaler) {
    console.log(
      "✅ [wholesaler-onboarding] 이미 등록된 도매점:",
      existingWholesaler.status,
    );

    switch (existingWholesaler.status) {
      case "approved":
        console.log("→ 승인됨: 대시보드로 이동");
        redirect("/wholesaler");
      case "pending":
      case "rejected":
        // pending/rejected 상태인 경우 이전 데이터를 폼에 채워서 표시
        console.log("→ 승인 대기/반려: 이전 데이터로 폼 표시");

        // bank_account 파싱 (은행명과 계좌번호 분리)
        const bankAccountParts = existingWholesaler.bank_account
          ? existingWholesaler.bank_account.split(" ")
          : [];
        const bankName = bankAccountParts[0] || "";
        const bankAccountNumber = bankAccountParts.slice(1).join(" ") || "";

        // 전화번호 포맷팅 (하이픈 추가)
        const phoneDigits = existingWholesaler.phone?.replace(/\D/g, "") || "";
        let formattedPhone = existingWholesaler.phone || "";
        if (phoneDigits.length === 11) {
          formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(
            3,
            7,
          )}-${phoneDigits.slice(7)}`;
        } else if (phoneDigits.length === 10) {
          formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(
            3,
            6,
          )}-${phoneDigits.slice(6)}`;
        }

        const previousData = {
          business_name: existingWholesaler.business_name || "",
          business_number: existingWholesaler.business_number || "",
          representative: existingWholesaler.representative || "",
          phone: formattedPhone,
          address: existingWholesaler.address || "",
          address_detail: existingWholesaler.address_detail || "",
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
        };

        return (
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <WholesalerOnboardingForm previousData={previousData} />
            </div>
          </div>
        );
      default:
        console.log("→ 알 수 없는 상태, 승인 대기 페이지로 이동");
        redirect("/pending-approval");
    }
  }

  console.log("📝 [wholesaler-onboarding] 신규 사용자, 온보딩 폼 표시");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <WholesalerOnboardingForm />
      </div>
    </div>
  );
}
