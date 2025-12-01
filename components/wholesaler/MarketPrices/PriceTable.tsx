/**
 * @file components/wholesaler/MarketPrices/PriceTable.tsx
 * @description 시세 테이블 컴포넌트
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { DailyPriceItem } from "@/lib/api/market-prices-types";

interface PriceTableProps {
  data: DailyPriceItem[];
  isLoading?: boolean;
}

export default function PriceTable({ data, isLoading = false }: PriceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // 페이지네이션 계산
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / pageSize);

  // 데이터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // 가격 포맷팅 (천 단위 쉼표)
  const formatPrice = (price: number): string => {
    if (price === 0) return "-";
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 증감률 표시 컴포넌트
  const PriceChangeIndicator = ({ direction, value }: { direction: "0" | "1" | "2"; value: number }) => {
    if (direction === "1") {
      // 상승
      return (
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <ArrowUp className="size-4" />
          <span>+{value.toFixed(1)}%</span>
        </span>
      );
    } else if (direction === "2") {
      // 하락
      return (
        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <ArrowDown className="size-4" />
          <span>-{value.toFixed(1)}%</span>
        </span>
      );
    } else {
      // 보합
      return (
        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <Minus className="size-4" />
          <span>{value.toFixed(1)}%</span>
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">조회된 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">구분</TableHead>
              <TableHead>품목명</TableHead>
              <TableHead className="w-[80px]">단위</TableHead>
              <TableHead className="text-right">당일가격</TableHead>
              <TableHead className="text-right">1일전</TableHead>
              <TableHead className="text-right">1개월전</TableHead>
              <TableHead className="text-right">1년전</TableHead>
              <TableHead className="text-center">증감률</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={`${item.productno}-${item.productClsCode}-${index}`}>
                <TableCell className="font-medium">{item.productClsName}</TableCell>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatPrice(item.dpr1)}원
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatPrice(item.dpr2)}원
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatPrice(item.dpr3)}원
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatPrice(item.dpr4)}원
                </TableCell>
                <TableCell className="text-center">
                  <PriceChangeIndicator direction={item.direction} value={item.value} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            총 {data.length}개 중{" "}
            {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, data.length)}개 표시
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              이전
            </Button>
            <div className="flex items-center px-4 text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

