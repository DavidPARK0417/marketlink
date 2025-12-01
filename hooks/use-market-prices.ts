/**
 * @file hooks/use-market-prices.ts
 * @description 시세 조회 React Query 훅 (최소 버전)
 */

"use client";

import { useState, useEffect } from "react";
import type { MarketPriceParams, PriceItem } from "@/lib/api/market-prices-types";

export function useMarketPrices(params: MarketPriceParams = {}) {
  const [data, setData] = useState<PriceItem[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 파라미터가 없으면 API 호출하지 않음
    if (!params.itemName && !params.countryCode) {
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
        const queryParams = new URLSearchParams();
        if (params.itemName) queryParams.append("itemName", params.itemName);
        if (params.countryCode) queryParams.append("countryCode", params.countryCode);
        if (params.startDay) queryParams.append("startDay", params.startDay);
        if (params.endDay) queryParams.append("endDay", params.endDay);

        const response = await fetch(`/api/market-prices?${queryParams.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
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
  };
}

