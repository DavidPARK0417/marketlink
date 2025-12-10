/**
 * @file app/admin/dashboard/page.tsx
 * @description 관리자 대시보드 페이지
 *
 * 관리자 대시보드 메인 페이지입니다.
 * 관리자 권한이 있는 사용자만 접근할 수 있으며,
 * 주요 관리 기능으로의 링크를 제공합니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 자동 확인 (layout.tsx에서 처리)
 * 2. 관리 기능 카드 링크
 * 3. 간단한 대시보드 정보 표시
 *
 * @dependencies
 * - app/admin/layout.tsx (권한 체크)
 */

import Link from "next/link";
import { requireAdmin } from "@/lib/clerk/auth";
import { Store, ShoppingBag, Shield } from "lucide-react";

export default async function AdminDashboardPage() {
  // 관리자 권한 확인 (레이아웃에서도 확인하지만, 페이지에서도 명시적으로 확인)
  const profile = await requireAdmin();

  console.log("✅ [admin] 대시보드 페이지: 관리자 대시보드 접근", {
    email: profile.email,
    role: profile.role,
  });

  return (
    <div className="space-y-8 transition-colors duration-200">
      {/* 페이지 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">관리자 대시보드</h1>
        <p className="text-sm text-muted-foreground">
          주요 관리 기능을 한눈에 확인하고 필요한 페이지로 이동하세요.
        </p>
      </div>

      {/* 페이지 전환 섹션 */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          페이지 전환
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 관리자 대시보드 (현재 페이지) */}
          <div className="p-6 bg-red-50 dark:bg-red-950/50 rounded-lg shadow-sm border-2 border-red-200 dark:border-red-700 transition-colors duration-200">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500 dark:bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground dark:text-foreground">
                  관리자 대시보드
                </h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                  현재 페이지
                </p>
              </div>
            </div>
          </div>

          {/* 도매 페이지 */}
          <Link
            href="/wholesaler/dashboard"
            className="block p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-400 transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-[#10B981] dark:text-emerald-200" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground dark:text-foreground">
                  도매 페이지
                </h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                  도매점 관리 화면으로 이동
                </p>
              </div>
            </div>
          </Link>

          {/* 소매 페이지 */}
          <Link
            href="https://farmtobiz-retailer.vercel.app/retailer/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-green-300 dark:hover:border-green-400 transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-600 dark:text-emerald-200" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground dark:text-foreground">
                  소매 페이지
                </h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                  소매점 관리 화면으로 이동
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 관리 기능 카드 */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          관리 기능
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 도매 승인 대기 카드 */}
        <Link
          href="/admin/wholesalers/pending"
          className="block p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#10B981] dark:text-emerald-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
                도매 승인 대기
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                승인 대기 중인 도매사업자 목록
              </p>
            </div>
          </div>
        </Link>

        {/* 감사 로그 카드 */}
        <Link
          href="/admin/audit-logs"
          className="block p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-emerald-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">감사 로그</h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                관리자 액션 기록 조회
              </p>
            </div>
          </div>
        </Link>

        </div>
      </div>

      {/* 현재 관리자 정보 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">
          현재 관리자 정보
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">이메일:</span>
            <span className="text-sm text-foreground dark:text-foreground">{profile.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">역할:</span>
            <span className="text-sm text-foreground dark:text-foreground">{profile.role}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">상태:</span>
            <span className="text-sm text-foreground dark:text-foreground">{profile.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

