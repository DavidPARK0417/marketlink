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

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-4 md:py-8 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md space-y-3">
        {/* 역할 안내 카드 */}
        <Card className="border-green-200">
          <CardHeader className="text-center py-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">도매업자 로그인</CardTitle>
            <CardDescription className="text-sm">
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
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="text-center py-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-base">
                    아직 회원이 아니신가요?
                  </CardTitle>
                </div>
                <CardDescription className="text-blue-900/70 mb-2 text-sm">
                  지금 바로 회원가입하고 도매 비즈니스를 시작하세요!
                </CardDescription>
                <Link href="/sign-up?type=wholesaler">
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
