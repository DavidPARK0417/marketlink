/**
 * @file components/wholesaler/MarketPrices/MarketPriceModal.tsx
 * @description 시세 조회 모달 컴포넌트
 *
 * 상품 등록/수정 폼에서 시세를 참고할 수 있도록 모달 형태로 제공합니다.
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PriceFilter, {
  type PriceFilterParams,
} from "@/components/wholesaler/MarketPrices/PriceFilter";
import PriceTable from "@/components/wholesaler/MarketPrices/PriceTable";
import type { DailyPriceItem } from "@/lib/api/market-prices-types";

interface MarketPriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 초기 검색어 (선택적) */
  initialItemName?: string;
}

export default function MarketPriceModal({
  open,
  onOpenChange,
  initialItemName = "",
}: MarketPriceModalProps) {
  const [data, setData] = useState<DailyPriceItem[]>([]);
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
      setData(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "시세 조회 중 오류가 발생했습니다.",
      );
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때 초기 검색어가 있으면 자동 검색
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // 모달이 닫힐 때 데이터 초기화
      setData([]);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>시세 조회</DialogTitle>
          <DialogDescription>
            KAMIS 최신 시세 정보를 조회할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 필터 */}
          <div className="bg-card rounded-lg border">
            <PriceFilter
              onSearch={handleSearch}
              isLoading={isLoading}
              initialItemName={initialItemName}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* 테이블 */}
          <div className="bg-card rounded-lg border p-4 md:p-6">
            <PriceTable data={data} isLoading={isLoading} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

