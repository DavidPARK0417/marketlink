/**
 * @file app/admin/retailers/[id]/page.tsx
 * @description 소매사업자 상세 페이지
 *
 * 관리자가 소매사업자의 상세 정보를 확인하고 정지/해제 처리를 할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 (requireAdmin)
 * 2. 소매사업자 ID로 전체 정보 조회 (retailers + profiles 조인)
 * 3. 사업자 정보 표시 (상호명, 연락처, 이메일, 주소, 익명 코드, 가입일)
 * 4. 정지/해제 폼 컴포넌트 연결
 * 5. 존재하지 않는 경우 404 처리
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/admin/RetailerSuspensionForm.tsx
 * - next/navigation (Link, notFound)
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import RetailerSuspensionForm from "@/components/admin/RetailerSuspensionForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface RetailerDetail {
  id: string;
  business_name: string;
  phone: string;
  address: string;
  address_detail: string | null;
  anonymous_code: string | null;
  status: string;
  suspension_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
  };
}

export default async function RetailerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  // Next.js 15 동적 라우트 파라미터 처리
  const { id } = await params;

  console.log("✅ [admin] 소매사업자 상세 페이지 접근", {
    email: profile.email,
    role: profile.role,
    retailerId: id,
  });

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // 소매사업자 ID로 전체 정보 조회
  // profiles 테이블과 조인하여 이메일 정보 포함
  const { data: retailer, error } = await supabase
    .from("retailers")
    .select(
      `
      id,
      business_name,
      phone,
      address,
      address_detail,
      anonymous_code,
      status,
      suspension_reason,
      created_at,
      profiles!inner (
        email
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ [admin] 소매사업자 조회 오류:", error);
    notFound();
  }

  if (!retailer) {
    console.log("❌ [admin] 소매사업자를 찾을 수 없음:", id);
    notFound();
  }

  // 타입 안전성을 위해 타입 단언
  const retailerData = retailer as unknown as RetailerDetail;
  const profileData =
    typeof retailerData.profiles === "object" &&
    retailerData.profiles !== null &&
    "email" in retailerData.profiles
      ? (retailerData.profiles as { email: string })
      : null;

  console.log("✅ [admin] 소매사업자 정보 조회 완료:", {
    id: retailerData.id,
    business_name: retailerData.business_name,
    status: retailerData.status,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">
          소매사업자 상세 정보
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          소매사업자의 상세 정보를 확인하고 계정 정지/해제 처리를 진행하세요.
        </p>
      </div>

      {/* 사업자 정보 카드 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
            사업자 정보
          </h2>
        </div>
        <div className="px-6 py-6 bg-white dark:bg-gray-900">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                상호명
              </dt>
              <dd className="mt-1 text-sm text-foreground dark:text-foreground">
                {retailerData.business_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                연락처
              </dt>
              <dd className="mt-1 text-sm text-foreground dark:text-foreground">
                {retailerData.phone}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                이메일
              </dt>
              <dd className="mt-1 text-sm text-foreground dark:text-foreground">
                {profileData?.email || "이메일 정보 없음"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                주소
              </dt>
              <dd className="mt-1 text-sm text-foreground dark:text-foreground">
                {retailerData.address}
                {retailerData.address_detail && ` ${retailerData.address_detail}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                익명 코드
              </dt>
              <dd className="mt-1 text-sm text-foreground dark:text-foreground">
                {retailerData.anonymous_code || "없음"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                계정 상태
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    retailerData.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                  }`}
                >
                  {retailerData.status === "active" ? "활성" : "정지"}
                </span>
              </dd>
            </div>
            {retailerData.status === "suspended" && retailerData.suspension_reason && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  정지 사유
                </dt>
                <dd className="mt-1 text-sm text-foreground dark:text-foreground bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  {retailerData.suspension_reason}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                가입일
              </dt>
              <dd className="mt-1 text-sm text-foreground dark:text-foreground">
                {new Date(retailerData.created_at).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 정지/해제 폼 */}
      <RetailerSuspensionForm
        retailerId={retailerData.id}
        currentStatus={retailerData.status}
      />
    </div>
  );
}

