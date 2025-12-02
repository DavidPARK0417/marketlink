/**
 * @file app/admin/wholesalers/[id]/page.tsx
 * @description 도매사업자 상세 페이지
 *
 * 관리자가 도매사업자의 상세 정보를 확인하고 승인/반려 처리를 할 수 있는 페이지입니다.
 * 승인 대기 중인 도매사업자만 처리할 수 있으며, 이미 승인/반려된 경우 목록으로 리다이렉트됩니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 (requireAdmin)
 * 2. 도매사업자 ID로 전체 정보 조회 (wholesalers + profiles 조인)
 * 3. 사업자 정보 표시 (상호명, 사업자번호, 대표자, 연락처, 이메일, 주소, 계좌정보, 익명 코드, 신청일)
 * 4. 승인/반려 폼 컴포넌트 연결
 * 5. 이미 승인/반려된 경우 목록으로 리다이렉트
 * 6. 존재하지 않는 경우 404 처리
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/admin/WholesalerApprovalForm.tsx
 * - next/navigation (Link, redirect, notFound)
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import WholesalerApprovalForm from "@/components/admin/WholesalerApprovalForm";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface WholesalerDetail {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  phone: string;
  address: string;
  bank_account: string;
  anonymous_code: string;
  status: string;
  created_at: string;
  profiles: {
    email: string;
  };
}

export default async function WholesalerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  // Next.js 15 동적 라우트 파라미터 처리
  const { id } = await params;

  console.log("✅ [admin] 도매사업자 상세 페이지 접근", {
    email: profile.email,
    role: profile.role,
    wholesalerId: id,
  });

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // 도매사업자 ID로 전체 정보 조회
  // profiles 테이블과 조인하여 이메일 정보 포함
  const { data: wholesaler, error } = await supabase
    .from("wholesalers")
    .select(
      `
      id,
      business_name,
      business_number,
      representative,
      phone,
      address,
      bank_account,
      anonymous_code,
      status,
      created_at,
      profiles!inner (
        email
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ [admin] 도매사업자 조회 오류:", error);
    notFound();
  }

  if (!wholesaler) {
    console.log("❌ [admin] 도매사업자를 찾을 수 없음:", id);
    notFound();
  }

  // 타입 안전성을 위해 타입 단언
  const wholesalerData = wholesaler as unknown as WholesalerDetail;
  const profileData =
    typeof wholesalerData.profiles === "object" &&
    wholesalerData.profiles !== null &&
    "email" in wholesalerData.profiles
      ? (wholesalerData.profiles as { email: string })
      : null;

  // 이미 승인/반려된 경우 목록으로 리다이렉트
  if (wholesalerData.status !== "pending") {
    console.log("⚠️ [admin] 이미 처리된 도매사업자:", {
      id: wholesalerData.id,
      status: wholesalerData.status,
    });
    redirect("/admin/wholesalers/pending");
  }

  console.log("✅ [admin] 도매사업자 정보 조회 완료:", {
    id: wholesalerData.id,
    business_name: wholesalerData.business_name,
    status: wholesalerData.status,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <Link
          href="/admin/wholesalers/pending"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
        <p className="text-sm text-gray-500">
          도매사업자의 상세 정보를 확인하고 승인 또는 반려 처리를 진행하세요.
        </p>
      </div>

      {/* 사업자 정보 카드 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">사업자 정보</h2>
        </div>
        <div className="px-6 py-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">상호명</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wholesalerData.business_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">사업자번호</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wholesalerData.business_number}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">대표자</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wholesalerData.representative}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">연락처</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wholesalerData.phone}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">이메일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {profileData?.email || "이메일 정보 없음"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">주소</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wholesalerData.address}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">계좌정보</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wholesalerData.bank_account}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">익명 코드</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wholesalerData.anonymous_code}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">신청일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(wholesalerData.created_at).toLocaleString("ko-KR", {
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

      {/* 승인/반려 폼 */}
      <WholesalerApprovalForm
        wholesalerId={wholesalerData.id}
        adminId={profile.id}
      />
    </div>
  );
}

