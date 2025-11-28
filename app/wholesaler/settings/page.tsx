/**
 * @file app/wholesaler/settings/page.tsx
 * @description 설정 페이지
 *
 * 도매점 계정 및 사업자 정보를 관리하는 페이지입니다.
 * 향후 사업자 정보 수정, 비밀번호 변경, 알림 설정 등의 기능이 추가될 예정입니다.
 *
 * 주요 기능 (예정):
 * 1. 사업자 정보 수정 (상호명, 연락처, 주소, 계좌번호)
 * 2. 비밀번호 변경 (Clerk)
 * 3. 이메일 변경 (profiles.email)
 * 4. 계정 정보 조회 (사업자번호, 대표자명, 익명 코드, 승인 상태 등 - 읽기 전용)
 * 5. 알림 설정 (선택 기능)
 *
 * @dependencies
 * - components/common/PageHeader.tsx
 * - components/common/EmptyState.tsx
 * - lucide-react (Settings 아이콘)
 */

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="설정"
        description="계정 및 사업자 정보를 관리하세요."
        hideTitle={true}
      />

      <EmptyState
        message="설정 페이지 준비 중입니다"
        description="곧 계정 및 사업자 정보를 수정할 수 있습니다."
        icon={Settings}
      />
    </div>
  );
}

