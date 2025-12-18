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
import WholesalerTable from "@/components/admin/WholesalerTable";

export const dynamic = "force-dynamic";

interface PendingWholesaler {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  created_at: string;
  email: string | null; // 이메일을 직접 포함
  profiles?: {
    email: string;
  }[] | {
    email: string;
  } | null; // Supabase 조인 결과 (배열 또는 객체)
}

interface PendingWholesalersPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function PendingWholesalersPage({
  searchParams,
}: PendingWholesalersPageProps) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin] 도매 승인 대기 목록 페이지 접근", {
    email: profile.email,
    role: profile.role,
  });

  // 쿼리 파라미터 파싱
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = parseInt(params.pageSize ?? "20", 10);

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // 페이지네이션 적용
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 승인 대기 중인 도매사업자 목록 조회
  // profiles 테이블과 조인하여 이메일 정보 포함
  // 외래키 이름을 명시하여 1:1 관계로 조인
  const { data: wholesalers, error, count } = await supabase
    .from("wholesalers")
    .select(
      `
      id,
      business_name,
      business_number,
      representative,
      created_at,
      profiles!fk_wholesalers_profile (
        email
      )
    `,
      { count: "exact" },
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("❌ [admin] 도매 승인 대기 목록 조회 오류:", error);
    console.error("❌ [admin] 에러 상세:", JSON.stringify(error, null, 2));
  }

  // 디버깅: 조회된 데이터 확인
  console.log("🔍 [admin] 조회된 도매사업자 데이터 샘플:", {
    count: wholesalers?.length || 0,
    firstItem: wholesalers?.[0] ? {
      id: wholesalers[0].id,
      business_name: wholesalers[0].business_name,
      profiles: wholesalers[0].profiles,
      profilesType: Array.isArray(wholesalers[0].profiles) ? 'array' : typeof wholesalers[0].profiles,
    } : null,
  });

  // 데이터 변환: profiles 배열/객체에서 email 추출하여 직접 포함
  const transformedWholesalers: PendingWholesaler[] = (wholesalers || []).map((wholesaler: any) => {
    let email: string | null = null;
    
    // profiles가 배열인 경우
    if (Array.isArray(wholesaler.profiles) && wholesaler.profiles.length > 0) {
      email = wholesaler.profiles[0].email;
    }
    // profiles가 단일 객체인 경우
    else if (wholesaler.profiles && typeof wholesaler.profiles === 'object' && 'email' in wholesaler.profiles) {
      email = (wholesaler.profiles as { email: string }).email;
    }

    console.log("📧 [admin] 이메일 추출:", {
      id: wholesaler.id,
      business_name: wholesaler.business_name,
      email,
      profilesType: Array.isArray(wholesaler.profiles) ? 'array' : typeof wholesaler.profiles,
    });

    return {
      id: wholesaler.id,
      business_name: wholesaler.business_name,
      business_number: wholesaler.business_number,
      representative: wholesaler.representative,
      created_at: wholesaler.created_at,
      email, // 이메일을 직접 포함
      profiles: wholesaler.profiles, // 원본 데이터도 유지 (호환성)
    };
  });

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  console.log("📊 [admin] 승인 대기 도매사업자 수:", {
    current: transformedWholesalers.length,
    total,
    page,
    totalPages,
  });

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
          도매 승인 대기
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
          승인 대기 중인 도매사업자 목록입니다. 상세 정보를 확인하고 승인 또는 반려 처리를 진행하세요.
        </p>
      </div>

      {/* 테이블 영역 */}
      <WholesalerTable
        wholesalers={transformedWholesalers}
        isLoading={false}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </div>
  );
}

