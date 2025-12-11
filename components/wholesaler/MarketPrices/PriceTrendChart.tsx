/**
 * @file components/wholesaler/MarketPrices/PriceTrendChart.tsx
 * @description 가격 추이 차트 컴포넌트
 *
 * 일별/월별/연별 시세 추이를 차트로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 일별/월별/연별 시세 추이 차트 (Line Chart)
 * 2. 기간 선택 기능
 * 3. 날짜별 평균 가격 표시
 * 4. 반응형 디자인
 *
 * @dependencies
 * - recharts (차트 라이브러리)
 * - lib/api/market-prices (PriceTrendItem)
 */

"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type LegendProps,
  type LegendPayload,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PriceTrendItem } from "@/lib/api/market-prices-types";

export type TrendPeriod = "daily" | "monthly" | "yearly";

interface PriceTrendChartProps {
  dailyData?: PriceTrendItem[];
  monthlyData?: PriceTrendItem[];
  yearlyData?: PriceTrendItem[];
  isLoading?: boolean;
  itemName?: string;
}

export default function PriceTrendChart({
  dailyData = [],
  monthlyData = [],
  yearlyData = [],
  isLoading = false,
  itemName,
}: PriceTrendChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>("daily");
  const renderLegend = ({ payload }: LegendProps & { payload?: LegendPayload[] }) => {
    if (!payload || payload.length === 0) return null;
    return (
      <ul className="flex flex-wrap gap-3 text-sm text-foreground" aria-label="차트 범례">
        {payload.map((entry) => (
          <li key={entry.value} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color ?? "hsl(var(--foreground))" }}
              aria-hidden="true"
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // 선택된 기간에 따른 데이터
  const currentData = useMemo(() => {
    switch (period) {
      case "daily":
        return dailyData;
      case "monthly":
        return monthlyData;
      case "yearly":
        return yearlyData;
      default:
        return dailyData;
    }
  }, [period, dailyData, monthlyData, yearlyData]);

  // 차트 데이터 포맷팅
  const chartData = useMemo(() => {
    const formatted = currentData.map((item) => ({
      date: item.date,
      가격: item.price,
    }));
    
    // 디버깅: 차트 데이터 확인
    if (formatted.length > 0) {
      console.log(`📊 [PriceTrendChart] ${period} 차트 데이터:`, {
        period,
        itemName,
        dataCount: formatted.length,
        firstItem: formatted[0],
        lastItem: formatted[formatted.length - 1],
      });
    }
    
    return formatted;
  }, [currentData, period, itemName]);

  // 가격 포맷팅 함수
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("ko-KR").format(value) + "원";
  };

  // 날짜 포맷팅 함수
  const formatDate = (date: string) => {
    if (period === "yearly") {
      return date; // 연도만 표시
    } else if (period === "monthly") {
      return date; // YYYY-MM 형식
    } else {
      // 일별: YYYY-MM-DD -> MM/DD
      const [, month, day] = date.split("-");
      return `${month}/${day}`;
    }
  };

  // 기간별 제목 및 설명
  const periodInfo = useMemo(() => {
    switch (period) {
      case "daily":
        return {
          title: "일별 시세 추이",
          description: "최근 30일간의 평균 가격 추이를 확인하세요.",
        };
      case "monthly":
        return {
          title: "월별 시세 추이",
          description: "최근 12개월간의 평균 가격 추이를 확인하세요.",
        };
      case "yearly":
        return {
          title: "연별 시세 추이",
          description: "최근 5년간의 평균 가격 추이를 확인하세요.",
        };
    }
  }, [period]);

  // 로딩 중이거나 데이터가 없을 때
  if (isLoading || (currentData.length === 0 && (dailyData.length === 0 && monthlyData.length === 0 && yearlyData.length === 0))) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64 p-6 md:p-8">
          <div className="text-muted-foreground">차트 데이터를 불러오는 중...</div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 p-6 md:p-8">
        <div className="text-muted-foreground">차트 데이터가 없습니다.</div>
        <div className="text-sm text-muted-foreground">
          {itemName 
            ? `${itemName}의 시세 추이 데이터를 조회할 수 없습니다.`
            : "시세 추이를 조회하려면 품목을 검색하세요."}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 p-6 md:p-8"
      style={{ color: "hsl(var(--foreground))" }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">
            {itemName ? `${itemName} ${periodInfo.title}` : periodInfo.title}
          </h3>
          <p className="text-sm text-muted-foreground">{periodInfo.description}</p>
        </div>

        {/* 기간 선택 탭 */}
        <Tabs value={period} onValueChange={(value) => setPeriod(value as TrendPeriod)}>
          <TabsList>
            <TabsTrigger value="daily">일별</TabsTrigger>
            <TabsTrigger value="monthly">월별</TabsTrigger>
            <TabsTrigger value="yearly">연별</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full" style={{ minHeight: "256px", height: "256px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              angle={period === "daily" ? -45 : 0}
              textAnchor={period === "daily" ? "end" : "middle"}
              height={period === "daily" ? 60 : 30}
            />
            <YAxis
              tickFormatter={(value) => formatPrice(value)}
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              formatter={(value: number) => formatPrice(value)}
              labelFormatter={(label) => `날짜: ${label}`}
              cursor={{ fill: "transparent", stroke: "transparent" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend content={renderLegend} />
            <Line
              type="monotone"
              dataKey="가격"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

