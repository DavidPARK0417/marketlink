/**
 * @file app/page.tsx
 * @description 도매 프로젝트 루트 페이지 - 역할별 리다이렉트
 *
 * 이 프로젝트는 도매 사업자 전용 플랫폼입니다.
 * 로그인된 사용자는 역할에 따라 적절한 대시보드로,
 * 미로그인 사용자는 로그인 페이지로 리다이렉트합니다.
 *
 * @외부_진입점 wholesale.marketlink.com
 */

import { getUserProfile, redirectByRole } from "@/lib/clerk/auth";
import { redirect } from "next/navigation";

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
    console.log("🚫 [root] 소매점 계정이 도매점에 접근 시도 - 로그인 페이지로 리다이렉트");
    redirect("/sign-in/wholesaler?error=retailer");
  }

  // 로그인된 경우 역할별로 리다이렉트
  console.log("🏠 [root] 로그인된 사용자, 역할별 리다이렉트:", profile.role);
  redirectByRole(profile.role);
}
