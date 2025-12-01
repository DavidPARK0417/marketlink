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
 * 6. 소매점 계정의 도매점 회원가입 시도 차단
 *
 * @dependencies
 * - @clerk/nextjs (SignIn)
 * - components/auth/sign-in-with-redirect
 * - components/auth/retailer-signup-block-modal
 *
 * @see {@link https://clerk.com/docs/components/sign-in/sign-in} - Clerk SignIn 문서
 */

import SignInWithRedirect from "@/components/auth/sign-in-with-redirect";
import SignInCreateClient from "./SignInCreateClient";
import { getUserProfile } from "@/lib/clerk/auth";
import { redirect } from "next/navigation";

interface SignInPageProps {
  searchParams: Promise<{ redirect_url?: string }>;
  params: Promise<{ rest?: string[] }>;
}

export default async function SignInPage({ 
  searchParams,
  params 
}: SignInPageProps) {
  const searchParamsResolved = await searchParams;
  const paramsResolved = await params;
  const redirectUrl = searchParamsResolved.redirect_url || "";
  
  // URL 디코딩 (중첩 인코딩 처리)
  let decodedRedirectUrl = redirectUrl;
  try {
    decodedRedirectUrl = decodeURIComponent(redirectUrl);
    // 중첩 인코딩된 경우 한 번 더 디코딩
    if (decodedRedirectUrl.includes("%")) {
      decodedRedirectUrl = decodeURIComponent(decodedRedirectUrl);
    }
  } catch (e) {
    // 디코딩 실패 시 원본 사용
    console.warn("⚠️ [sign-in] URL 디코딩 실패:", e);
  }
  
  // /sign-in/create 경로인지 확인 (Clerk 내부 라우팅)
  const isCreatePath = paramsResolved.rest?.includes("create") || false;
  
  // redirect_url에 wholesaler-onboarding이 포함되어 있는지 확인 (디코딩된 URL 사용)
  const hasWholesalerOnboarding = decodedRedirectUrl.includes("wholesaler-onboarding");
  
  // redirect_url에 wholesaler-onboarding이 포함되어 있고, /sign-in/create 경로이면
  // 소매점 계정의 도매점 회원가입 시도로 판단
  const isRetailerSignupAttempt = isCreatePath && hasWholesalerOnboarding;

  console.log("🔍 [sign-in] 경로 확인:", {
    isCreatePath,
    redirectUrl,
    decodedRedirectUrl,
    hasWholesalerOnboarding,
    isRetailerSignupAttempt,
  });

  // 🆕 role이 null인 사용자가 도매점 온보딩을 시도하는 경우 처리
  if (isCreatePath && hasWholesalerOnboarding) {
    console.log("🔍 [sign-in] /sign-in/create 경로 + wholesaler-onboarding 감지 - 프로필 확인 시작");
    const profile = await getUserProfile();
    
    console.log("🔍 [sign-in] 프로필 확인 결과:", {
      hasProfile: !!profile,
      role: profile?.role,
    });
    
    // 프로필이 없거나 role이 null인 경우도 온보딩으로 (신규 사용자)
    if (!profile || profile.role === null) {
      console.log("📝 [sign-in] 프로필 없음 또는 role이 null - 온보딩으로 리다이렉트");
      redirect("/wholesaler-onboarding");
    }
    
    // 소매점 계정의 도매점 회원가입 시도 차단
    if (profile && profile.role === "retailer") {
      console.log("🚫 [sign-in] 소매점 계정의 도매점 회원가입 시도 감지 - 모달 표시");
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <SignInCreateClient />
        </div>
      );
    }
  }

  // URL 파라미터를 확인하여 도매업자 관련인지 판단 (디코딩된 URL 사용)
  const isWholesalerFlow = decodedRedirectUrl.includes("/wholesaler") || 
                          decodedRedirectUrl.includes("wholesaler-onboarding");
  
  // URL 파라미터를 확인하여 소매업자 관련인지 판단 (디코딩된 URL 사용)
  const isRetailerFlow = decodedRedirectUrl.includes("/retailer") || 
                         decodedRedirectUrl.includes("/retailer/dashboard");

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

  // 소매업자 관련이면 소매업자 로그인 설정 사용
  if (isRetailerFlow) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <SignInWithRedirect
          appearance={{
            elements: {},
          }}
          path="/sign-in"
          signUpUrl="/sign-up?type=retailer"
          fallbackRedirectUrl="/retailer/dashboard"
          forceRedirectUrl="/retailer/dashboard"
          redirectToSignUpUrl="/sign-up?type=retailer"
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
