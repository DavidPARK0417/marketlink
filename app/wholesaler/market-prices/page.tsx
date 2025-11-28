/**
 * @file app/wholesaler/market-prices/page.tsx
 * @description 시세 조회 페이지
 *
 * 실시간 농수산물 경매가격을 조회하는 페이지입니다.
 * 공공데이터포털 API를 사용하여 온라인 도매시장 거래정보를 조회합니다.
 *
 * 주요 기능:
 * 1. 실시간 시세 조회
 * 2. 상품별 시세 검색 (대분류/중분류/소분류 코드 기반)
 * 3. 시세 테이블 표시
 *
 * @dependencies
 * - components/common/PageHeader.tsx
 * - components/wholesaler/MarketPrices/PriceFilter.tsx
 * - components/wholesaler/MarketPrices/PriceTable.tsx
 * - hooks/use-market-prices.ts
 */

"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import PriceFilter, {
  type PriceFilterParams,
} from "@/components/wholesaler/MarketPrices/PriceFilter";
import PriceTable from "@/components/wholesaler/MarketPrices/PriceTable";
import { useMarketPrices } from "@/hooks/use-market-prices";
import { getCategoryFromKeyword, type MarketPriceParams } from "@/lib/api/market-prices";
import { AlertCircle, Search } from "lucide-react";

export default function MarketPricesPage() {
  // 🔥 null로 초기화 (검색 전에는 API 호출 안 함)
  const [searchParams, setSearchParams] = useState<PriceFilterParams | null>(
    null,
  );
  const [hasSearched, setHasSearched] = useState(false); // 🆕 검색 여부 추적

  // 시세 조회 (searchParams가 있을 때만)
  const apiParams = useMemo(() => {
    if (!searchParams) return null; // 🔥 null이면 API 호출 안 함

    // 오늘 날짜를 YYYYMMDD 형식으로 생성 (최신 데이터 조회)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}${month}${day}`;

    const params: MarketPriceParams = {
      numOfRows: searchParams.searchKeyword ? 2000 : 100, // 검색 시 더 많은 데이터 조회
      date: todayStr, // 오늘 날짜를 기본으로 추가하여 최신 데이터 조회
    };

    // ⚠️ API 제약: gds_lclsf_cd 파라미터가 작동하지 않음
    // 해결책: 최근 7일간의 데이터를 조회하여 품목 다양성 확보
    if (searchParams.searchKeyword) {
      // 최근 7일간의 데이터 조회 (품목 다양성 확보)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const fromDate = sevenDaysAgo.toISOString().split('T')[0];
      const toDate = todayStr;
      
      params.dateRange = { from: fromDate, to: toDate };
      params.numOfRows = 1000; // 각 날짜별로 1000건씩 조회
      
      console.group("🔍 [시세 조회] 검색 시작");
      console.log("검색 키워드:", searchParams.searchKeyword);
      console.log("조회 전략: 최근 7일 데이터 조회 → 클라이언트 필터링");
      console.log("날짜 범위:", fromDate, "~", toDate);
      console.log("각 날짜별 조회 건수:", params.numOfRows);
      console.log("⚠️ API 제약: 실시간 경매 데이터만 반환, 대분류 필터링 미지원");
      console.groupEnd();
    }

    return params;
  }, [searchParams]);

  const {
    data: allPrices,
    isLoading,
    error,
  } = useMarketPrices(apiParams || {}); // 🔥 null이면 빈 객체 전달

  // 클라이언트 사이드 필터링
  const filteredPrices = useMemo(() => {
    if (!allPrices || !searchParams) return []; // 🔥 searchParams가 없으면 빈 배열

    let filtered = allPrices;

    // 품목명 검색 - 강화된 필터링 (API 제약으로 인한 클라이언트 필터링)
    if (searchParams.searchKeyword) {
      const normalizedKeyword = searchParams.searchKeyword.toLowerCase().trim();

      // 키워드 정규화: 공백 제거
      const keywordVariants = [
        normalizedKeyword,
        normalizedKeyword.replace(/\s+/g, ""), // 공백 제거
      ];

      // 대분류 키워드 매핑 (과일, 채소 등의 일반 명칭)
      const categoryKeywords: Record<string, string[]> = {
        "과일": ["과실류", "과일류"],
        "채소": ["엽경채류", "조미채소류", "과채류", "채소류"],
        "곡물": ["곡물류", "곡류", "미곡류"],
        "견과류": ["견과류"],
        "수산물": ["수산물", "수산류", "어류", "패류", "해조류"],
        "축산물": ["축산물", "축산류"],
      };

      // 대분류 검색인지 확인
      const isCategorySearch = Object.keys(categoryKeywords).some(key => 
        keywordVariants.some(variant => variant === key)
      );

      filtered = filtered.filter((item) => {
        const itemName = item.itemName.toLowerCase();
        const mclsfNm = item.mclsfNm.toLowerCase();
        const sclsfNm = item.sclsfNm.toLowerCase();
        const varietyName = item.varietyName.toLowerCase();
        const lclsfNm = item.lclsfNm.toLowerCase();

        // 대분류 검색인 경우
        if (isCategorySearch) {
          for (const [key, values] of Object.entries(categoryKeywords)) {
            if (keywordVariants.some(variant => variant === key)) {
              return values.some(categoryName => 
                lclsfNm.includes(categoryName.toLowerCase())
              );
            }
          }
        }

        // 일반 품목명 검색
        return keywordVariants.some(variant => 
          itemName.includes(variant) ||
          mclsfNm.includes(variant) ||
          sclsfNm.includes(variant) ||
          varietyName.includes(variant)
        );
      });
      
      console.group("🔍 [필터링] 검색 결과");
      console.log("검색 키워드:", searchParams.searchKeyword);
      console.log("대분류 검색:", isCategorySearch ? "예" : "아니오");
      console.log("전체 데이터:", allPrices.length, "개");
      console.log("필터링 후:", filtered.length, "개");
      
      if (allPrices.length > 0) {
        console.log("전체 데이터 샘플 (처음 3개):", allPrices.slice(0, 3).map(item => ({
          품목명: item.itemName,
          대분류: item.lclsfNm,
          중분류: item.mclsfNm,
          소분류: item.sclsfNm,
        })));
      }
      
      if (filtered.length > 0) {
        console.log("필터링 결과 샘플 (처음 3개):", filtered.slice(0, 3).map(item => ({
          품목명: item.itemName,
          대분류: item.lclsfNm,
          중분류: item.mclsfNm,
          소분류: item.sclsfNm,
        })));
      } else {
        console.warn("⚠️ 필터링 결과가 없습니다. 전체 데이터를 확인하세요.");
      }
      console.groupEnd();
    }

    return filtered;
  }, [allPrices, searchParams]);

  const handleSearch = (params: PriceFilterParams) => {
    console.group("🔍 [시세 조회] 검색 파라미터");
    console.log("품목명:", params.searchKeyword || "전체");
    
    if (params.searchKeyword) {
      const category = getCategoryFromKeyword(params.searchKeyword);
      if (category) {
        console.log("자동 설정된 대분류 코드:", category.lclsfCd);
      } else {
        console.log("⚠️ 매핑된 카테고리 없음 - 전체 데이터 조회 후 필터링");
      }
    }
    console.groupEnd();

    setSearchParams(params);
    setHasSearched(true); // 🆕 검색 실행됨
  };

  const hasError = !!error;

  return (
    <div className="flex flex-col gap-4 -mx-6 -my-6">
      <div className="px-6 md:px-8 pt-6 md:pt-8">
        <PageHeader
          title="시세 조회"
          description="전국 농수산물 경매가격을 지역별, 품목별로 확인하세요."
          hideTitle={true}
        />
      </div>

      {/* 🆕 검색 필터 - 상단 전체 너비 */}
      <div className="border-b bg-card">
        <PriceFilter onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* 에러 표시 */}
      {hasError && (
        <div className="mx-6 md:mx-8 border border-destructive bg-destructive/10 p-4">
          <div className="flex gap-2">
            <AlertCircle className="size-5 text-destructive" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-destructive">시세 조회 오류</h3>
              <p className="text-sm text-destructive/80">
                {error?.message || "시세를 조회하는 중 오류가 발생했습니다."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 초기 상태 메시지 */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <Search className="size-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              시세 조회를 시작하세요
            </h3>
            <p className="text-sm text-muted-foreground">
              품목명을 입력한 후{" "}
              <span className="font-semibold">시세 조회</span> 버튼을
              눌러주세요.
            </p>
          </div>
        </div>
      )}

      {/* 검색 결과 요약 */}
      {hasSearched && !isLoading && filteredPrices.length > 0 && (
        <div className="px-6 md:px-8 text-sm text-muted-foreground">
          총{" "}
          <span className="font-semibold text-foreground">
            {filteredPrices.length}개
          </span>
          의 시세 정보를 찾았습니다.
        </div>
      )}

      {/* 시세 테이블 - 검색 후에만 표시 */}
      {hasSearched && (
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="px-6 md:px-8 py-4 border-b">
              <h2 className="text-lg font-semibold">시세 목록</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <PriceTable data={filteredPrices} isLoading={isLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

