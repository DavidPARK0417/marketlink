/**
 * @file hooks/use-market-prices.ts
 * @description 시세 조회 React Query 훅
 *
 * 공공데이터포털 API를 사용하여 시세를 조회하는 React Query 훅입니다.
 * 30분 캐싱을 적용하여 API 호출을 최적화합니다.
 *
 * @dependencies
 * - @tanstack/react-query (설치 필요: pnpm add @tanstack/react-query)
 * - lib/api/market-prices.ts
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useMarketPrices } from '@/hooks/use-market-prices';
 *
 * export default function MarketPricesPage() {
 *   const { data, isLoading, error } = useMarketPrices({
 *     date: '2025-01-15',
 *     lclsfCd: '01',
 *   });
 *
 *   if (isLoading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error.message}</div>;
 *
 *   return <div>{/* 시세 데이터 표시 *\/}</div>;
 * }
 * ```
 */

"use client";

import React from "react";
// React Query가 설치되어 있지 않으면 주석 처리
// import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { MarketPriceParams, PriceItem, PriceTrendItem } from "@/lib/api/market-prices";

// 임시: React Query가 설치될 때까지 기본 훅 사용
// React Query 설치 후 아래 코드를 활성화하고 임시 코드를 제거하세요

/**
 * 캐시 키 생성 함수
 */
function getQueryKey(params: MarketPriceParams) {
  return ["market-prices", params] as const;
}

/**
 * 시세 조회 훅
 *
 * @param params - 조회 파라미터
 * @param options - React Query 옵션
 * @returns 시세 데이터 및 상태
 *
 * @note React Query 설치 필요: pnpm add @tanstack/react-query
 */
export function useMarketPrices(
  params: MarketPriceParams = {},
  // options?: Omit<UseQueryOptions<PriceItem[], Error>, "queryKey" | "queryFn">
) {
  // React Query 설치 후 아래 코드 활성화
  /*
  return useQuery({
    queryKey: getQueryKey(params),
    queryFn: () => getMarketPrices(params),
    staleTime: 30 * 60 * 1000, // 30분 캐싱
    gcTime: 60 * 60 * 1000, // 1시간 후 가비지 컬렉션
    ...options,
  });
  */

  // 임시: React Query 없이 기본 상태 관리
  // React Query 설치 후 이 부분을 제거하세요
  const [data, setData] = React.useState<PriceItem[] | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false); // 🔥 초기값을 false로 변경
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // 🔥 파라미터가 비어있으면 API 호출하지 않음
    const hasParams = params.whslMrktCd || params.date || params.lclsfCd || params.mclsfCd || params.sclsfCd || params.numOfRows;
    
    if (!hasParams) {
      setIsLoading(false);
      setData(undefined);
      setError(null);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // API Route를 통해 서버 사이드에서 공공 API 호출 (CORS 문제 해결)
        const queryParams = new URLSearchParams();
        if (params.date) queryParams.append("date", params.date);
        if (params.lclsfCd) queryParams.append("lclsfCd", params.lclsfCd);
        if (params.mclsfCd) queryParams.append("mclsfCd", params.mclsfCd);
        if (params.sclsfCd) queryParams.append("sclsfCd", params.sclsfCd);
        if (params.pageNo) queryParams.append("pageNo", params.pageNo.toString());
        if (params.numOfRows) queryParams.append("numOfRows", params.numOfRows.toString());
        if (params.whslMrktCd) queryParams.append("whslMrktCd", params.whslMrktCd);

        const response = await fetch(`/api/market-prices?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const prices = result.data || [];

        if (isMounted) {
          setData(prices);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(params)]);

  return {
    data,
    isLoading,
    error,
    isError: !!error,
    refetch: async () => {
      setIsLoading(true);
      setError(null);
      try {
        // API Route를 통해 서버 사이드에서 공공 API 호출 (CORS 문제 해결)
        const queryParams = new URLSearchParams();
        if (params.date) queryParams.append("date", params.date);
        if (params.lclsfCd) queryParams.append("lclsfCd", params.lclsfCd);
        if (params.mclsfCd) queryParams.append("mclsfCd", params.mclsfCd);
        if (params.sclsfCd) queryParams.append("sclsfCd", params.sclsfCd);
        if (params.pageNo) queryParams.append("pageNo", params.pageNo.toString());
        if (params.numOfRows) queryParams.append("numOfRows", params.numOfRows.toString());

        const response = await fetch(`/api/market-prices?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const prices = result.data || [];
        
        setData(prices);
        return { data: prices, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { data: undefined, error };
      } finally {
        setIsLoading(false);
      }
    },
  };
}

/**
 * 시세 추이 조회 훅
 *
 * @param lclsfCd - 대분류 코드
 * @param mclsfCd - 중분류 코드 (선택)
 * @param sclsfCd - 소분류 코드 (선택)
 * @param days - 조회 일수 (기본 7일)
 * @param options - React Query 옵션
 * @returns 시세 추이 데이터 및 상태
 */
export function usePriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  days: number = 7,
  // options?: Omit<UseQueryOptions<PriceTrendItem[], Error>, "queryKey" | "queryFn">
) {
  // React Query 설치 후 아래 코드 활성화
  /*
  return useQuery({
    queryKey: ["price-trend", lclsfCd, mclsfCd, sclsfCd, days],
    queryFn: () => getPriceTrend(lclsfCd, mclsfCd, sclsfCd, days),
    staleTime: 30 * 60 * 1000, // 30분 캐싱
    gcTime: 60 * 60 * 1000,
    enabled: !!lclsfCd, // lclsfCd가 있을 때만 실행
    ...options,
  });
  */

  // 임시: React Query 없이 기본 상태 관리
  const [data, setData] = React.useState<PriceTrendItem[] | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false); // 🔥 초기값을 false로 변경
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!lclsfCd) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // API Route를 통해 서버 사이드에서 공공 API 호출 (CORS 문제 해결)
        const queryParams = new URLSearchParams();
        queryParams.append("lclsfCd", lclsfCd);
        if (mclsfCd) queryParams.append("mclsfCd", mclsfCd);
        if (sclsfCd) queryParams.append("sclsfCd", sclsfCd);
        queryParams.append("days", days.toString());

        const response = await fetch(`/api/market-prices/trend?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const trendData = result.data || [];

        if (isMounted) {
          setData(trendData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [lclsfCd, mclsfCd, sclsfCd, days]);

  return {
    data,
    isLoading,
    error,
    isError: !!error,
    refetch: async () => {
      if (!lclsfCd) return { data: undefined, error: new Error("대분류 코드가 필요합니다.") };
      
      setIsLoading(true);
      setError(null);
      try {
        // API Route를 통해 서버 사이드에서 공공 API 호출 (CORS 문제 해결)
        const queryParams = new URLSearchParams();
        queryParams.append("lclsfCd", lclsfCd);
        if (mclsfCd) queryParams.append("mclsfCd", mclsfCd);
        if (sclsfCd) queryParams.append("sclsfCd", sclsfCd);
        queryParams.append("days", days.toString());

        const response = await fetch(`/api/market-prices/trend?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const trendData = result.data || [];
        
        setData(trendData);
        return { data: trendData, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { data: undefined, error };
      } finally {
        setIsLoading(false);
      }
    },
  };
}

