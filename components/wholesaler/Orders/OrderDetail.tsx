/**
 * @file components/wholesaler/Orders/OrderDetail.tsx
 * @description 주문 상세 컴포넌트
 *
 * 주문 상세 정보를 표시하고 상태를 변경할 수 있는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 주문 정보 표시 (주문번호, 주문일, 상태)
 * 2. 소매점 정보 표시 (익명 코드만, 실명/연락처 노출 금지)
 * 3. 배송지 정보 표시
 * 4. 주문 상품 정보 표시 (카드형)
 * 5. 금액 정보 표시
 * 6. 주문 타임라인 표시
 * 7. 상태 변경 버튼
 *
 * @dependencies
 * - components/ui/card.tsx
 * - components/ui/button.tsx
 * - components/wholesaler/Orders/OrderStatusBadge.tsx
 * - lib/utils/format.ts
 * - actions/wholesaler/update-order-status.ts
 * - types/order.ts
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatDateTime, formatPrice } from "@/lib/utils/format";
import { updateOrderStatus } from "@/actions/wholesaler/update-order-status";
import type { OrderDetail as OrderDetailType } from "@/types/order";
import type { OrderStatus } from "@/types/database";

import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/wholesaler/Orders/OrderStatusBadge";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  CircleCheck,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

interface OrderDetailProps {
  order: OrderDetailType & {
    retailers?: {
      id: string;
      anonymous_code: string;
    } | null;
  };
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = React.useState(false);

  // 다음 상태로 변경 가능한지 확인
  const getNextStatus = (): OrderStatus | null => {
    if (order.status === "pending") return "confirmed";
    if (order.status === "confirmed") return "shipped";
    if (order.status === "shipped") return "completed";
    return null;
  };

  const getNextStatusLabel = (): string => {
    if (order.status === "pending") return "접수 확인";
    if (order.status === "confirmed") return "출고 처리";
    if (order.status === "shipped") return "완료 처리";
    return "";
  };

  const nextStatus = getNextStatus();

  // 상태 변경 핸들러
  const handleStatusChange = async () => {
    if (!nextStatus) return;

    const confirmed = window.confirm(
      `주문 상태를 "${getNextStatusLabel()}"로 변경하시겠습니까?`,
    );

    if (!confirmed) return;

    setIsUpdating(true);

    try {
      console.log("🔄 [order-detail] 주문 상태 변경 시작", {
        orderId: order.id,
        currentStatus: order.status,
        nextStatus,
      });

      const result = await updateOrderStatus(order.id, nextStatus);

      if (!result.success) {
        throw new Error(result.error || "주문 상태 변경 실패");
      }

      console.log("✅ [order-detail] 주문 상태 변경 완료", {
        orderId: order.id,
        newStatus: nextStatus,
      });

      toast.success("주문 상태가 변경되었습니다.");

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });

      // 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("❌ [order-detail] 주문 상태 변경 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "주문 상태 변경 중 오류가 발생했습니다.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // 타임라인 아이템 생성
  const timelineItems = [
    {
      label: "주문 접수",
      date: order.created_at,
      completed: true,
      icon: Clock,
    },
    {
      label: "접수 확인",
      date: order.status !== "pending" ? order.updated_at : null,
      completed: order.status !== "pending",
      icon: CheckCircle2,
    },
    {
      label: "출고 완료",
      date:
        order.status === "shipped" || order.status === "completed"
          ? order.updated_at
          : null,
      completed: order.status === "shipped" || order.status === "completed",
      icon: Truck,
    },
    {
      label: "배송 완료",
      date: order.status === "completed" ? order.updated_at : null,
      completed: order.status === "completed",
      icon: CircleCheck,
    },
  ];

  // 소매점 익명 코드 (retailers 테이블의 anonymous_code 사용)
  const retailerAnonymousCode = order.retailers?.anonymous_code || "R-000"; // 기본값 (실제로는 항상 있어야 함)

  return (
    <div className="p-6 md:p-8">
      {/* 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/wholesaler/orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <PageHeader
            title={`주문 ${order.order_number}`}
            description="주문 상세 정보를 확인하고 상태를 변경할 수 있습니다."
          />
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-6">
        {/* 주문 정보 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              주문 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-600">주문번호</p>
                <p className="mt-1 text-lg font-semibold">
                  {order.order_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">주문일</p>
                <p className="mt-1 text-lg">
                  {formatDateTime(order.created_at, "ko")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">현재 상태</p>
                <div className="mt-1">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 소매점 정보 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              소매점 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600">익명 코드:</p>
              <p className="text-lg font-semibold">{retailerAnonymousCode}</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              ⚠️ 개인정보 보호를 위해 익명 코드만 표시됩니다.
            </p>
          </CardContent>
        </Card>

        {/* 배송지 정보 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              배송지 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-600">배송지 주소</p>
                <p className="mt-1 text-base">{order.delivery_address}</p>
              </div>
              {order.request_note && (
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    배송 요청사항
                  </p>
                  <p className="mt-1 text-base">{order.request_note}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 주문 상품 정보 (카드형) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              주문 상품
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 rounded-lg border p-4">
              {/* 상품 이미지 */}
              {order.product.image_url && (
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
                  <Image
                    src={order.product.image_url}
                    alt={order.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* 상품 정보 */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{order.product.name}</h3>
                {order.variant && (
                  <p className="mt-1 text-sm text-gray-600">
                    옵션: {order.variant.name}
                  </p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">단가</p>
                    <p className="mt-1 font-semibold">
                      {formatPrice(order.unit_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">수량</p>
                    <p className="mt-1 font-semibold">{order.quantity}개</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">합계</p>
                    <p className="mt-1 font-semibold">
                      {formatPrice(order.unit_price * order.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 금액 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              금액 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-600">상품 금액</p>
                <p className="font-semibold">
                  {formatPrice(order.unit_price * order.quantity)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-600">배송비</p>
                <p className="font-semibold">
                  {formatPrice(order.shipping_fee)}
                </p>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <p className="text-lg font-semibold">총 금액</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPrice(order.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주문 타임라인 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              주문 타임라인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        item.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          item.completed ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </p>
                      {item.date && (
                        <p className="mt-1 text-sm text-gray-600">
                          {formatDateTime(item.date, "ko")}
                        </p>
                      )}
                      {!item.date && !item.completed && (
                        <p className="mt-1 text-sm text-gray-400">대기 중</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 상태 변경 버튼 */}
        {nextStatus && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="w-full md:w-auto"
                size="lg"
              >
                {isUpdating ? "처리 중..." : getNextStatusLabel()}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
