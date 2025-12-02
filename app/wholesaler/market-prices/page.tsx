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
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          KAMIS 최신 시세 정보를 조회할 수 있습니다.
        </p>
      </div>

      {/* 필터 */}
      <div className="bg-card rounded-lg border">
        <PriceFilter onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-card rounded-lg border p-4 md:p-6">
        <PriceTable
          data={data}
          isLoading={isLoading}
          onRowClick={setSelectedItem}
        />
      </div>

      {/* 차트 (선택된 항목이 있을 때만 표시) */}
      {selectedItem && !isLoading && (
        <div className="bg-card rounded-lg border">
          <PriceComparisonChart data={selectedItem} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
