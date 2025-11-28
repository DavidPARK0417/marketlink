/**
 * @file components/wholesaler/Dashboard/LowStockAlert.tsx
 * @description 재고 부족 알림 컴포넌트
 *
 * 재고가 10개 이하인 상품을 표시하고 재고 추가 버튼을 제공합니다.
 *
 * @dependencies
 * - app/api/wholesaler/dashboard/low-stock/route.ts
 * - components/ui/card.tsx
 * - components/ui/button.tsx
 * - components/common/EmptyState.tsx
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import { AlertTriangle, Package, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";

/**
 * 재고 부족 상품 조회 함수
 */
async function fetchLowStockProducts(): Promise<Product[]> {
  const response = await fetch("/api/wholesaler/dashboard/low-stock");
  if (!response.ok) {
    throw new Error("재고 부족 상품 조회 실패");
  }
  const data = await response.json();
  return data.products ?? [];
}

export default function LowStockAlert() {
  const { data: lowStockProducts = [], isLoading } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: fetchLowStockProducts,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            재고 부족 알림
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-orange-100 p-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-lg font-semibold text-orange-900">
              재고 부족 알림
            </CardTitle>
            {lowStockProducts.length > 0 && (
              <span className="text-xs text-orange-700">
                {lowStockProducts.length}개 상품 재고 부족
              </span>
            )}
          </div>
        </div>
        {lowStockProducts.length > 0 && (
          <Link href="/wholesaler/products">
            <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              전체 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <EmptyState
            message="재고 부족 상품이 없습니다"
            description="모든 상품의 재고가 충분합니다."
            icon={Package}
          />
        ) : (
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3 shadow-sm hover:bg-orange-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-orange-600">
                      재고: {product.stock_quantity}개
                    </span>
                    {product.stock_quantity <= 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        긴급
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/wholesaler/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                    재고 추가
                  </Button>
                </Link>
              </div>
            ))}
            {lowStockProducts.length > 5 && (
              <p className="text-sm text-center text-orange-700 font-medium">
                외 {lowStockProducts.length - 5}개 상품
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
