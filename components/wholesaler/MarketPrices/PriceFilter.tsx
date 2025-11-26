/**
 * @file components/wholesaler/MarketPrices/PriceFilter.tsx
 * @description 시세 검색 필터 컴포넌트
 *
 * 시세 조회를 위한 필터 컴포넌트입니다.
 * 확정일자, 대분류/중분류/소분류 코드를 선택하여 시세를 조회할 수 있습니다.
 *
 * 주요 기능:
 * 1. 확정일자 선택
 * 2. 대분류/중분류/소분류 선택
 * 3. 인기 품목 빠른 검색 버튼
 * 4. Enter 키로 검색 실행
 *
 * @dependencies
 * - components/ui/input, select, button
 * - lib/api/market-prices (itemCategories)
 * - date-fns (날짜 포맷팅)
 */

"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface PriceFilterParams {
  searchKeyword?: string; // 품목명 검색
}

interface PriceFilterProps {
  onSearch: (params: PriceFilterParams) => void;
  isLoading?: boolean;
}

export default function PriceFilter({ onSearch, isLoading = false }: PriceFilterProps) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const params: PriceFilterParams = {};
    if (searchKeyword.trim()) params.searchKeyword = searchKeyword.trim();

    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 md:px-6 py-4 md:py-5">
      {/* 품목명 검색 + 버튼을 한 줄로 배치 */}
      <div className="flex gap-4">
        {/* 품목명 검색 */}
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="search" className="text-sm font-medium">
            품목명 검색
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="예: 배추, 사과, 레몬"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
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

