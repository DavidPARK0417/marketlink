/**
 * @file app/admin/accounts/page.tsx
 * @description 계정 관리 페이지
 *
 * 관리자가 도매 및 소매 계정을 관리하고 정지/해제 처리를 할 수 있는 페이지입니다.
 * 도매 계정(approved, suspended)과 소매 계정(active, suspended)을 탭으로 구분하여 표시합니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 (requireAdmin)
 * 2. 도매 계정 목록 조회 (approved, suspended 상태)
 * 3. 소매 계정 목록 조회 (active, suspended 상태)
 * 4. 탭으로 도매/소매 구분
 * 5. 각 계정에 정지/해제 버튼 제공
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/admin/AccountManagementTable.tsx
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import AccountManagementTable from "@/components/admin/AccountManagementTable";

export const dynamic = "force-dynamic";

interface AccountManagementPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AccountManagementPage({
  searchParams,
}: AccountManagementPageProps) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin] 계정 관리 페이지 접근", {
    email: profile.email,
    role: profile.role,
  });

  // 쿼리 파라미터 파싱
  const params = await searchParams;
  const activeTab = params.tab || "wholesalers";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = parseInt(params.pageSize ?? "20", 10);

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // 페이지네이션 적용
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let wholesalers: any[] = [];
  let retailers: any[] = [];
  let wholesalersCount = 0;
  let retailersCount = 0;

  // 도매 계정 목록 조회 (approved, suspended 상태만)
  if (activeTab === "wholesalers") {
    const { data, error, count } = await supabase
      .from("wholesalers")
      .select(
        `
        id,
        business_name,
        business_number,
        representative,
        phone,
        status,
        suspension_reason,
        created_at,
        profiles!inner (
          email
        )
      `,
        { count: "exact" },
      )
      .in("status", ["approved", "suspended"])
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("❌ [admin] 도매 계정 목록 조회 오류:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      });
    } else {
      // 데이터 정규화: profiles 배열을 단일 객체로 변환
      wholesalers = (data || []).map((wholesaler: any) => {
        // profiles 데이터 추출 및 정규화
        let email: string | null = null;
        
        if (wholesaler.profiles) {
          if (Array.isArray(wholesaler.profiles)) {
            email = wholesaler.profiles.length > 0 ? wholesaler.profiles[0]?.email || null : null;
          } else if (typeof wholesaler.profiles === 'object' && 'email' in wholesaler.profiles) {
            email = wholesaler.profiles.email || null;
          }
        }
        
        return {
          ...wholesaler,
          profiles: email ? [{ email }] : [],
          email, // 직접 접근을 위한 email 필드 추가
        };
      });
      wholesalersCount = count ?? 0;
      
      // 디버깅: 첫 번째 데이터 구조 확인
      if (wholesalers.length > 0) {
        const firstAccount = wholesalers[0];
        console.log("🔍 [admin] 도매 계정 데이터 구조 확인:", {
          accountId: firstAccount?.id,
          email: firstAccount?.email,
          profilesEmail: firstAccount?.profiles?.[0]?.email,
          accountKeys: Object.keys(firstAccount || {}),
        });
      }
    }
  }

  // 소매 계정 목록 조회 (active, suspended 상태만)
  if (activeTab === "retailers") {
    const { data, error, count } = await supabase
      .from("retailers")
      .select(
        `
        id,
        business_name,
        phone,
        address,
        status,
        suspension_reason,
        created_at,
        profiles!inner (
          email
        )
      `,
        { count: "exact" },
      )
      .in("status", ["active", "suspended"])
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("❌ [admin] 소매 계정 목록 조회 오류:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      });
    } else {
      // 데이터 정규화: profiles 배열을 단일 객체로 변환
      retailers = (data || []).map((retailer: any) => {
        // profiles 데이터 추출 및 정규화
        let email: string | null = null;
        
        if (retailer.profiles) {
          if (Array.isArray(retailer.profiles)) {
            email = retailer.profiles.length > 0 ? retailer.profiles[0]?.email || null : null;
          } else if (typeof retailer.profiles === 'object' && 'email' in retailer.profiles) {
            email = retailer.profiles.email || null;
          }
        }
        
        return {
          ...retailer,
          profiles: email ? [{ email }] : [],
          email, // 직접 접근을 위한 email 필드 추가
        };
      });
      retailersCount = count ?? 0;
      
      // 디버깅: 첫 번째 데이터 구조 확인
      if (retailers.length > 0) {
        const firstAccount = retailers[0];
        console.log("🔍 [admin] 소매 계정 데이터 구조 확인:", {
          accountId: firstAccount?.id,
          email: firstAccount?.email,
          profilesEmail: firstAccount?.profiles?.[0]?.email,
          accountKeys: Object.keys(firstAccount || {}),
        });
      }
    }
  }

  const total =
    activeTab === "wholesalers" ? wholesalersCount : retailersCount;
  const totalPages = Math.ceil(total / pageSize);

  console.log("📊 [admin] 계정 목록:", {
    tab: activeTab,
    wholesalersCount,
    retailersCount,
    currentPage: page,
    totalPages,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">
          계정 관리
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          도매 및 소매 계정을 관리하고 정지/해제 처리를 진행하세요.
        </p>
      </div>

      {/* 계정 관리 테이블 */}
      <AccountManagementTable
        activeTab={activeTab}
        wholesalers={wholesalers}
        retailers={retailers}
        isLoading={false}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </div>
  );
}

