/**
 * @file components/wholesaler/MarketPrices/PriceComparisonChart.tsx
 * @description 4개 시점 가격 비교 차트 컴포넌트
 *
 * dailyCountyList API의 4개 시점 데이터(당일, 1일전, 1개월전, 1년전)를
 * 막대 그래프로 비교 표시합니다.
 *
 * 주요 기능:
 * 1. 4개 시점 가격 비교 (막대 그래프)
 * 2. 가격 증감률 표시
 * 3. 반응형 디자인
 *
 * @dependencies
 * - recharts (차트 라이브러리)
 * - lib/api/market-prices-types (DailyPriceItem)
 */

"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  type LegendProps,
  type LegendPayload,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DailyPriceItem } from "@/lib/api/market-prices-types";

interface PriceComparisonChartProps {
  data: DailyPriceItem;
  isLoading?: boolean;
}

export default function PriceComparisonChart({
  data,
  isLoading = false,
}: PriceComparisonChartProps) {
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
  // 시점별 색상 정의
  const periodColors: Record<string, string> = {
    "1년전": "#94a3b8", // 회색 (오래된 데이터)
    "1개월전": "#fbbf24", // 노란색
    "1일전": "#3b82f6", // 파란색
    "당일": "#10b981", // 초록색 (최신 데이터)
  };

  // 차트 데이터 변환 (시간순: 1년전 -> 1개월전 -> 1일전 -> 당일)
  const chartData = useMemo(() => {
    const items = [
      {
        label: "1년전",
        date: data.day4,
        price: data.dpr4,
        period: "1년전",
        color: periodColors["1년전"],
      },
      {
        label: "1개월전",
        date: data.day3,
        price: data.dpr3,
        period: "1개월전",
        color: periodColors["1개월전"],
      },
      {
        label: "1일전",
        date: data.day2,
        price: data.dpr2,
        period: "1일전",
        color: periodColors["1일전"],
      },
      {
        label: "당일",
        date: data.day1,
        price: data.dpr1,
        period: "당일",
        color: periodColors["당일"],
      },
    ].filter((item) => item.price > 0); // 가격이 0인 항목 제외

    console.log("📊 [PriceComparisonChart] 차트 데이터:", {
      itemName: data.productName,
      dataCount: items.length,
      items,
    });

    return items;
  }, [data]);

  // 가격 포맷팅 함수
  const formatPrice = (value: number) => {
    if (value === 0) return "-";
    return new Intl.NumberFormat("ko-KR").format(value) + "원";
  };

  // 날짜 포맷팅 함수 (YYYY-MM-DD -> MM/DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) {
      const [, month, day] = dateStr.split("-");
      return `${month}/${day}`;
    }
    // YYYYMMDD 형식인 경우
    if (dateStr.length === 8) {
      return `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  };

  // 증감률 표시 컴포넌트 (한국 관행: 상승=빨강, 하락=파랑)
  // 절댓값 + 아이콘으로 부호 구분, 보합은 "-" 표시
  const PriceChangeIndicator = () => {
    const { direction, value } = data;
    if (direction === "1") {
      // 상승 - 빨강, 절댓값 표시
      return (
        <span className="flex items-center gap-1 text-red-500" role="status" aria-label={`상승 ${Math.abs(value).toFixed(1)}%`}>
          <TrendingUp className="w-4 h-4" aria-hidden="true" />
          <span className="font-semibold">{Math.abs(value).toFixed(1)}%</span>
        </span>
      );
    } else if (direction === "2") {
      // 하락 - 파랑, 절댓값 표시
      return (
        <span className="flex items-center gap-1 text-[#10B981]" role="status" aria-label={`하락 ${Math.abs(value).toFixed(1)}%`}>
          <TrendingDown className="w-4 h-4" aria-hidden="true" />
          <span className="font-semibold">{Math.abs(value).toFixed(1)}%</span>
        </span>
      );
    } else {
      // 보합 - 회색, "-" 표시
      return (
        <span className="flex items-center gap-1 text-gray-500" role="status" aria-label="보합">
          <Minus className="w-4 h-4" aria-hidden="true" />
          <span className="font-semibold">-</span>
        </span>
      );
    }
  };

  // 축/눈금 색상을 테마 전경색에 맞춰 강제 적용 (currentColor 사용)
  const axisTickStyle = { fill: "currentColor" };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 p-6 md:p-8">
        <div className="text-muted-foreground">차트 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 p-6 md:p-8">
        <div className="text-muted-foreground">차트 데이터가 없습니다.</div>
        <div className="text-sm text-muted-foreground">
          {data.productName}의 가격 데이터를 표시할 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 p-6 md:p-8"
      style={{ color: "hsl(var(--foreground))" }}
    >
      {/* 제목 및 정보 */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            {data.productName} 가격 비교
          </h3>
          <PriceChangeIndicator />
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>구분: {data.productClsName}</span>
          <span>단위: {data.unit}</span>
          <span>카테고리: {data.categoryName}</span>
        </div>
      </div>

      {/* 막대 그래프 */}
      <div className="w-full h-60 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            style={{ color: "hsl(var(--foreground))" }}
          >
            <XAxis
              dataKey="label"
              className="text-xs"
              tick={axisTickStyle}
            />
            <YAxis
              tickFormatter={(value) => formatPrice(value)}
              className="text-xs"
              tick={axisTickStyle}
            />
            <Tooltip
              formatter={(value: number) => formatPrice(value)}
              cursor={{ fill: "transparent", stroke: "transparent" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              content={renderLegend}
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar
              dataKey="price"
              name="가격"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 가격 상세 정보 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {chartData.map((item) => (
          <div
            key={item.period}
            className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card"
          >
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="text-sm font-semibold text-foreground">{formatPrice(item.price)}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(item.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

