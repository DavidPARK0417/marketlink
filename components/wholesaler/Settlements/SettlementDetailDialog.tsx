/**
 * @file components/wholesaler/Settlements/SettlementDetailDialog.tsx
 * @description 정산 상세 정보 Dialog 컴포넌트
 *
 * 정산 상세 정보를 모달로 표시하는 컴포넌트입니다.
 * 주문 정보, 정산 계산 내역, 정산 일정, 메타 정보를 포함합니다.
 *
 * @dependencies
 * - components/ui/dialog.tsx
 * - components/wholesaler/Settlements/SettlementStatusBadge.tsx
 * - lib/utils/format.ts
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SettlementStatusBadge from "./SettlementStatusBadge";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { SettlementWithOrder } from "@/lib/supabase/queries/settlements";

interface SettlementDetailDialogProps {
  settlement: SettlementWithOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettlementDetailDialog({
  settlement,
  open,
  onOpenChange,
}: SettlementDetailDialogProps) {
  if (!settlement) return null;

  const order = settlement.orders;
  const product = order?.products;
  const variant = order?.product_variants;

  // 상품 금액 계산 (단가 × 수량)
  const productAmount = order
    ? order.unit_price * order.quantity
    : settlement.order_amount - (order?.shipping_fee ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>정산 상세 정보</DialogTitle>
          <DialogDescription>
            정산 내역의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. 주문 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">주문 정보</h3>
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">주문번호</p>
                  <p className="font-medium">{order?.order_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">주문일</p>
                  <p className="font-medium">
                    {order?.created_at
                      ? formatDate(order.created_at, "ko")
                      : "-"}
                  </p>
                </div>
                {order?.paid_at && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">결제일</p>
                    <p className="font-medium">
                      {formatDate(order.paid_at, "ko")}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t my-4" />

              {/* 상품 정보 */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">상품 정보</p>
                <div className="bg-muted/50 rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        {product?.name || "상품 정보 없음"}
                      </p>
                      {variant?.name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          옵션: {variant.name}
                        </p>
                      )}
                      {product?.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          카테고리: {product.category}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">수량</p>
                      <p className="font-medium">
                        {order?.quantity ? `${order.quantity}개` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">단가</p>
                      <p className="font-medium">
                        {order?.unit_price
                          ? formatPrice(order.unit_price)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">상품 금액</p>
                      <p className="font-medium">
                        {formatPrice(productAmount)}
                      </p>
                    </div>
                  </div>
                  {order?.shipping_fee !== undefined &&
                    order.shipping_fee > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">
                            배송비
                          </p>
                          <p className="font-medium">
                            {formatPrice(order.shipping_fee)}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. 정산 계산 내역 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">정산 계산 내역</h3>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">주문 금액</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    상품 금액 + 배송비
                  </p>
                </div>
                <p className="font-semibold text-lg">
                  {formatPrice(settlement.order_amount)}
                </p>
              </div>

              <div className="border-t my-3" />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    플랫폼 수수료
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    주문 금액 ×{" "}
                    {(settlement.platform_fee_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <p className="font-semibold text-red-600">
                  -{formatPrice(settlement.platform_fee)}
                </p>
              </div>

              <div className="border-t-2 my-3" />

              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-base font-semibold">정산 금액</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    주문 금액 - 플랫폼 수수료
                  </p>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {formatPrice(settlement.wholesaler_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* 3. 정산 일정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">정산 일정</h3>
            <div className="rounded-lg border bg-card p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    정산 상태
                  </p>
                  <SettlementStatusBadge status={settlement.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    정산 예정일
                  </p>
                  <p className="font-medium">
                    {formatDate(settlement.scheduled_payout_at, "ko")}
                  </p>
                </div>
                {settlement.completed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      정산 완료일
                    </p>
                    <p className="font-medium">
                      {formatDate(settlement.completed_at, "ko")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. 메타 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">메타 정보</h3>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">정산 ID</p>
                  <p className="font-mono text-xs break-all">{settlement.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">생성일</p>
                  <p className="font-medium">
                    {formatDate(settlement.created_at, "ko")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
