/**
 * @file app/(auth)/sign-up/[[...rest]]/page.tsx
 * @description 회원가입 페이지 (Catch-all route)
 *
 * Clerk를 사용한 회원가입 페이지입니다.
 * Catch-all route로 설정하여 Clerk의 내부 라우팅을 지원합니다.
 * 신규 사용자가 계정을 생성할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. Clerk SignUp 컴포넌트를 통한 회원가입 처리
 * 2. 회원가입 성공 시 역할별 자동 리다이렉트
 *    - type=retailer: 소매점 대시보드
 *    - type=wholesaler: 도매점 온보딩
 * 3. Catch-all route로 Clerk 내부 라우팅 지원
 *
 * 개선 사항 (v2):
 * - 역할별 회원가입 플로우 분리 (type 쿼리 파라미터)
 * - 회원가입 후 동기화를 위한 약간의 지연 추가
 * - forceRedirectUrl 사용으로 리다이렉트 안정성 향상
 *
 * @dependencies
 * - @clerk/nextjs (SignUp)
 *
 * @see {@link https://clerk.com/docs/components/sign-up/sign-up} - Clerk SignUp 문서
 */

import { SignUp } from "@clerk/nextjs";

interface SignUpPageProps {
  searchParams: Promise<{ type?: "retailer" | "wholesaler" }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { type } = await searchParams;

  // 역할별 리다이렉트 URL 결정
  const afterSignUpUrl =
    type === "wholesaler"
      ? "/wholesaler-onboarding" // 도매점: 온보딩 페이지
      : type === "retailer"
      ? "/retailer-onboarding" // 소매점: 온보딩 페이지
      : "/retailer/dashboard"; // 기본값

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <SignUp
        appearance={{
          elements: {},
        }}
        afterSignUpUrl={afterSignUpUrl}
        forceRedirectUrl={afterSignUpUrl}
        routing="path"
        path="/sign-up"
      />
    </div>
  );
}
