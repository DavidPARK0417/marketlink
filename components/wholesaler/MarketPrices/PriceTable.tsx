/**
 * @file components/wholesaler/MarketPrices/PriceTable.tsx
 * @description 시세 테이블 컴포넌트
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import type { DailyPriceItem } from "@/lib/api/market-prices-types";

interface PriceTableProps {
  data: DailyPriceItem[];
  isLoading?: boolean;
  onRowClick?: (item: DailyPriceItem) => void;
}

export default function PriceTable({
  data,
  isLoading = false,
  onRowClick,
}: PriceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // 페이지네이션 계산
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / pageSize);

  // 데이터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // 렌더링 로그 (핵심 데이터 흐름 추적)
  useEffect(() => {
    console.log("[MarketPrices][PriceTable] render", {
      dataCount: data.length,
      currentPage,
    });
  }, [data.length, currentPage]);

  // 가격 포맷팅 (천 단위 쉼표)
  const formatPrice = (price: number): string => {
    if (price === 0) return "-";
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 증감률 표시 컴포넌트 (한국 관행: 상승=빨강, 하락=파랑)
  // 절댓값 + 아이콘으로 부호 구분, 보합은 "-" 표시
  const PriceChangeIndicator = ({ direction, value }: { direction: "0" | "1" | "2"; value: number }) => {
    if (direction === "1") {
      // 상승 - 빨강, 절댓값 표시
      return (
        <div className="flex items-center justify-end gap-1 text-sm font-bold text-red-500" role="status" aria-label={`상승 ${Math.abs(value).toFixed(1)}%`}>
          <TrendingUp className="w-4 h-4" aria-hidden="true" />
          <span>{Math.abs(value).toFixed(1)}%</span>
        </div>
      );
    } else if (direction === "2") {
      // 하락 - 파랑, 절댓값 표시
      return (
        <div className="flex items-center justify-end gap-1 text-sm font-bold text-[#10B981]" role="status" aria-label={`하락 ${Math.abs(value).toFixed(1)}%`}>
          <TrendingDown className="w-4 h-4" aria-hidden="true" />
          <span>{Math.abs(value).toFixed(1)}%</span>
        </div>
      );
    } else {
      // 보합 - 회색, "-" 표시
      return (
        <div className="flex items-center justify-end gap-1 text-sm font-bold text-gray-500" role="status" aria-label="보합">
          <Minus className="w-4 h-4" aria-hidden="true" />
          <span>-</span>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* 모바일: 카드 스타일 로딩 */}
        <div className="md:hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <span className="text-sm text-[#6B7280]" role="status" aria-live="polite">
            로딩 중...
          </span>
        </div>

        {/* 데스크톱: 기존 테이블 스켈레톤 */}
        <div className="hidden md:block bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full min-w-[1000px] md:min-w-0" role="table" aria-label="시세 조회 테이블">
              <thead className="bg-[#F8F9FA]">
                <tr>
                  <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">구분</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">품목</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">단위</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">당일 가격</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1일 전</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1개월 전</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1년 전</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">증감률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td colSpan={8} className="px-4 md:px-6 py-12 text-center text-gray-500">
                    <span role="status" aria-live="polite">로딩 중...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때도 테이블 헤더를 표시하여 공간 확보
  if (data.length === 0) {
    return (
      <div className="space-y-3">
        {/* 모바일: 빈 상태 카드 */}
        <div className="md:hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-[#6B7280]">조회된 시세 정보가 없습니다.</p>
          <p className="text-xs text-[#9CA3AF] mt-1">검색 후 결과가 여기에 표시됩니다.</p>
        </div>

        {/* 데스크톱: 테이블 헤더 유지 */}
        <div className="hidden md:block bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full min-w-[1000px] md:min-w-0" role="table" aria-label="시세 조회 테이블">
              <thead className="bg-[#F8F9FA]">
                <tr>
                  <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">구분</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">품목</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">단위</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">당일 가격</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1일 전</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1개월 전</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1년 전</th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">증감률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td colSpan={8} className="px-4 md:px-6 py-12 text-center text-gray-500">
                    조회된 시세 정보가 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 모바일 카드 뷰 */}
      <div className="md:hidden space-y-3">
        {paginatedData.map((item, index) => (
          <div
            key={`${item.productno}-${item.productClsCode}-card-${index}`}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            onClick={() => onRowClick?.(item)}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            aria-label={onRowClick ? `${item.productName} 시세 정보 보기` : undefined}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onRowClick(item);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs text-[#6B7280]">{item.productClsName}</p>
                <p className="text-base font-semibold text-[#111827]">{item.productName}</p>
                <p className="text-xs text-[#6B7280]">{item.unit}</p>
              </div>
              <PriceChangeIndicator direction={item.direction} value={item.value} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[#6B7280]">당일</span>
                <span className="font-semibold text-[#10B981]">{formatPrice(item.dpr1)}원</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B7280]">1일 전</span>
                <span className="text-[#111827]">{formatPrice(item.dpr2)}원</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B7280]">1개월 전</span>
                <span className="text-[#111827]">{formatPrice(item.dpr3)}원</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B7280]">1년 전</span>
                <span className="text-[#111827]">{formatPrice(item.dpr4)}원</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="hidden md:block bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[1000px]" role="table" aria-label="시세 조회 테이블">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">구분</th>
                <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">품목</th>
                <th scope="col" className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">단위</th>
                <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">당일 가격</th>
                <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1일 전</th>
                <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1개월 전</th>
                <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1년 전</th>
                <th scope="col" className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">증감률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr
                  key={`${item.productno}-${item.productClsCode}-${index}`}
                  className={onRowClick ? "cursor-pointer hover:bg-[#F8F9FA] transition-colors focus-within:bg-[#F8F9FA] outline-none" : ""}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(item);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? "button" : "row"}
                  aria-label={onRowClick ? `${item.productName} 시세 정보 보기` : undefined}
                >
                  <td className="px-4 md:px-6 py-4 text-sm text-[#111827]">{item.productClsName}</td>
                  <td className="px-4 md:px-6 py-4 text-sm font-bold text-[#111827]">{item.productName}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-[#6B7280]">{item.unit}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-right font-bold text-[#10B981]">
                    {formatPrice(item.dpr1)}원
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-right text-[#6B7280]">
                    {formatPrice(item.dpr2)}원
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-right text-[#6B7280]">
                    {formatPrice(item.dpr3)}원
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-right text-[#6B7280]">
                    {formatPrice(item.dpr4)}원
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <PriceChangeIndicator direction={item.direction} value={item.value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2" aria-label="페이지네이션">
          <div className="text-sm text-[#6B7280] order-2 sm:order-1">
            총 <span className="font-semibold text-[#111827]">{data.length}</span>개 중{" "}
            <span className="font-semibold text-[#111827]">
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, data.length)}
            </span>
            개 표시
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-[#111827] font-medium hover:bg-[#F8F9FA] hover:border-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
              aria-label="이전 페이지"
              aria-disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex items-center px-4 py-2 text-sm font-semibold text-[#111827] min-w-[80px] justify-center">
              <span aria-current="page">{currentPage}</span>
              <span className="mx-1 text-[#6B7280]">/</span>
              <span>{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-[#111827] font-medium hover:bg-[#F8F9FA] hover:border-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
              aria-label="다음 페이지"
              aria-disabled={currentPage >= totalPages}
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

