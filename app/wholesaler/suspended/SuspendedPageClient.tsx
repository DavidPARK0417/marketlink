/**
 * @file app/wholesaler/suspended/SuspendedPageClient.tsx
 * @description 도매점 계정 정지 페이지 클라이언트 컴포넌트
 *
 * 계정 정지 안내 UI를 렌더링하는 클라이언트 컴포넌트입니다.
 * 로그아웃 기능을 포함합니다.
 *
 * @dependencies
 * - @clerk/nextjs (useClerk)
 * - next/navigation (useRouter)
 * - components/ui/card.tsx, button.tsx
 * - lucide-react (아이콘)
 */

"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Mail, Phone, LogOut } from "lucide-react";

interface SuspendedPageClientProps {
  rejectionReason: string | null;
  contactEmail: string;
  contactPhone: string;
}

export function SuspendedPageClient({
  rejectionReason,
  contactEmail,
  contactPhone,
}: SuspendedPageClientProps) {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    console.log("🚪 [suspended] 로그아웃 시작");
    await signOut();
    router.push("/sign-in/wholesaler");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">
            계정이 정지되었습니다
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 정지 안내 메시지 */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300">
              죄송합니다. 귀하의 계정이 정지되었습니다. 계정 정지 사유를
              확인하시고, 고객센터로 문의해주세요.
            </p>
          </div>

          {/* 정지 사유 */}
          {rejectionReason && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">정지 사유</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {rejectionReason}
              </p>
            </div>
          )}

          {/* 고객센터 연락처 */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">고객센터 문의</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 underline"
                >
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <a
                  href={`tel:${contactPhone}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 underline"
                >
                  {contactPhone}
                </a>
              </div>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
