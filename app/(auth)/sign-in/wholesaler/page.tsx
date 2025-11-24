/**
 * @file app/(auth)/sign-in/wholesaler/page.tsx
 * @description 도매점 로그인 페이지
 *
 * 도매업자를 위한 커스텀 로그인 페이지입니다.
 * Clerk SignIn 컴포넌트를 사용하며, 역할 표시 배너를 포함합니다.
 */

import { SignIn } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react";

export default function WholesalerSignInPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md">
        <Card className="mb-6 border-green-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">도매업자 로그인</CardTitle>
            <CardDescription>
              전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
            routing="path"
            path="/sign-in/wholesaler"
            signUpUrl="/sign-up"
            afterSignInUrl="/wholesaler/dashboard"
          />
        </div>
      </div>
    </div>
  );
}

