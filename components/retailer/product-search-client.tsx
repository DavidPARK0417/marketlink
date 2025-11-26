/**
 * @file components/retailer/product-search-client.tsx
 * @description 소매점 상품 검색 클라이언트 컴포넌트
 *
 * 검색 및 필터 기능을 제공하는 클라이언트 컴포넌트입니다.
 * R.SEARCH.01 (Smart Search), R.SEARCH.03 (배송 필터링) 구현
 *
 * @dependencies
 * - next/navigation
 * - lucide-react
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";

interface ProductSearchClientProps {
  initialSearch?: string;
  initialCategory?: string;
  initialSortBy?: string;
  initialSortOrder?: string;
}

/**
 * 상품 검색 클라이언트 컴포넌트
 */
export function ProductSearchClient({
  initialSearch = "",
  initialCategory,
  initialSortBy = "created_at",
  initialSortOrder = "desc",
}: ProductSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  // 검색 실행
  const handleSearch = (value: string) => {
    setSearch(value);
    updateURL({ search: value });
  };

  // 필터 업데이트
  const updateURL = (updates: {
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      // 검색어
      if (updates.search !== undefined) {
        if (updates.search) {
          params.set("search", updates.search);
        } else {
          params.delete("search");
        }
      }

      // 카테고리
      if (updates.category !== undefined) {
        if (updates.category && updates.category !== "all") {
          params.set("category", updates.category);
        } else {
          params.delete("category");
        }
      }

      // 정렬
      if (updates.sortBy !== undefined) {
        params.set("sortBy", updates.sortBy);
      }
      if (updates.sortOrder !== undefined) {
        params.set("sortOrder", updates.sortOrder);
      }

      // 페이지는 항상 1로 리셋
      params.delete("page");

      router.push(`/retailer/products?${params.toString()}`);
    });
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("created_at");
    setSortOrder("desc");
    router.push("/retailer/products");
  };

  // 카테고리 목록
  const categories = [
    { value: "all", label: "전체" },
    { value: "과일", label: "과일" },
    { value: "채소", label: "채소" },
    { value: "곡물", label: "곡물" },
    { value: "견과류", label: "견과류" },
    { value: "수산물", label: "수산물" },
    { value: "기타", label: "기타" },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 검색 및 필터 영역 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 검색창 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="상품명, 카테고리 검색 (Cmd+K)"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                // Enter 키로 검색 실행
                if (e.key === "Enter") {
                  updateURL({ search });
                }
                // Cmd+K 또는 Ctrl+K는 Command Palette에서 처리됨
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isPending}
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 정렬 선택 */}
        <div className="flex items-center gap-2">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split("-");
              setSortBy(newSortBy);
              setSortOrder(newSortOrder as "asc" | "desc");
              updateURL({ sortBy: newSortBy, sortOrder: newSortOrder as "asc" | "desc" });
            }}
            className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isPending}
          >
            <option value="created_at-desc">최신순</option>
            <option value="price-asc">낮은 가격순</option>
            <option value="price-desc">높은 가격순</option>
            <option value="standardized_name-asc">이름순</option>
          </select>
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="flex flex-wrap gap-2">
        {/* 카테고리 필터 */}
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => {
              setSelectedCategory(category.value);
              updateURL({
                category: category.value === "all" ? undefined : category.value,
              });
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.value
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            disabled={isPending}
          >
            {category.label}
          </button>
        ))}

        {/* 필터 초기화 */}
        {(search || selectedCategory !== "all") && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={isPending}
          >
            <Filter className="w-4 h-4 inline mr-1" />
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}

