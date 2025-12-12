/**
 * @file realtime.ts
 * @description Supabase Realtime 구독 함수들
 *
 * 이 파일은 Supabase Realtime을 사용하여 실시간 데이터 변경을 구독하는 함수들을 제공합니다.
 * 주문 알림, 도매 승인 상태 변경, 문의 알림 등을 실시간으로 받을 수 있습니다.
 *
 * ⚠️ 중요: 메모리 누수 방지
 * - 모든 구독 함수는 cleanup 함수를 반환합니다
 * - useEffect에서 사용 시 반드시 cleanup 함수를 호출해야 합니다
 * - 컴포넌트 언마운트 시 구독을 해제하지 않으면 메모리 누수가 발생합니다
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useEffect } from 'react';
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { subscribeToNewOrders } from '@/lib/supabase/realtime';
 *
 * export default function DashboardPage() {
 *   const supabase = useClerkSupabaseClient();
 *   const wholesalerId = 'your-wholesaler-id';
 *
 *   useEffect(() => {
 *     const unsubscribe = subscribeToNewOrders(
 *       supabase,
 *       wholesalerId,
 *       (order) => {
 *         console.log('새 주문:', order);
 *         // 토스트 알림 표시 등
 *       }
 *     );
 *
 *     // ⚠️ 필수: cleanup 함수 호출
 *     return () => {
 *       console.log('🧹 Cleaning up order subscription');
 *       unsubscribe();
 *     };
 *   }, [supabase, wholesalerId]);
 *
 *   return <div>대시보드</div>;
 * }
 * ```
 *
 * @dependencies
 * - @supabase/supabase-js
 * - types/order.ts
 * - types/wholesaler.ts
 * - types/inquiry.ts
 *
 * @see {@link ./clerk-client.ts} - 클라이언트 컴포넌트용 Supabase 클라이언트
 * @see {@link ./server.ts} - 서버 컴포넌트용 Supabase 클라이언트
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/types/order";
import type { Wholesaler } from "@/types/wholesaler";
import type { Inquiry } from "@/types/inquiry";
import type { InquiryMessage } from "@/types/database";

/**
 * 새 주문 구독
 *
 * 특정 도매점에 대한 새 주문이 생성될 때 실시간으로 알림을 받습니다.
 * orders 테이블의 INSERT 이벤트를 구독합니다.
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트 인스턴스
 * @param {string} wholesalerId - 도매점 ID
 * @param {(order: Order) => void} onNewOrder - 새 주문이 생성될 때 호출되는 콜백 함수
 * @returns {() => void} 구독 해제 함수 (cleanup)
 *
 * @example
 * ```tsx
 * const unsubscribe = subscribeToNewOrders(
 *   supabase,
 *   wholesalerId,
 *   (order) => {
 *     toast({
 *       title: "새 주문이 들어왔습니다! 🎉",
 *       description: `주문번호: ${order.order_number}`,
 *     });
 *   }
 * );
 *
 * // 나중에 구독 해제
 * unsubscribe();
 * ```
 */
export function subscribeToNewOrders(
  supabase: SupabaseClient,
  wholesalerId: string,
  onNewOrder: (order: Order) => void,
): () => void {
  const channel = supabase
    .channel(`new-orders-${wholesalerId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `wholesaler_id=eq.${wholesalerId}`,
      },
      (payload) => {
        console.log("🔔 새 주문 알림:", payload.new);
        onNewOrder(payload.new as Order);
      },
    )
    .subscribe();

  // 반드시 cleanup 함수 반환 (메모리 누수 방지)
  return () => {
    console.log(
      `🧹 Cleaning up order subscription for wholesaler: ${wholesalerId}`,
    );
    supabase.removeChannel(channel);
  };
}

/**
 * 주문 상태 변경 구독
 *
 * 특정 도매점의 주문 상태가 변경될 때 실시간으로 알림을 받습니다.
 * orders 테이블의 UPDATE 이벤트를 구독합니다.
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트 인스턴스
 * @param {string} wholesalerId - 도매점 ID
 * @param {(order: Order) => void} onOrderUpdate - 주문 상태가 변경될 때 호출되는 콜백 함수
 * @returns {() => void} 구독 해제 함수 (cleanup)
 *
 * @example
 * ```tsx
 * const unsubscribe = subscribeToOrderUpdates(
 *   supabase,
 *   wholesalerId,
 *   (order) => {
 *     console.log('주문 상태 변경:', order.status);
 *     // UI 업데이트 등
 *   }
 * );
 *
 * // 나중에 구독 해제
 * unsubscribe();
 * ```
 */
export function subscribeToOrderUpdates(
  supabase: SupabaseClient,
  wholesalerId: string,
  onOrderUpdate: (order: Order) => void,
): () => void {
  const channel = supabase
    .channel(`order-updates-${wholesalerId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `wholesaler_id=eq.${wholesalerId}`,
      },
      (payload) => {
        console.log("🔄 주문 상태 변경 알림:", payload.new);
        onOrderUpdate(payload.new as Order);
      },
    )
    .subscribe();

  // 반드시 cleanup 함수 반환 (메모리 누수 방지)
  return () => {
    console.log(
      `🧹 Cleaning up order update subscription for wholesaler: ${wholesalerId}`,
    );
    supabase.removeChannel(channel);
  };
}

/**
 * 도매점 승인 상태 변경 구독
 *
 * 특정 도매점의 승인 상태가 변경될 때 실시간으로 알림을 받습니다.
 * wholesalers 테이블의 UPDATE 이벤트를 구독합니다.
 * 주로 승인 대기 페이지에서 사용됩니다.
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트 인스턴스
 * @param {string} wholesalerId - 도매점 ID
 * @param {(wholesaler: Wholesaler) => void} onStatusChange - 승인 상태가 변경될 때 호출되는 콜백 함수
 * @returns {() => void} 구독 해제 함수 (cleanup)
 *
 * @example
 * ```tsx
 * const unsubscribe = subscribeToWholesalerStatus(
 *   supabase,
 *   wholesalerId,
 *   (wholesaler) => {
 *     if (wholesaler.status === 'approved') {
 *       router.push('/wholesaler/dashboard');
 *     }
 *   }
 * );
 *
 * // 나중에 구독 해제
 * unsubscribe();
 * ```
 */
export function subscribeToWholesalerStatus(
  supabase: SupabaseClient,
  wholesalerId: string,
  onStatusChange: (wholesaler: Wholesaler) => void,
): () => void {
  const channel = supabase
    .channel(`wholesaler-status-${wholesalerId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "wholesalers",
        filter: `id=eq.${wholesalerId}`,
      },
      (payload) => {
        console.log("✅ 도매점 승인 상태 변경 알림:", payload.new);
        onStatusChange(payload.new as Wholesaler);
      },
    )
    .subscribe();

  // 반드시 cleanup 함수 반환 (메모리 누수 방지)
  return () => {
    console.log(
      `🧹 Cleaning up wholesaler status subscription: ${wholesalerId}`,
    );
    supabase.removeChannel(channel);
  };
}

/**
 * 새 문의 구독
 *
 * 특정 도매점에 대한 새 문의가 생성될 때 실시간으로 알림을 받습니다.
 * inquiries 테이블의 INSERT 이벤트를 구독합니다.
 * inquiry_type이 'retailer_to_wholesaler'이고 wholesaler_id가 일치하는 문의만 필터링합니다.
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트 인스턴스
 * @param {string} wholesalerId - 도매점 ID
 * @param {(inquiry: Inquiry) => void} onNewInquiry - 새 문의가 생성될 때 호출되는 콜백 함수
 * @returns {() => void} 구독 해제 함수 (cleanup)
 *
 * @example
 * ```tsx
 * const unsubscribe = subscribeToNewInquiries(
 *   supabase,
 *   wholesalerId,
 *   (inquiry) => {
 *     toast({
 *       title: "새 문의가 들어왔습니다",
 *       description: inquiry.title,
 *     });
 *   }
 * );
 *
 * // 나중에 구독 해제
 * unsubscribe();
 * ```
 */
export function subscribeToNewInquiries(
  supabase: SupabaseClient,
  wholesalerId: string,
  onNewInquiry: (inquiry: Inquiry) => void,
): () => void {
  const channel = supabase
    .channel(`new-inquiries-${wholesalerId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "inquiries",
        filter: `wholesaler_id=eq.${wholesalerId}`,
      },
      (payload) => {
        const inquiry = payload.new as Inquiry;
        // inquiry_type이 'retailer_to_wholesaler'인 경우만 처리
        if (inquiry.inquiry_type === "retailer_to_wholesaler") {
          console.log("📬 새 문의 알림:", inquiry);
          onNewInquiry(inquiry);
        }
      },
    )
    .subscribe();

  // 반드시 cleanup 함수 반환 (메모리 누수 방지)
  return () => {
    console.log(
      `🧹 Cleaning up inquiry subscription for wholesaler: ${wholesalerId}`,
    );
    supabase.removeChannel(channel);
  };
}

/**
 * 관리자 답변 구독 (도매→관리자 문의)
 *
 * 관리자가 도매점 문의에 답변을 달 때 실시간으로 알림을 받습니다.
 * inquiry_messages 테이블의 INSERT 이벤트를 구독합니다.
 * sender_type='admin'이고 inquiry_type='wholesaler_to_admin'인 경우만 처리합니다.
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트 인스턴스
 * @param {string} wholesalerProfileId - 도매점의 profile_id (inquiries.user_id와 비교)
 * @param {(message: InquiryMessage, inquiry: Inquiry) => void} onAdminReply - 관리자 답변이 생성될 때 호출되는 콜백 함수
 * @returns {() => void} 구독 해제 함수 (cleanup)
 *
 * @example
 * ```tsx
 * const unsubscribe = subscribeToAdminReplies(
 *   supabase,
 *   wholesalerProfileId,
 *   (message, inquiry) => {
 *     toast({
 *       title: "관리자 답변이 도착했습니다! 💬",
 *       description: inquiry.title,
 *     });
 *   }
 * );
 *
 * // 나중에 구독 해제
 * unsubscribe();
 * ```
 */
export function subscribeToAdminReplies(
  supabase: SupabaseClient,
  wholesalerProfileId: string,
  onAdminReply: (message: InquiryMessage, inquiry: Inquiry) => void,
): () => void {
  const channel = supabase
    .channel(`admin-replies-${wholesalerProfileId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "inquiry_messages",
        filter: `sender_type=eq.admin`, // 관리자 메시지만 필터링
      },
      async (payload) => {
        const message = payload.new as InquiryMessage;

        console.log("🔔 [realtime] 관리자 메시지 INSERT 감지:", message);

        // 해당 문의 정보 조회
        const { data: inquiry, error: inquiryError } = await supabase
          .from("inquiries")
          .select("*")
          .eq("id", message.inquiry_id)
          .single();

        if (inquiryError) {
          console.error("❌ [realtime] 문의 조회 오류:", inquiryError);
          return;
        }

        if (!inquiry) {
          console.warn(
            "⚠️ [realtime] 문의를 찾을 수 없음:",
            message.inquiry_id,
          );
          return;
        }

        // 도매→관리자 문의이고, 현재 도매점의 문의인 경우만 처리
        if (
          inquiry.inquiry_type === "wholesaler_to_admin" &&
          inquiry.user_id === wholesalerProfileId
        ) {
          console.log("📬 [realtime] 관리자 답변 알림:", {
            messageId: message.id,
            inquiryId: inquiry.id,
            inquiryTitle: inquiry.title,
          });
          onAdminReply(message, inquiry);
        } else {
          console.log("⏭️ [realtime] 알림 대상 아님:", {
            inquiryType: inquiry.inquiry_type,
            inquiryUserId: inquiry.user_id,
            wholesalerProfileId,
          });
        }
      },
    )
    .subscribe();

  // 반드시 cleanup 함수 반환 (메모리 누수 방지)
  return () => {
    console.log(
      `🧹 Cleaning up admin reply subscription: ${wholesalerProfileId}`,
    );
    supabase.removeChannel(channel);
  };
}
