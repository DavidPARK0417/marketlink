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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import SignInWithRedirect from "@/components/auth/sign-in-with-redirect";

export default function RetailerSignInPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md">
        <Card className="mb-6 border-green-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">소매업자 로그인</CardTitle>
            <CardDescription>
              다양한 도매업체의 상품을 발견하고 합리적인 가격으로 주문하세요.
            </CardDescription>
          </CardHeader>
        </Card>
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
      </div>
    </div>
  );
}
