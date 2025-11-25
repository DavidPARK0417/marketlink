/**
 * @file app/(auth)/sign-in/retailer/page.tsx
 * @description 소매점 로그인 페이지
 *
 * 소매업자를 위한 커스텀 로그인 페이지입니다.
 * Clerk SignIn 컴포넌트를 사용하며, 역할 표시 배너를 포함합니다.
 *
 * 개선 사항 (v2):
 * - 로그인 후 대시보드로 바로 이동
 * - 회원가입 링크에 역할 구분 파라미터 추가
 */

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, UserPlus } from "lucide-react";
import SignInWithRedirect from "@/components/auth/sign-in-with-redirect";

export default function RetailerSignInPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-4 md:py-8 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md space-y-3">
        {/* 역할 안내 카드 */}
        <Card className="border-green-200">
          <CardHeader className="text-center py-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">소매업자 로그인</CardTitle>
            <CardDescription className="text-sm">
              다양한 도매업체의 상품을 발견하고 합리적인 가격으로 주문하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 로그인 폼 */}
        <div className="flex justify-center">
          <SignInWithRedirect
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
            path="/sign-in/retailer"
            signUpUrl="/sign-up?type=retailer"
            fallbackRedirectUrl="/retailer/dashboard"
            forceRedirectUrl="/retailer/dashboard"
            redirectToSignUpUrl="/sign-up?type=retailer"
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
              지금 바로 회원가입하고 소매 비즈니스를 시작하세요!
            </CardDescription>
            <Link href="/sign-up?type=retailer">
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                회원가입하기
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
