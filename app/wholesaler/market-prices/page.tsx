/**
 * @file app/wholesaler/market-prices/page.tsx
 * @description 시세 조회 페이지
 *
 * 주요 기능:
 * 1. 실시간 시세 조회 (테이블)
 * 2. 4개 시점 가격 비교 차트
 *
 * @dependencies
 * - components/wholesaler/MarketPrices/PriceFilter.tsx
 * - components/wholesaler/MarketPrices/PriceTable.tsx
 * - components/wholesaler/MarketPrices/PriceComparisonChart.tsx
 */

"use client";

import { useState } from "react";
import PriceFilter, {
  type PriceFilterParams,
} from "@/components/wholesaler/MarketPrices/PriceFilter";
import PriceTable from "@/components/wholesaler/MarketPrices/PriceTable";
import PriceComparisonChart from "@/components/wholesaler/MarketPrices/PriceComparisonChart";
import type { DailyPriceItem } from "@/lib/api/market-prices-types";

export default function MarketPricesPage() {
  const [data, setData] = useState<DailyPriceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DailyPriceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: PriceFilterParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      // 항상 도매("02")로 고정
      queryParams.append("productClsCode", "02");
      if (params.itemName) queryParams.append("itemName", params.itemName);
      if (params.countyCode)
        queryParams.append("countyCode", params.countyCode);

      const response = await fetch(
        `/api/market-prices?${queryParams.toString()}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const newData = result.data || [];
      setData(newData);
      // 첫 번째 항목을 기본 선택
      if (newData.length > 0) {
        setSelectedItem(newData[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "시세 조회 중 오류가 발생했습니다.",
      );
      setData([]);
      setSelectedItem(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">시세 조회</h1>
        <p className="mt-2 text-sm lg:text-base text-muted-foreground">
          전국 주요 도매시장의 실시간 시세를 조회하세요.
        </p>
      </div>

      {/* 필터 */}
      <PriceFilter onSearch={handleSearch} isLoading={isLoading} />

      {/* 에러 메시지 */}
      {error && (
        <div 
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-sm"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <PriceTable
        data={data}
        isLoading={isLoading}
        onRowClick={setSelectedItem}
      />

      {/* 차트 (선택된 항목이 있을 때만 표시) */}
      {selectedItem && !isLoading && (
        <div className="bg-white dark:bg-gray-900 text-foreground rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50 dark:border-gray-800 transition-colors duration-200">
          <PriceComparisonChart data={selectedItem} isLoading={isLoading} />
        </div>
      )}

      {/* 참고 사항 */}
      <div className="text-xs text-gray-600 dark:text-gray-300 px-2">
        <p>* 제공되는 시세 정보는 도매시장 경매 낙찰가를 기준으로 하며, 실시간 변동될 수 있습니다.</p>
        <p>* 증감률은 전일 대비 등락폭을 의미합니다.</p>
      </div>
    </div>
  );
}
