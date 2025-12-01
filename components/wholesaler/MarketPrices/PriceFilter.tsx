/**
 * @file components/wholesaler/MarketPrices/PriceFilter.tsx
 * @description 시세 검색 필터 컴포넌트
 */

"use client";

import { useState, FormEvent } from "react";
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

export interface PriceFilterParams {
  itemName?: string;
  productClsCode?: "01" | "02" | "all";
}

interface PriceFilterProps {
  onSearch: (params: PriceFilterParams) => void;
  isLoading?: boolean;
}

export default function PriceFilter({
  onSearch,
  isLoading = false,
}: PriceFilterProps) {
  const [itemName, setItemName] = useState<string>("");
  const [productClsCode, setProductClsCode] = useState<"01" | "02" | "all">("all");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params: PriceFilterParams = {};
    if (itemName.trim()) params.itemName = itemName.trim();
    if (productClsCode !== "all") params.productClsCode = productClsCode;

    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 md:px-6 py-4 md:py-5">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 도매/소매 구분 */}
        <div className="flex flex-col gap-2 md:w-48">
          <label htmlFor="productCls" className="text-sm font-medium">
            구분
          </label>
          <Select
            value={productClsCode}
            onValueChange={(value) => setProductClsCode(value as "01" | "02" | "all")}
          >
            <SelectTrigger id="productCls">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="01">소매</SelectItem>
              <SelectItem value="02">도매</SelectItem>
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
