/**
 * @file hooks/use-wholesaler-notifications.ts
 * @description 도매점 알림 관리 훅
 *
 * 도매점의 주문 및 문의 알림을 관리하는 커스텀 훅입니다.
 * 읽지 않은 주문/문의 개수 조회, 최근 주문/문의 목록 조회, 읽음 처리 등을 제공합니다.
 *
 * 주요 기능:
 * 1. 읽지 않은 주문/문의 개수 조회 (React Query)
 * 2. 최근 주문/문의 목록 조회 (React Query)
 * 3. Realtime 구독으로 실시간 업데이트
 * 4. 읽음 처리 (주문만, 문의는 status 기반)
 *
 * @dependencies
 * - @tanstack/react-query
 * - lib/supabase/clerk-client.ts
 * - lib/supabase/queries/notifications.ts
 * - lib/supabase/realtime.ts
 */

"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  getUnreadOrdersCount,
  getRecentOrderNotifications,
  markAllOrdersAsRead,
  getUnreadInquiriesCount,
  getRecentInquiryNotifications,
  type OrderNotification,
  type InquiryNotification,
} from "@/lib/supabase/queries/notifications";
import {
  subscribeToNewOrders,
  subscribeToNewInquiries,
  subscribeToAdminReplies,
} from "@/lib/supabase/realtime";
import { useWholesaler } from "@/hooks/useWholesaler";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * 도매점 알림 관리 훅
 *
 * @returns 알림 관련 상태 및 함수
 */
export function useWholesalerNotifications() {
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: wholesaler, isLoading, error } = useWholesaler();

  // 에러 로깅
  useEffect(() => {
    if (error) {
      console.error(
        "❌ [notifications-hook] 도매점 정보 조회 오류:",
        error instanceof Error ? error.message : JSON.stringify(error, null, 2),
      );
    }
  }, [error]);

  const wholesalerId = wholesaler?.id ?? null;

  // 읽지 않은 주문 개수 조회
  const {
    data: unreadOrdersCount = 0,
    isLoading: isLoadingOrdersCount,
    error: ordersCountError,
  } = useQuery({
    queryKey: ["notifications", "unread-orders-count", wholesalerId],
    queryFn: async () => {
      if (!wholesalerId) return 0;
      return await getUnreadOrdersCount(supabase, wholesalerId);
    },
    enabled: !!wholesalerId,
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });

  // 읽지 않은 문의 개수 조회
  const {
    data: unreadInquiriesCount = 0,
    isLoading: isLoadingInquiriesCount,
    error: inquiriesCountError,
  } = useQuery({
    queryKey: ["notifications", "unread-inquiries-count", wholesalerId],
    queryFn: async () => {
      if (!wholesalerId) return 0;
      return await getUnreadInquiriesCount(supabase, wholesalerId);
    },
    enabled: !!wholesalerId,
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });

  // 최근 주문 목록 조회
  const {
    data: recentOrders = [],
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useQuery({
    queryKey: ["notifications", "recent-orders", wholesalerId],
    queryFn: async () => {
      if (!wholesalerId) return [];
      return await getRecentOrderNotifications(supabase, wholesalerId, 5);
    },
    enabled: !!wholesalerId,
  });

  // 최근 문의 목록 조회
  const {
    data: recentInquiries = [],
    isLoading: isLoadingInquiries,
    error: inquiriesError,
  } = useQuery({
    queryKey: ["notifications", "recent-inquiries", wholesalerId],
    queryFn: async () => {
      if (!wholesalerId) return [];
      return await getRecentInquiryNotifications(supabase, wholesalerId, 5);
    },
    enabled: !!wholesalerId,
  });

  // 읽음 처리 Mutation (주문만 - 문의는 status 기반이므로 읽음 처리 불필요)
  const markOrdersAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!wholesalerId) return 0;
      return await markAllOrdersAsRead(supabase, wholesalerId);
    },
    onSuccess: (count) => {
      console.log("✅ [notifications-hook] 주문 읽음 처리 완료:", count);
      // 관련 쿼리 무효화하여 자동 새로고침
      queryClient.invalidateQueries({
        queryKey: ["notifications", wholesalerId],
      });
    },
    onError: (error) => {
      console.error("❌ [notifications-hook] 주문 읽음 처리 오류:", error);
    },
  });

  // Realtime 구독 (새 주문 알림)
  useEffect(() => {
    if (!wholesalerId) return;

    console.log("🔔 [notifications-hook] 주문 Realtime 구독 시작", {
      wholesalerId,
    });

    const unsubscribe = subscribeToNewOrders(
      supabase,
      wholesalerId,
      (order) => {
        console.log("🔔 [notifications-hook] 새 주문 알림:", order);
        // 읽지 않은 주문 개수 새로고침
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-orders-count", wholesalerId],
        });
        // 최근 주문 목록 새로고침
        queryClient.invalidateQueries({
          queryKey: ["notifications", "recent-orders", wholesalerId],
        });
      },
    );

    // Cleanup
    return () => {
      console.log("🧹 [notifications-hook] 주문 Realtime 구독 해제");
      unsubscribe();
    };
  }, [wholesalerId, supabase, queryClient]);

  // Realtime 구독 (새 문의 알림)
  useEffect(() => {
    if (!wholesalerId) return;

    console.log("🔔 [notifications-hook] 문의 Realtime 구독 시작", {
      wholesalerId,
    });

    const unsubscribe = subscribeToNewInquiries(
      supabase,
      wholesalerId,
      (inquiry) => {
        console.log("🔔 [notifications-hook] 새 문의 알림:", inquiry);

        // Toast 알림 표시
        toast.success("새 문의가 들어왔습니다! 📬", {
          description: inquiry.title,
          action: {
            label: "확인하기",
            onClick: () => router.push(`/wholesaler/inquiries/${inquiry.id}`),
          },
        });

        // 읽지 않은 문의 개수 새로고침
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-inquiries-count", wholesalerId],
        });
        // 최근 문의 목록 새로고침
        queryClient.invalidateQueries({
          queryKey: ["notifications", "recent-inquiries", wholesalerId],
        });
      },
    );

    // Cleanup
    return () => {
      console.log("🧹 [notifications-hook] 문의 Realtime 구독 해제");
      unsubscribe();
    };
  }, [wholesalerId, supabase, queryClient, router]);

  // Realtime 구독 (관리자 답변 알림)
  useEffect(() => {
    if (!wholesalerId || !wholesaler?.profile_id) return;

    console.log("🔔 [notifications-hook] 관리자 답변 구독 시작", {
      wholesalerId,
      profileId: wholesaler.profile_id,
    });

    const unsubscribe = subscribeToAdminReplies(
      supabase,
      wholesaler.profile_id, // inquiries.user_id와 비교할 profile_id
      (message, inquiry) => {
        console.log("🔔 [notifications-hook] 관리자 답변 알림:", {
          messageId: message.id,
          inquiryId: inquiry.id,
        });

        // Toast 알림 표시
        toast.success("관리자 답변이 도착했습니다! 💬", {
          description: inquiry.title,
          action: {
            label: "확인하기",
            onClick: () => router.push(`/wholesaler/support/${inquiry.id}`),
          },
        });

        // 최근 문의 목록 새로고침 (관리자 답변 포함)
        queryClient.invalidateQueries({
          queryKey: ["notifications", "recent-inquiries", wholesalerId],
        });
      },
    );

    // Cleanup
    return () => {
      console.log("🧹 [notifications-hook] 관리자 답변 구독 해제");
      unsubscribe();
    };
  }, [wholesalerId, wholesaler?.profile_id, supabase, queryClient, router]);

  // 전체 읽지 않은 알림 개수
  const totalUnreadCount = unreadOrdersCount + unreadInquiriesCount;

  return {
    // 주문 관련
    unreadOrdersCount,
    recentOrders,
    hasNewOrderNotifications: unreadOrdersCount > 0,

    // 문의 관련
    unreadInquiriesCount,
    recentInquiries,
    hasNewInquiryNotifications: unreadInquiriesCount > 0,

    // 통합 (기존 호환성 유지)
    totalUnreadCount,
    unreadCount: totalUnreadCount,
    hasNewNotifications: totalUnreadCount > 0,
    isLoading:
      isLoadingOrdersCount ||
      isLoadingInquiriesCount ||
      isLoadingOrders ||
      isLoadingInquiries,
    error:
      ordersCountError || inquiriesCountError || ordersError || inquiriesError,

    // 함수
    markAsRead: () => markOrdersAsReadMutation.mutate(), // 주문만 읽음 처리
    isMarkingAsRead: markOrdersAsReadMutation.isPending,
  };
}
