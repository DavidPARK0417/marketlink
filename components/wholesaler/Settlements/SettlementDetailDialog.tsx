/**
 * @file components/wholesaler/Settlements/SettlementDetailDialog.tsx
 * @description 정산 상세 정보 Dialog 컴포넌트
 *
 * 정산 상세 정보를 모달로 표시하는 컴포넌트입니다.
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>정산 상세 정보</DialogTitle>
          <DialogDescription>
            정산 내역의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">주문번호</p>
                <p className="font-medium">{order?.order_number || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">주문일</p>
                <p className="font-medium">
                  {order?.created_at ? formatDate(order.created_at, "ko") : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">정산 상태</p>
                <SettlementStatusBadge status={settlement.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">정산 예정일</p>
                <p className="font-medium">
                  {formatDate(settlement.scheduled_payout_at, "ko")}
                </p>
              </div>
              {settlement.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">정산 완료일</p>
                  <p className="font-medium">
                    {formatDate(settlement.completed_at, "ko")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 금액 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">금액 정보</h3>
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">주문 금액</p>
                <p className="font-medium">
                  {formatPrice(settlement.order_amount)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  플랫폼 수수료 (
                  {(settlement.platform_fee_rate * 100).toFixed(1)}%)
                </p>
                <p className="font-medium text-red-600">
                  -{formatPrice(settlement.platform_fee)}
                </p>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <p className="font-semibold">정산 금액</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(settlement.wholesaler_amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 정산 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">정산 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">정산 ID</p>
                <p className="font-mono text-sm">{settlement.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">생성일</p>
                <p className="font-medium">
                  {formatDate(settlement.created_at, "ko")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
