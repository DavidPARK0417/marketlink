/**
 * @file lib/metadata/order.ts
 * @description 주문 관련 메타데이터 생성 함수
 *
 * 주문 페이지에서 사용하는 동적 메타데이터를 생성합니다.
 * 주문 정보는 개인정보이므로 검색 엔진 인덱싱을 방지합니다.
 *
 * @dependencies
 * - lib/metadata/index.ts
 * - lib/supabase/queries/orders.ts
 */

import type { Metadata } from "next";
import { getOrderById } from "@/lib/supabase/queries/orders";
import { createOrderMetadata, createMetadata } from "./index";

/**
 * 주문 상세 페이지용 메타데이터 생성
 *
 * 주문 정보는 개인정보이므로 noIndex를 설정하여 검색 엔진에 노출하지 않습니다.
 *
 * @param orderId 주문 ID
 * @returns Metadata 객체 또는 null (주문이 없을 경우)
 */
export async function generateOrderMetadata(
  orderId: string,
): Promise<Metadata | null> {
  console.log("📄 [metadata] 주문 메타데이터 생성 시작", { orderId });

  try {
    // 주문 데이터 조회 (Next.js가 자동으로 캐싱)
    const order = await getOrderById(orderId);

    if (!order) {
      console.log("⚠️ [metadata] 주문 없음:", orderId);
      return null;
    }

    console.log("✅ [metadata] 주문 메타데이터 생성 완료", {
      orderId,
      orderNumber: order.order_number,
    });

    // 주문 정보는 개인정보이므로 검색 엔진 인덱싱 방지
    return createOrderMetadata(order.order_number);
  } catch (error) {
    console.error("❌ [metadata] 주문 메타데이터 생성 실패:", error);
    // 에러 발생 시 기본 메타데이터 반환 (noIndex 설정)
    return createMetadata(
      "주문 정보",
      "주문 정보를 불러올 수 없습니다.",
      {
        noIndex: true,
      },
    );
  }
}

