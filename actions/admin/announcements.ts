/**
 * @file actions/admin/announcements.ts
 * @description 공지사항 관리 Server Actions
 *
 * 관리자가 공지사항을 생성, 수정, 삭제하는 Server Actions입니다.
 *
 * 주요 기능:
 * 1. 공지사항 생성
 * 2. 공지사항 수정
 * 3. 공지사항 삭제
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 */

"use server";

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@/types/announcement";

/**
 * 공지사항 생성
 */
export async function createAnnouncement(data: CreateAnnouncementRequest) {
  try {
    console.group("📝 [admin/announcements] 공지사항 생성 시작");
    console.log("data:", data);

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    const { data: announcement, error } = await supabase
      .from("announcements")
      .insert({
        title: data.title.trim(),
        content: data.content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [admin/announcements] 공지사항 생성 오류:", error);
      return {
        success: false,
        error: error.message || "공지사항 생성 실패",
      };
    }

    console.log("✅ [admin/announcements] 공지사항 생성 성공:", announcement.id);
    console.groupEnd();

    return {
      success: true,
      announcement,
    };
  } catch (error) {
    console.error("❌ [admin/announcements] 공지사항 생성 예외:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 수정
 */
export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementRequest,
) {
  try {
    console.group("📝 [admin/announcements] 공지사항 수정 시작", { id });
    console.log("data:", data);

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    const updateData: Partial<UpdateAnnouncementRequest> = {};
    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }
    if (data.content !== undefined) {
      updateData.content = data.content.trim();
    }

    const { data: announcement, error } = await supabase
      .from("announcements")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ [admin/announcements] 공지사항 수정 오류:", error);
      return {
        success: false,
        error: error.message || "공지사항 수정 실패",
      };
    }

    console.log("✅ [admin/announcements] 공지사항 수정 성공");
    console.groupEnd();

    return {
      success: true,
      announcement,
    };
  } catch (error) {
    console.error("❌ [admin/announcements] 공지사항 수정 예외:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 삭제
 */
export async function deleteAnnouncement(id: string) {
  try {
    console.group("🗑️ [admin/announcements] 공지사항 삭제 시작", { id });

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ [admin/announcements] 공지사항 삭제 오류:", error);
      return {
        success: false,
        error: error.message || "공지사항 삭제 실패",
      };
    }

    console.log("✅ [admin/announcements] 공지사항 삭제 성공");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [admin/announcements] 공지사항 삭제 예외:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 삭제 중 오류가 발생했습니다.",
    };
  }
}

