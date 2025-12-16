/**
 * @file components/Footer.tsx
 * @description 페이지 하단 Footer 컴포넌트
 *
 * 플랫폼 하단에 표시되는 Footer입니다.
 * 플랫폼 운영사(팜투비즈)의 사업자 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 플랫폼 운영사 사업자 정보 표시 (회사명, 대표자, 사업자번호, 주소)
 * 2. 고객센터 정보 표시 (전화번호, 이메일, 운영시간)
 * 3. 바로가기 링크 (이용약관, 개인정보처리방침, 자주 묻는 질문, 공지사항)
 *
 * @dependencies
 * - next/link
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";

// 플랫폼 운영사 사업자 정보
const PLATFORM_BUSINESS_INFO = {
  companyName: "팜투비즈",
  representative: "홍길동",
  businessNumber: "123-45-67890",
  address: "서울시 강남구 테헤란로 123",
} as const;

export default function Footer() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <footer className="mt-8 md:mt-12 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 왼쪽 컬럼: 회사 정보 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#10B981]">Farm to Biz</h3>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>회사명: {PLATFORM_BUSINESS_INFO.companyName}</p>
              <p>대표자: {PLATFORM_BUSINESS_INFO.representative}</p>
              <p>사업자등록번호: {PLATFORM_BUSINESS_INFO.businessNumber}</p>
              <p>주소: {PLATFORM_BUSINESS_INFO.address}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 Farm to Biz. All rights reserved.
            </p>
          </div>

          {/* 가운데 컬럼: 고객센터 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#10B981]">고객센터</h3>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="text-lg text-gray-900 dark:text-gray-100">
                  1588-0000
                </span>
              </p>
              <p>이메일: decidepyb@gmail.com</p>
              <div className="space-y-0.5 pt-2">
                <p>평일 09:00 - 18:00</p>
                <p>점심 12:00 - 13:00</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  (주말 및 공휴일 휴무)
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽 컬럼: 바로가기 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#10B981]">바로가기</h3>
            <nav className="space-y-1">
              <button
                onClick={() => setIsTermsModalOpen(true)}
                className="block text-left text-sm text-gray-700 transition-colors hover:text-[#10B981] dark:text-gray-300 dark:hover:text-[#10B981]"
              >
                이용약관
              </button>
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="block text-left text-sm text-gray-700 transition-colors hover:text-[#10B981] dark:text-gray-300 dark:hover:text-[#10B981]"
              >
                개인정보처리방침
              </button>
              <Link
                href="/wholesaler/support?tab=faq"
                className="block text-sm text-gray-700 transition-colors hover:text-[#10B981] dark:text-gray-300 dark:hover:text-[#10B981]"
              >
                자주 묻는 질문
              </Link>
              <Link
                href="/wholesaler/support?tab=announcements"
                className="block text-sm text-gray-700 transition-colors hover:text-[#10B981] dark:text-gray-300 dark:hover:text-[#10B981]"
              >
                공지사항
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <TermsModal open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen} />
      <PrivacyModal
        open={isPrivacyModalOpen}
        onOpenChange={setIsPrivacyModalOpen}
      />
    </footer>
  );
}
