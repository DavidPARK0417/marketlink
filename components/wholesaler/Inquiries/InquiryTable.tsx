/**
 * @file components/wholesaler/Inquiries/InquiryTable.tsx
 * @description 문의 테이블 컴포넌트
 *
 * 문의 목록을 테이블(데스크톱) 또는 카드(모바일) 형태로 표시합니다.
 * 디자인 핸드오프 스타일 적용.
 *
 * @dependencies
 * - types/inquiry.ts
 * - date-fns
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { InquiryDetail } from "@/types/inquiry";

interface InquiryTableProps {
  inquiries: InquiryDetail[];
  isLoading?: boolean;
  basePath?: string;
}

export default function InquiryTable({
  inquiries,
  isLoading = false,
  basePath = "/wholesaler/support",
}: InquiryTableProps) {
  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    if (status === "open") return "접수완료";
    if (status === "answered") return "답변완료";
    return "종료";
  };

  // 상태 스타일
  const getStatusStyle = (status: string) => {
    if (status === "open") {
      return "bg-gray-100 text-gray-600";
    }
    if (status === "answered") {
      return "bg-blue-50 text-blue-600";
    }
    return "bg-gray-50 text-gray-500";
  };

  // 유형 텍스트 변환 (실제 데이터베이스에는 inquiry_type이 있지만, 디자인 핸드오프의 유형과는 다를 수 있음)
  const getTypeText = () => {
    // inquiry_type이 없으므로 기본값 반환
    // 필요시 inquiry_type에 따라 다른 텍스트 반환 가능
    return "기타";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-pulse text-gray-400">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-12 text-center text-gray-500">문의 내역이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 데스크톱 테이블 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 font-bold border-b w-24 text-center">상태</th>
              <th className="p-4 font-bold border-b w-24 text-center">유형</th>
              <th className="p-4 font-bold border-b">제목</th>
              <th className="p-4 font-bold border-b w-32 text-center">작성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {inquiries.map((inquiry) => {
              const inquiryId = inquiry.id;
              const href = `${basePath}/${inquiryId}?type=wholesaler_to_admin`;

              return (
                <tr
                  key={inquiry.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                        inquiry.status
                      )}`}
                    >
                      {getStatusText(inquiry.status)}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-500">
                    {getTypeText()}
                  </td>
                  <td className="p-4">
                    <Link
                      href={href}
                      className="block font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
                    >
                      {inquiry.title}
                    </Link>
                    {inquiry.admin_reply && (
                      <div className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-600 text-xs">
                        <span className="font-bold text-blue-600 mr-1">[답변]</span>
                        {inquiry.admin_reply}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center text-gray-400">
                    {format(new Date(inquiry.created_at), "yyyy-MM-dd", {
                      locale: ko,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 리스트 */}
      <div className="lg:hidden divide-y divide-gray-100">
        {inquiries.map((inquiry) => {
          const inquiryId = inquiry.id;
          const href = `${basePath}/${inquiryId}?type=wholesaler_to_admin`;

          return (
            <Link
              key={inquiry.id}
              href={href}
              className="block p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                    inquiry.status
                  )}`}
                >
                  {getStatusText(inquiry.status)}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(inquiry.created_at), "yyyy-MM-dd", {
                    locale: ko,
                  })}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1">
                {inquiry.title}
              </h3>
              <span className="text-xs text-gray-500 mb-3 block">
                {getTypeText()} 문의
              </span>

              {inquiry.admin_reply && (
                <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-xs mt-2">
                  <span className="font-bold text-blue-600 mr-1">[답변]</span>
                  {inquiry.admin_reply}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
