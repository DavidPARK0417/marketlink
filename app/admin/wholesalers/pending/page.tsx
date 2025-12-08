/**
 * @file app/admin/wholesalers/pending/page.tsx
 * @description 도매 승인 대기 목록 페이지
 *
 * 승인 대기 중인 도매사업자 목록을 조회하고 표시하는 관리자 페이지입니다.
 * 관리자만 접근할 수 있으며, 승인 대기 중인 도매사업자 정보를 테이블 형태로 표시합니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 (requireAdmin)
 * 2. status='pending'인 도매사업자 목록 조회
 * 3. profiles 테이블과 조인하여 이메일 정보 포함
 * 4. 테이블 형태로 표시 (상호명, 사업자번호, 대표자, 이메일, 신청일)
 * 5. 각 행 클릭 시 상세 페이지로 이동
 * 6. 빈 목록 처리
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - next/navigation (Link)
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import WholesalerTableRow from "@/components/admin/WholesalerTableRow";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";

export const dynamic = "force-dynamic";

interface PendingWholesaler {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  created_at: string;
  profiles: {
    email: string;
  };
}

export default async function PendingWholesalersPage() {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin] 도매 승인 대기 목록 페이지 접근", {
    email: profile.email,
    role: profile.role,
  });

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // 승인 대기 중인 도매사업자 목록 조회
  // profiles 테이블과 조인하여 이메일 정보 포함
  const { data: wholesalers, error } = await supabase
    .from("wholesalers")
    .select(
      `
      id,
      business_name,
      business_number,
      representative,
      created_at,
      profiles!inner (
        email
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [admin] 도매 승인 대기 목록 조회 오류:", error);
  }

  console.log("📊 [admin] 승인 대기 도매사업자 수:", wholesalers?.length || 0);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">도매 승인 대기</h1>
        <p className="text-sm text-muted-foreground">
          승인 대기 중인 도매사업자 목록입니다. 상세 정보를 확인하고 승인 또는 반려 처리를 진행하세요.
        </p>
      </div>

      {/* 테이블 영역 */}
      {wholesalers && wholesalers.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상호명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사업자번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대표자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wholesalers.map((wholesaler) => {
                  // 타입 안전성을 위해 타입 단언
                  const wholesalerData = wholesaler as unknown as PendingWholesaler;
                  const profileData =
                    typeof wholesalerData.profiles === "object" &&
                    wholesalerData.profiles !== null &&
                    "email" in wholesalerData.profiles
                      ? (wholesalerData.profiles as { email: string })
                      : null;

                  return (
                    <WholesalerTableRow
                      key={wholesalerData.id}
                      id={wholesalerData.id}
                      business_name={wholesalerData.business_name}
                      business_number={wholesalerData.business_number}
                      representative={wholesalerData.representative}
                      email={profileData?.email || null}
                      created_at={wholesalerData.created_at}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // 빈 목록 처리
        <Card>
          <CardContent className="p-12">
            <EmptyState
              message="승인 대기 중인 도매사업자가 없습니다"
              description="현재 승인 대기 상태인 도매사업자가 없습니다. 새로운 신청이 들어오면 여기에 표시됩니다."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

