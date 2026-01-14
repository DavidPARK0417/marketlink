/**
 * @file app/(auth)/sign-in/wholesaler/page.tsx
 * @description 도매점 로그인 페이지
 *
 * 도매업자를 위한 커스텀 로그인 페이지입니다.
 * Clerk SignIn 컴포넌트를 사용하며, 역할 표시 배너와 회원가입 안내를 포함합니다.
 *
 * 개선 사항 (v2):
 * - 로그인 후 루트 페이지로 이동 (역할 확인 후 적절한 대시보드로 리다이렉트)
 * - 회원가입 링크에 역할 구분 파라미터 추가
 * - 소매점 계정 차단 모달 추가
 * - 관리자 계정은 관리자 대시보드로 자동 리다이렉트
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, UserPlus } from "lucide-react";
import SignInWithRedirect from "@/components/auth/sign-in-with-redirect";
import RetailerBlockModal from "@/components/auth/retailer-block-modal";
import { getUserProfile } from "@/lib/clerk/auth";
import { redirect } from "next/navigation";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://wholesale.farmtobiz.com";

/**
 * 로그인 페이지는 공개 페이지이지만 개인정보 입력 페이지이므로
 * 검색 엔진 인덱싱을 제한하는 것이 좋습니다.
 */
export const metadata: Metadata = {
  title: "도매업자 로그인 - FarmToBiz",
  description:
    "FarmToBiz 도매업자 로그인 페이지 - 전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요.",
  robots: {
    index: true, // 로그인 페이지는 검색 가능하도록 설정
    follow: true,
  },
  alternates: {
    canonical: `${SITE_URL}/sign-in/wholesaler`,
  },
};

interface WholesalerSignInPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function WholesalerSignInPage({
  searchParams,
}: WholesalerSignInPageProps) {
  const params = await searchParams;
  const showRetailerBlockModal = params.error === "retailer";
  
  // 🚨 페이지 렌더링 확인
  console.log("=".repeat(80));
  console.log("🚨🚨🚨 [WholesalerSignInPage] 페이지가 렌더링되었습니다!");
  console.log("=".repeat(80));

  // 🆕 이미 로그인된 사용자인지 확인
  // role이 null이고 온보딩을 완료하지 않은 경우 온보딩 페이지로 리다이렉트
  const profile = await getUserProfile();
  if (profile) {
    console.log("🔍 [sign-in/wholesaler] 이미 로그인된 사용자 확인:", {
      role: profile.role,
      wholesalersCount: profile.wholesalers?.length ?? 0,
    });

    // role이 null이고 온보딩을 완료하지 않은 경우 온보딩 페이지로 리다이렉트
    if (profile.role === null) {
      const wholesalersCount = profile.wholesalers?.length ?? 0;
      if (wholesalersCount === 0) {
        console.log("📝 [sign-in/wholesaler] 온보딩 미완료 사용자 - 온보딩 페이지로 리다이렉트");
        redirect("/wholesaler-onboarding");
      }
    }

    // 소매점 계정인 경우 에러 모달 표시 (이미 showRetailerBlockModal로 처리됨)
    if (profile.role === "retailer" && !showRetailerBlockModal) {
      console.log("🚫 [sign-in/wholesaler] 소매점 계정 감지 - 에러 모달 표시");
      redirect("/sign-in/wholesaler?error=retailer");
    }

    // 이미 역할이 있는 경우 (wholesaler, admin 등) 루트로 리다이렉트
    // 루트 페이지에서 역할별로 적절한 대시보드로 리다이렉트됨
    if (profile.role !== null && profile.role !== "retailer") {
      console.log("✅ [sign-in/wholesaler] 이미 역할이 있는 사용자 - 루트로 리다이렉트");
      redirect("/");
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-4 md:py-8 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
      <div className="w-full max-w-md space-y-3">
        {/* 역할 안내 카드 */}
        <Card className="border-green-200 dark:border-green-500/50 bg-white dark:bg-gray-900 transition-colors duration-200">
          <CardHeader className="text-center py-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors duration-200">
              <Package className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-50 transition-colors duration-200">
              도매업자 로그인
            </CardTitle>
            <CardDescription className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
              전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 로그인 폼 - error=retailer일 때는 SignIn 컴포넌트를 렌더링하지 않음 (무한 루프 방지) */}
        {!showRetailerBlockModal && (
          <>
            <div className="flex justify-center">
              <SignInWithRedirect
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-lg",
                  },
                }}
                path="/sign-in/wholesaler"
                signUpUrl="/sign-up?type=wholesaler"
                fallbackRedirectUrl="/"
                forceRedirectUrl="/"
                redirectToSignUpUrl="/sign-up?type=wholesaler"
                onboardingUrl="/wholesaler-onboarding"
              />
            </div>

            {/* 신규 회원 안내 카드 */}
            <Card className="border-emerald-200 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-gray-900 transition-colors duration-200">
              <CardHeader className="text-center py-3">
                <div className="flex items-center justify-center gap-2 mb-1 text-emerald-900 dark:text-white transition-colors duration-200">
                  <UserPlus className="w-4 h-4 text-emerald-700 dark:text-emerald-300 transition-colors duration-200" />
                  <CardTitle className="text-base text-emerald-900 dark:text-white transition-colors duration-200">
                    아직 회원이 아니신가요?
                  </CardTitle>
                </div>
                <CardDescription className="text-emerald-900 dark:text-white font-medium dark:font-semibold mb-2 text-sm transition-colors duration-200">
                  지금 바로 회원가입하고 도매 비즈니스를 시작하세요!
                </CardDescription>
                <Link href="/sign-up?type=wholesaler">
                  <Button
                    variant="default"
                    className="w-full bg-[#10B981] hover:bg-[#059669] dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors duration-200"
                  >
                    회원가입하기
                  </Button>
                </Link>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      {/* 소매점 계정 차단 모달 */}
      {showRetailerBlockModal && <RetailerBlockModal />}
    </div>
  );
}
