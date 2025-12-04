/**
 * @file components/Footer.tsx
 * @description 페이지 하단 Footer 컴포넌트
 *
 * 도매사업자 페이지 하단에 표시되는 Footer입니다.
 * 로그인한 도매사업자의 사업자 정보를 동적으로 표시합니다.
 *
 * 주요 기능:
 * 1. 사업자 정보 표시 (상호명, 대표자, 사업자번호, 주소)
 * 2. 고객센터 정보 표시 (전화번호, 이메일, 운영시간)
 * 3. 바로가기 링크 (이용약관, 개인정보처리방침, 자주 묻는 질문, 공지사항)
 *
 * @dependencies
 * - hooks/useWholesaler.ts
 * - lib/utils/format.ts
 * - next/link
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useWholesaler } from "@/hooks/useWholesaler";
import { formatBusinessNumber } from "@/lib/utils/format";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";

export default function Footer() {
  const { data: wholesaler, isLoading } = useWholesaler();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // 로딩 중이거나 사업자 정보가 없으면 Footer 숨김
  if (isLoading || !wholesaler) {
    return null;
  }

  // 사업자번호 포맷팅
  const formattedBusinessNumber = formatBusinessNumber(wholesaler.business_number);

  // 주소 조합 (주소 + 상세주소)
  const fullAddress = wholesaler.address_detail
    ? `${wholesaler.address} ${wholesaler.address_detail}`
    : wholesaler.address;

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 왼쪽 컬럼: 회사 정보 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#137fec]">Farm to Biz</h3>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>상호명: {wholesaler.business_name}</p>
              <p>대표자: {wholesaler.representative}</p>
              <p>사업자등록번호: {formattedBusinessNumber}</p>
              <p>주소: {fullAddress}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 Farm to Biz. All rights reserved.
            </p>
          </div>

          {/* 가운데 컬럼: 고객센터 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              고객센터
            </h3>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="text-lg font-bold text-[#137fec]">1588-0000</span>
              </p>
              <p>이메일: decidepyb@gmail.com</p>
              <div className="space-y-0.5 pt-2">
                <p>평일 09:00 - 18:00</p>
                <p>점심 12:00 - 13:00</p>
                <p className="text-xs text-gray-500">(주말 및 공휴일 휴무)</p>
              </div>
            </div>
          </div>

          {/* 오른쪽 컬럼: 바로가기 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              바로가기
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setIsTermsModalOpen(true)}
                className="block text-left text-sm text-gray-700 transition-colors hover:text-[#137fec] dark:text-gray-300 dark:hover:text-[#137fec]"
              >
                이용약관
              </button>
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="block text-left text-sm text-gray-700 transition-colors hover:text-[#137fec] dark:text-gray-300 dark:hover:text-[#137fec]"
              >
                개인정보처리방침
              </button>
              <Link
                href="/wholesaler/support?tab=faq"
                className="block text-sm text-gray-700 transition-colors hover:text-[#137fec] dark:text-gray-300 dark:hover:text-[#137fec]"
              >
                자주 묻는 질문
              </Link>
              <Link
                href="/wholesaler/support?tab=announcements"
                className="block text-sm text-gray-700 transition-colors hover:text-[#137fec] dark:text-gray-300 dark:hover:text-[#137fec]"
              >
                공지사항
              </Link>
            </nav>
          </div>
        </div>
      </div>
      
      <TermsModal open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen} />
      <PrivacyModal open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen} />
    </footer>
  );
}

