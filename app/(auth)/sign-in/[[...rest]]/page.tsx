/**
 * @file app/(auth)/sign-in/[[...rest]]/page.tsx
 * @description 로그인 페이지 (Catch-all route)
 *
 * Clerk를 사용한 로그인 페이지입니다.
 * Catch-all route로 설정하여 Clerk의 내부 라우팅을 지원합니다.
 * 인증되지 않은 사용자가 보호된 페이지에 접근할 때 자동으로 이 페이지로 리다이렉트됩니다.
 *
 * 주요 기능:
 * 1. Clerk SignIn 컴포넌트를 통한 로그인 처리
 * 2. 로그인 성공 시 홈 페이지로 리다이렉트 (역할 확인 후 적절한 대시보드로 이동)
 * 3. Catch-all route로 Clerk 내부 라우팅 지원
 * 4. URL 파라미터를 확인하여 도매업자 관련이면 적절한 설정 적용
 * 5. 가입되지 않은 계정 에러 감지 및 모달 표시
 *
 * @dependencies
 * - @clerk/nextjs (SignIn)
 * - components/auth/sign-in-with-redirect
 *
 * @see {@link https://clerk.com/docs/components/sign-in/sign-in} - Clerk SignIn 문서
 */

import SignInWithRedirect from "@/components/auth/sign-in-with-redirect";

interface SignInPageProps {
  searchParams: Promise<{ redirect_url?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectUrl = params.redirect_url || "";

  // URL 파라미터를 확인하여 도매업자 관련인지 판단
  const isWholesalerFlow = redirectUrl.includes("/wholesaler") || 
                          redirectUrl.includes("wholesaler-onboarding");

  // 도매업자 관련이면 도매업자 로그인 설정 사용
  if (isWholesalerFlow) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <SignInWithRedirect
          appearance={{
            elements: {},
          }}
          path="/sign-in"
          signUpUrl="/sign-up?type=wholesaler"
          fallbackRedirectUrl="/wholesaler-onboarding"
          forceRedirectUrl="/wholesaler-onboarding"
          redirectToSignUpUrl="/sign-up?type=wholesaler"
          onboardingUrl="/wholesaler-onboarding"
        />
      </div>
    );
  }

  // 일반 로그인 (기본 설정)
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <SignInWithRedirect
        appearance={{
          elements: {},
        }}
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        redirectToSignUpUrl="/sign-up"
      />
    </div>
  );
}
