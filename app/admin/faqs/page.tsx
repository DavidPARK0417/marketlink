/**
 * @file app/admin/faqs/page.tsx
 * @description FAQ 관리 페이지
 *
 * 관리자가 FAQ를 관리하는 페이지입니다.
 * FAQ 목록을 표시하고, 생성, 수정, 삭제, 순서 변경 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. FAQ 목록 표시 (표시 순서대로)
 * 2. FAQ 생성
 * 3. FAQ 수정
 * 4. FAQ 삭제
 * 5. FAQ 순서 변경 (위/아래 화살표)
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - actions/admin/faqs.ts
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import FAQManagementClient from "@/components/admin/FAQManagementClient";
import type { FAQ } from "@/types/faq";

export const dynamic = "force-dynamic";

export default async function AdminFAQsPage() {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin/faqs] 관리자 권한 확인됨", {
    email: profile.email,
    role: profile.role,
  });

  // FAQ 목록 조회
  const supabase = await createClerkSupabaseClient();
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [admin/faqs] FAQ 목록 조회 오류:", error);
  }

  const typedFAQs = (faqs || []) as FAQ[];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">FAQ 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          자주 묻는 질문을 관리합니다. 순서를 변경하거나 추가, 수정, 삭제할 수 있습니다.
        </p>
      </div>

      {/* FAQ 관리 클라이언트 컴포넌트 */}
      <FAQManagementClient initialFAQs={typedFAQs} />
    </div>
  );
}

