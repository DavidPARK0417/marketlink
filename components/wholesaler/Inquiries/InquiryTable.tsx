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
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import InquiryTableSkeleton from "./InquiryTableSkeleton";
import type { InquiryDetail } from "@/types/inquiry";

interface InquiryTableProps {
  inquiries: InquiryDetail[];
  isLoading?: boolean;
  basePath?: string;
  /**
   * 시작 번호 (페이지네이션용, 기본값: 1)
   */
  startNumber?: number;
  /**
   * 전체 개수 (번호 역순 계산용)
   */
  total?: number;
  /**
   * 행 클릭 시 이동 활성화 (기본: true)
   */
  enableRowClick?: boolean;
  /**
   * 모바일 카드 클릭 시 이동 활성화 (기본: true)
   */
  enableCardClick?: boolean;
}

export default function InquiryTable({
  inquiries,
  isLoading = false,
  basePath = "/wholesaler/support",
  startNumber = 1,
  total,
  enableRowClick = true,
  enableCardClick = true,
}: InquiryTableProps) {
  const router = useRouter();

  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    if (status === "open") return "접수완료";
    if (status === "answered") return "답변완료";
    return "종료";
  };

  // 상태 스타일
  const getStatusStyle = (status: string) => {
    if (status === "open") {
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100";
    }
    if (status === "answered") {
      return "bg-[#D1FAE5] text-[#10B981] dark:bg-emerald-900/40 dark:text-emerald-200";
    }
    return "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-200";
  };

  // 유형 텍스트 변환 (실제 데이터베이스에는 inquiry_type이 있지만, 디자인 핸드오프의 유형과는 다를 수 있음)
  const getTypeText = () => {
    // inquiry_type이 없으므로 기본값 반환
    // 필요시 inquiry_type에 따라 다른 텍스트 반환 가능
    return "기타";
  };

  if (isLoading) {
    return <InquiryTableSkeleton />;
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
        <div className="p-12 text-center text-muted-foreground dark:text-muted-foreground">
          문의 내역이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
      {/* 데스크톱 테이블 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-200 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-16 text-center">
                번호
              </th>
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-32 text-center">
                작성일
              </th>
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">
                제목
              </th>
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-24 text-center">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {inquiries.map((inquiry, index) => {
              const inquiryId = inquiry.id;
              const href = `${basePath}/${inquiryId}?type=wholesaler_to_admin`;
              // 먼저 작성한 글이 1번이 되도록 번호 계산
              // 내림차순 정렬이므로 역순으로 계산: total - (startNumber + index - 1)
              const number = total 
                ? total - (startNumber + index - 1)
                : startNumber + index;

              return (
                <tr
                  key={inquiry.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group ${
                    enableRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={
                    enableRowClick
                      ? () => {
                          console.log("🧭 [support-inquiry-table] 행 클릭 → 상세 이동", {
                            inquiryId,
                            href,
                          });
                          router.push(href);
                        }
                      : undefined
                  }
                  tabIndex={enableRowClick ? 0 : -1}
                  onKeyDown={
                    enableRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            console.log(
                              "🧭 [support-inquiry-table] 키보드로 행 이동",
                              {
                                inquiryId,
                                href,
                                key: e.key,
                              },
                            );
                            router.push(href);
                          }
                        }
                      : undefined
                  }
                  role={enableRowClick ? "button" : undefined}
                  aria-label={enableRowClick ? `${inquiry.title} 상세 보기` : undefined}
                >
                  <td className="p-4 text-center text-muted-foreground dark:text-muted-foreground font-medium">
                    {number}
                  </td>
                  <td className="p-4 text-center text-muted-foreground dark:text-muted-foreground">
                    {format(new Date(inquiry.created_at), "yyyy-MM-dd", {
                      locale: ko,
                    })}
                  </td>
                  <td className="p-4">
                    <Link
                      href={href}
                      className="block font-medium text-foreground dark:text-foreground group-hover:text-[#10B981] transition-colors"
                    >
                      {inquiry.title}
                    </Link>
                    {inquiry.admin_reply && (
                      <div className="mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-muted-foreground dark:text-muted-foreground text-xs transition-colors duration-200">
                        <span className="font-bold text-[#10B981] mr-1">
                          [답변]
                        </span>
                        {inquiry.admin_reply}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                        inquiry.status
                      )}`}
                    >
                      {getStatusText(inquiry.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 리스트 */}
      <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800 transition-colors duration-200">
        {inquiries.map((inquiry, index) => {
          const inquiryId = inquiry.id;
          const href = `${basePath}/${inquiryId}?type=wholesaler_to_admin`;
          // 먼저 작성한 글이 1번이 되도록 번호 계산
          // 내림차순 정렬이므로 역순으로 계산: total - (startNumber + index - 1)
          const number = total 
            ? total - (startNumber + index - 1)
            : startNumber + index;

          return (
            <Link
              key={inquiry.id}
              href={href}
              className="block p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              tabIndex={enableCardClick ? 0 : -1}
              aria-disabled={!enableCardClick}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    #{number}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                      inquiry.status
                    )}`}
                  >
                    {getStatusText(inquiry.status)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                  {format(new Date(inquiry.created_at), "yyyy-MM-dd", {
                    locale: ko,
                  })}
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground dark:text-foreground mb-1">
                {inquiry.title}
              </h3>

              {inquiry.admin_reply && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-muted-foreground dark:text-muted-foreground text-xs mt-2 transition-colors duration-200">
                  <span className="font-bold text-[#10B981] mr-1">[답변]</span>
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
