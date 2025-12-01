/**
 * @file components/wholesaler/MarketPrices/PriceFilter.tsx
 * @description 시세 검색 필터 컴포넌트
 */

"use client";

import { useState, useEffect, FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { kamisWholesaleCountyCodes } from "@/lib/api/market-prices-utils";

export interface PriceFilterParams {
  itemName?: string;
  countyCode?: string;
}

interface PriceFilterProps {
  onSearch: (params: PriceFilterParams) => void;
  isLoading?: boolean;
  /** 초기 검색어 */
  initialItemName?: string;
}

export default function PriceFilter({
  onSearch,
  isLoading = false,
  initialItemName = "",
}: PriceFilterProps) {
  const [itemName, setItemName] = useState<string>(initialItemName);
  const [countyCode, setCountyCode] = useState<string>("all");

  // initialItemName이 변경되면 검색어 업데이트
  useEffect(() => {
    if (initialItemName) {
      setItemName(initialItemName);
    }
  }, [initialItemName]);

  // 도매 지역 목록
  const availableCounties = Object.entries(kamisWholesaleCountyCodes);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params: PriceFilterParams = {};
    if (itemName.trim()) params.itemName = itemName.trim();
    // "all"이 아닌 경우에만 countyCode 전달
    if (countyCode && countyCode !== "all") params.countyCode = countyCode;

    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 md:px-6 py-4 md:py-5">
      <div className="flex flex-col md:flex-row gap-3">
        {/* 지역 선택 */}
        <div className="flex flex-col gap-2 md:w-32">
          <label htmlFor="county" className="text-sm font-medium">
            지역
          </label>
          <Select
            value={countyCode}
            onValueChange={(value) => setCountyCode(value)}
          >
            <SelectTrigger id="county">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {availableCounties.map(([name, code]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 품목명 검색 */}
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="search" className="text-sm font-medium">
            품목명
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="예: 사과, 배추, 레몬"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 조회 버튼 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium opacity-0">버튼</label>
          <Button type="submit" disabled={isLoading} className="h-10 px-6">
            <Search className="mr-2 size-4" />
            {isLoading ? "조회 중..." : "시세 조회"}
          </Button>
        </div>
      </div>
    </form>
  );
}
