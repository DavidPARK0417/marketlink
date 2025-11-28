/**
 * @file app/wholesaler/inquiries/page.tsx
 * @description 문의 관리 페이지
 *
 * 소매점으로부터 받은 문의를 관리하는 페이지입니다.
 * 향후 문의 목록, 답변 작성 등의 기능이 추가될 예정입니다.
 *
 * 주요 기능:
 * 1. 문의 목록 표시 (예정)
 * 2. 문의 상태 필터링 (예정)
 * 3. 문의 답변 작성 (예정)
 * 4. 문의 상세 조회 (예정)
 *
 * @dependencies
 * - components/common/PageHeader.tsx
 * - components/common/EmptyState.tsx
 * - lucide-react (MessageSquare 아이콘)
 */

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { MessageSquare } from "lucide-react";

export default function InquiriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="문의 관리"
        description="소매점으로부터 받은 문의를 확인하고 답변하세요."
        hideTitle={true}
      />

      <EmptyState
        message="문의 관리 준비 중입니다"
        description="곧 문의 목록을 확인하고 답변할 수 있습니다."
        icon={MessageSquare}
      />
    </div>
  );
}

