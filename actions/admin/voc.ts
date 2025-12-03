/**
 * @file actions/admin/voc.ts
 * @description VOC 피드백 조회 Server Actions
 *
 * 관리자가 고객의 소리(VOC) 피드백을 조회하는 Server Actions입니다.
 *
 * 주요 기능:
 * 1. VOC 피드백 목록 조회
 * 2. VOC 피드백 상세 조회
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 */

"use server";

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { VOCFeedbackFilter } from "@/types/voc";

/**
 * VOC 피드백 목록 조회
 */
export async function getVOCFeedbacks(filter: VOCFeedbackFilter = {}) {
  try {
    console.group("📋 [admin/voc] VOC 피드백 목록 조회 시작");
    console.log("filter:", filter);

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    let query = supabase
      .from("voc_feedbacks")
      .select(
        `
        *,
        profiles:profile_id (
          email,
          role
        )
      `,
      )
      .order("created_at", { ascending: false });

    // 필터 적용
    if (filter.profile_id) {
      query = query.eq("profile_id", filter.profile_id);
    }

    if (filter.start_date) {
      query = query.gte("created_at", filter.start_date);
    }

    if (filter.end_date) {
      query = query.lte("created_at", filter.end_date);
    }

    const { data: feedbacks, error } = await query;

    if (error) {
      console.error("❌ [admin/voc] VOC 피드백 조회 오류:", error);
      return {
        success: false,
        error: error.message || "VOC 피드백 조회 실패",
      };
    }

    // 검색어 필터링 (애플리케이션 레벨)
    let filteredFeedbacks = feedbacks || [];
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredFeedbacks = filteredFeedbacks.filter(
        (feedback) =>
          feedback.title.toLowerCase().includes(searchLower) ||
          feedback.content.toLowerCase().includes(searchLower),
      );
    }

    // 타입 변환
    const typedFeedbacks = filteredFeedbacks.map((feedback: any) => ({
      ...feedback,
      profile: feedback.profiles
        ? {
            email: feedback.profiles.email,
            role: feedback.profiles.role,
          }
        : undefined,
    }));

    console.log("✅ [admin/voc] VOC 피드백 목록 조회 성공:", typedFeedbacks.length);
    console.groupEnd();

    return {
      success: true,
      feedbacks: typedFeedbacks,
    };
  } catch (error) {
    console.error("❌ [admin/voc] VOC 피드백 조회 예외:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "VOC 피드백 조회 중 오류가 발생했습니다.",
    };
  }
}

