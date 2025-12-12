/**
 * @file hooks/use-admin-notifications.ts
 * @description 관리자 알림 관리 훅
 *
 * 관리자의 도매 승인 대기, 도매 문의, 소매 문의 알림을 관리하는 커스텀 훅입니다.
 * 읽지 않은 항목 개수 조회, 최근 항목 목록 조회, 실시간 업데이트 등을 제공합니다.
 *
 * 주요 기능:
 * 1. 읽지 않은 항목 개수 조회 (React Query)
 * 2. 최근 항목 목록 조회 (React Query)
 * 3. Realtime 구독으로 실시간 업데이트
 * 4. 알림 클릭 시 읽음 처리 (문의의 경우 status 업데이트)
 *
 * @dependencies
 * - @tanstack/react-query
 * - lib/supabase/clerk-client.ts
 * - lib/supabase/queries/admin-notifications.ts
 * - lib/supabase/realtime.ts
 */

"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  getAdminNotificationStats,
  getRecentPendingWholesalers,
  getRecentWholesalerInquiries,
  getRecentRetailInquiries,
  type PendingWholesalerNotification,
  type InquiryNotification,
} from "@/lib/supabase/queries/admin-notifications";
import {
  subscribeToPendingWholesalers,
  subscribeToWholesalerInquiries,
  subscribeToRetailInquiries,
} from "@/lib/supabase/realtime";
import type { Wholesaler } from "@/types/wholesaler";
import type { Inquiry } from "@/types/inquiry";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * 관리자 알림 관리 훅
 *
 * @returns 알림 관련 상태 및 함수
 */
export function useAdminNotifications() {
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  // 알림 통계 조회
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["admin-notifications", "stats"],
    queryFn: async () => {
      return await getAdminNotificationStats(supabase);
    },
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });

  // 최근 도매 승인 대기 목록 조회
  const {
    data: recentPendingWholesalers = [],
    isLoading: isLoadingPendingWholesalers,
  } = useQuery({
    queryKey: ["admin-notifications", "pending-wholesalers"],
    queryFn: async () => {
      return await getRecentPendingWholesalers(supabase, 5);
    },
  });

  // 최근 도매 문의 목록 조회
  const {
    data: recentWholesalerInquiries = [],
    isLoading: isLoadingWholesalerInquiries,
  } = useQuery({
    queryKey: ["admin-notifications", "wholesaler-inquiries"],
    queryFn: async () => {
      return await getRecentWholesalerInquiries(supabase, 5);
    },
  });

  // 최근 소매 문의 목록 조회
  const {
    data: recentRetailInquiries = [],
    isLoading: isLoadingRetailInquiries,
  } = useQuery({
    queryKey: ["admin-notifications", "retail-inquiries"],
    queryFn: async () => {
      return await getRecentRetailInquiries(supabase, 5);
    },
  });

  // 새 알림이 있는지 확인 (우선순위: 도매 승인 대기 > 도매 문의 > 소매 문의)
  const hasNewNotifications =
    (stats?.pendingWholesalersCount ?? 0) > 0 ||
    (stats?.wholesalerInquiriesCount ?? 0) > 0 ||
    (stats?.retailInquiriesCount ?? 0) > 0;

  // 로딩 상태
  const isLoading =
    isLoadingStats ||
    isLoadingPendingWholesalers ||
    isLoadingWholesalerInquiries ||
    isLoadingRetailInquiries;

  // Realtime 구독: 도매 승인 대기
  useEffect(() => {
    console.log("🔔 [admin-notifications-hook] 도매 승인 대기 Realtime 구독 시작");

    const unsubscribe = subscribeToPendingWholesalers(
      supabase,
      (wholesaler: Wholesaler) => {
        console.log("🔔 [admin-notifications-hook] 새 도매 승인 대기 알림:", wholesaler);

        toast.success("새 도매 승인 대기가 있습니다! 🏢", {
          description: wholesaler.business_name,
          action: {
            label: "확인하기",
            onClick: () => router.push("/admin/wholesalers/pending"),
          },
        });

        // 알림 통계 새로고침
        queryClient.invalidateQueries({
          queryKey: ["admin-notifications", "stats"],
        });
        // 최근 목록 새로고침
        queryClient.invalidateQueries({
          queryKey: ["admin-notifications", "pending-wholesalers"],
        });
      },
    );

    // Cleanup
    return () => {
      console.log("🧹 [admin-notifications-hook] 도매 승인 대기 Realtime 구독 해제");
      unsubscribe();
    };
  }, [supabase, queryClient, router]);

  // Realtime 구독: 도매 문의
  useEffect(() => {
    console.log("🔔 [admin-notifications-hook] 도매 문의 Realtime 구독 시작");

    const unsubscribe = subscribeToWholesalerInquiries(
      supabase,
      (inquiry: Inquiry) => {
        console.log("🔔 [admin-notifications-hook] 새 도매 문의 알림:", inquiry);

        toast.success("새 도매 문의가 있습니다! 💬", {
          description: inquiry.title,
          action: {
            label: "확인하기",
            onClick: () => router.push(`/admin/inquiries`),
          },
        });

        // 알림 통계 새로고침
        queryClient.invalidateQueries({
          queryKey: ["admin-notifications", "stats"],
        });
        // 최근 목록 새로고침
        queryClient.invalidateQueries({
          queryKey: ["admin-notifications", "wholesaler-inquiries"],
        });
      },
    );

    // Cleanup
    return () => {
      console.log("🧹 [admin-notifications-hook] 도매 문의 Realtime 구독 해제");
      unsubscribe();
    };
  }, [supabase, queryClient, router]);

  // Realtime 구독: 소매 문의
  useEffect(() => {
    console.log("🔔 [admin-notifications-hook] 소매 문의 Realtime 구독 시작");

    const unsubscribe = subscribeToRetailInquiries(
      supabase,
      (inquiry: Inquiry) => {
        console.log("🔔 [admin-notifications-hook] 새 소매 문의 알림:", inquiry);

        toast.success("새 소매 문의가 있습니다! 📬", {
          description: inquiry.title,
          action: {
            label: "확인하기",
            onClick: () => router.push(`/admin/retail-inquiries`),
          },
        });

        // 알림 통계 새로고침
        queryClient.invalidateQueries({
          queryKey: ["admin-notifications", "stats"],
        });
        // 최근 목록 새로고침
        queryClient.invalidateQueries({
          queryKey: ["admin-notifications", "retail-inquiries"],
        });
      },
    );

    // Cleanup
    return () => {
      console.log("🧹 [admin-notifications-hook] 소매 문의 Realtime 구독 해제");
      unsubscribe();
    };
  }, [supabase, queryClient, router]);

  // 알림 클릭 핸들러 (읽음 처리 포함)
  const handleNotificationClick = async (
    type: "pending-wholesaler" | "wholesaler-inquiry" | "retail-inquiry",
    id: string,
  ) => {
    console.log("🔔 [admin-notifications-hook] 알림 클릭:", { type, id });

    // 문의의 경우 읽음 처리 (status를 'answered'로 변경하지 않고, 단순히 페이지로 이동)
    // 실제 읽음 처리는 문의 상세 페이지에서 처리하도록 함
    if (type === "wholesaler-inquiry") {
      router.push(`/admin/inquiries`);
    } else if (type === "retail-inquiry") {
      router.push(`/admin/retail-inquiries`);
    } else if (type === "pending-wholesaler") {
      router.push(`/admin/wholesalers/pending`);
    }
  };

  return {
    // 통계
    stats: stats ?? {
      pendingWholesalersCount: 0,
      wholesalerInquiriesCount: 0,
      retailInquiriesCount: 0,
      totalCount: 0,
    },
    // 최근 목록
    recentPendingWholesalers,
    recentWholesalerInquiries,
    recentRetailInquiries,
    // 상태
    hasNewNotifications,
    isLoading,
    // 에러
    error: statsError,
    // 핸들러
    handleNotificationClick,
  };
}

