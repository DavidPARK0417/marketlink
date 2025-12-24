/**
 * @file app/wholesaler/orders/[id]/page.tsx
 * @description 주문 상세 페이지
 *
 * 도매점이 주문 상세 정보를 확인하고 상태를 변경할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. 주문 ID로 상세 정보 조회
 * 2. 주문 정보, 소매점 정보(익명 코드), 배송지 정보 표시
 * 3. 주문 상품 정보 표시 (1 주문 = 1 상품, 카드형)
 * 4. 금액 정보 표시
 * 5. 주문 타임라인 표시
 * 6. 주문 상태 변경 버튼
 *
 * @dependencies
 * - lib/supabase/queries/orders.ts
 * - components/wholesaler/Orders/OrderDetail.tsx
 * - next/navigation (notFound)
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderById } from "@/lib/supabase/queries/orders";
import { generateOrderMetadata } from "@/lib/metadata/order";
import OrderDetail from "@/components/wholesaler/Orders/OrderDetail";

/**
 * 동적 메타데이터 생성
 *
 * 주문 정보는 개인정보이므로 검색 엔진 인덱싱을 방지합니다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const metadata = await generateOrderMetadata(id);

  // 주문이 없거나 메타데이터 생성 실패 시 기본값 반환
  return (
    metadata || {
      title: "주문 정보 - FarmToBiz",
      description: "주문 정보를 불러올 수 없습니다.",
      robots: "noindex, nofollow",
    }
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("🔍 [order-detail-page] 주문 상세 페이지 로드", { orderId: id });

  // 주문 데이터 조회
  const order = await getOrderById(id);

  if (!order) {
    console.log("⚠️ [order-detail-page] 주문 없음", { orderId: id });
    notFound();
  }

  console.log("✅ [order-detail-page] 주문 조회 완료", {
    orderId: id,
    orderNumber: order.order_number,
    status: order.status,
  });

  return <OrderDetail order={order} />;
}
