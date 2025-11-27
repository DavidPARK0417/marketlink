/**
 * @file app/page.tsx
 * @description 도매 프로젝트 루트 페이지 - 로그인으로 리다이렉트
 *
 * 이 프로젝트는 도매 사업자 전용 플랫폼입니다.
 * 메인 랜딩 페이지는 별도 도메인(www.marketlink.com)에서 관리되므로,
 * 루트 경로(/)에 접근 시 도매 로그인 페이지로 자동 리다이렉트합니다.
 *
 * @외부_진입점 wholesale.marketlink.com → /sign-in/wholesaler
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  // 도매 로그인 페이지로 리다이렉트
  redirect("/sign-in/wholesaler");
}
