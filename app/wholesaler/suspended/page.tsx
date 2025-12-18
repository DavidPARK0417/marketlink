/**
 * @file app/wholesaler/suspended/page.tsx
 * @description 도매점 계정 정지 페이지
 *
 * 계정이 정지된 도매점을 위한 안내 페이지입니다.
 * 정지 사유를 표시하고 고객센터 연락처를 제공합니다.
 *
 * 주요 기능:
 * 1. 계정 정지 안내 메시지
 * 2. 정지 사유 표시 (wholesalers.suspension_reason)
 * 3. 고객센터 연락처 표시
 * 4. 로그아웃 버튼
 * 5. 경고 아이콘 (XCircle)
 *
 * @dependencies
 * - @clerk/nextjs (useClerk, useUser)
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/ui/card.tsx, button.tsx
 * - lucide-react (아이콘)
 */

import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { SuspendedPageClient } from "./SuspendedPageClient";

// 인증 확인이 필요한 페이지이므로 동적 렌더링 강제
export const dynamic = "force-dynamic";

// 문의 정보 (환경 변수 또는 상수로 관리 가능)
const CONTACT_EMAIL = "contact@yourplatform.com";
const CONTACT_PHONE = "1588-XXXX";

export default async function SuspendedPage() {
  console.log("🔍 [suspended] 정지 페이지 접근 시작");

  // 인증 확인
  const profile = await getUserProfile();

  if (!profile) {
    console.log("⚠️ [suspended] 프로필 없음, 로그인 페이지로 리다이렉트");
    redirect("/sign-in");
  }

  // 도매점 역할 확인
  if (profile.role !== "wholesaler") {
    console.log("⚠️ [suspended] 도매점 역할 아님, 홈으로 리다이렉트");
    redirect("/");
  }

  // Supabase에서 도매점 정보 조회 (정지 사유 포함)
  const supabase = createClerkSupabaseClient();

  const { data: wholesaler, error } = await supabase
    .from("wholesalers")
    .select("id, status, suspension_reason")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("❌ [suspended] 도매점 정보 조회 오류:", error);
    redirect("/wholesaler-onboarding");
  }

  if (!wholesaler) {
    console.log("ℹ️ [suspended] 도매점 정보 없음, 온보딩 페이지로 리다이렉트");
    redirect("/wholesaler-onboarding");
  }

  // 정지 상태가 아니면 대시보드로 리다이렉트
  if (wholesaler.status !== "suspended") {
    console.log("ℹ️ [suspended] 정지 상태 아님, 대시보드로 리다이렉트");
    redirect("/wholesaler/dashboard");
  }

  console.log("✅ [suspended] 정지 상태 확인됨, 정지 페이지 렌더링");

  return (
    <SuspendedPageClient
      suspensionReason={wholesaler.suspension_reason}
      contactEmail={CONTACT_EMAIL}
      contactPhone={CONTACT_PHONE}
    />
  );
}
