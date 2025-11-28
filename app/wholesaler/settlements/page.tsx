/**
 * @file app/wholesaler/settlements/page.tsx
 * @description 정산 관리 페이지
 *
 * 정산 예정 및 완료 내역을 조회하는 페이지입니다.
 * 향후 정산 목록, 필터링, 상세 조회 등의 기능이 추가될 예정입니다.
 *
 * 주요 기능:
 * 1. 정산 목록 표시 (예정)
 * 2. 정산 상태 필터링 (예정)
 * 3. 정산 상세 조회 (예정)
 * 4. 정산 내역 다운로드 (예정)
 *
 * @dependencies
 * - components/common/PageHeader.tsx
 * - components/common/EmptyState.tsx
 * - lucide-react (Receipt 아이콘)
 */

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { Receipt } from "lucide-react";

export default function SettlementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="정산 관리"
        description="정산 예정 및 완료 내역을 확인하세요."
        hideTitle={true}
      />

      <EmptyState
        message="정산 관리 준비 중입니다"
        description="곧 정산 내역을 확인할 수 있습니다."
        icon={Receipt}
      />
    </div>
  );
}

