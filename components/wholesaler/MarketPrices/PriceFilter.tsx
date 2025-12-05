/**
 * @file components/wholesaler/MarketPrices/PriceFilter.tsx
 * @description 시세 검색 필터 컴포넌트
 */

"use client";

import { useState, useEffect, FormEvent } from "react";
import { Search } from "lucide-react";
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
    <form onSubmit={handleSubmit}>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* 지역 선택 */}
          <div className="relative min-w-[140px]">
            <select
              value={countyCode}
              onChange={(e) => setCountyCode(e.target.value)}
              disabled={isLoading}
              className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">전체</option>
              {availableCounties.map(([name, code]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* 품목명 검색 */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="품목명 검색 (예: 사과, 배)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-2.5 bg-[#10B981] text-white font-semibold rounded-xl hover:bg-[#059669] transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "조회 중..." : "조회하기"}
        </button>
      </div>
    </form>
  );
}
