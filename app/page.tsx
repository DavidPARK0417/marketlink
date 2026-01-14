/**
 * @file app/page.tsx
 * @description 도매 프로젝트 루트 페이지 - 역할별 리다이렉트
 *
 * 이 프로젝트는 도매 사업자 전용 플랫폼입니다.
 * 로그인된 사용자는 역할에 따라 적절한 대시보드로,
 * 미로그인 사용자는 로그인 페이지로 리다이렉트합니다.
 *
 * @외부_진입점 wholesale.farmtobiz.com
 */

import type { Metadata } from "next";
import { getUserProfile, redirectByRole } from "@/lib/clerk/auth";
import PendingApprovalPage from "./(auth)/pending-approval/page";
import { redirect } from "next/navigation";

// 인증 확인이 필요한 페이지이므로 동적 렌더링 강제
export const dynamic = "force-dynamic";

/**
 * 루트 페이지는 인증이 필요하므로 검색 엔진 인덱싱 방지
 * 실제 공개 콘텐츠는 /privacy, /terms 페이지에 있습니다.
 */
export const metadata: Metadata = {
  title: "FarmToBiz - 도매 사업자 전용 플랫폼",
  description: "도매 사업자 전용 플랫폼",
  robots: "noindex, nofollow",
};

export default async function RootPage() {
  console.log("🏠 [root] 루트 페이지 접근");

  // 사용자 프로필 확인
  const profile = await getUserProfile();

  // 로그인되지 않은 경우 로그인 페이지로
  if (!profile) {
    console.log("🏠 [root] 미로그인 사용자 - 로그인 페이지로 리다이렉트");
    redirect("/sign-in/wholesaler");
  }

  // 🚨 소매점 계정이 도매점에 접근하려는 경우 차단
  if (profile.role === "retailer") {
    console.log(
      "🚫 [root] 소매점 계정이 도매점에 접근 시도 - 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in/wholesaler?error=retailer");
  }

  // 로그인된 경우 역할별로 리다이렉트
  console.log("🏠 [root] 로그인된 사용자, 역할별 리다이렉트:", profile.role);

  // 🆕 role이 null인 경우: 온보딩을 완료하지 않은 사용자
  // 온보딩 페이지로 리다이렉트하여 무한 루프 방지
  if (profile.role === null) {
    const wholesalersCount = profile.wholesalers?.length ?? 0;
    console.log("📝 [root] 역할 없음, 온보딩 완료 여부 확인:", {
      role: profile.role,
      wholesalersCount,
    });
    
    // 온보딩을 완료하지 않은 경우 온보딩 페이지로 리다이렉트
    if (wholesalersCount === 0) {
      console.log("📝 [root] 온보딩 미완료 사용자 - 온보딩 페이지로 리다이렉트");
      redirect("/wholesaler-onboarding");
    }
  }

  // 도매 계정이지만 승인 대기 상태면 루트에서 Pending 모달만 띄우고 머무름
  const wholesalerStatus = profile.wholesalers?.[0]?.status;
  if (profile.role === "wholesaler" && wholesalerStatus === "pending") {
    console.log("⏳ [root] 도매 승인 대기 상태 - 루트에서 Pending 모달 표시");
    return <PendingApprovalPage />;
  }

  redirectByRole(profile.role);
}
