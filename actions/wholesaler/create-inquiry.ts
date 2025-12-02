/**
 * @file actions/wholesaler/create-inquiry.ts
 * @description 관리자 문의 작성 Server Action
 *
 * 도매사업자가 관리자에게 문의를 작성하는 Server Action입니다.
 * inquiry_type = 'wholesaler_to_admin'로 저장됩니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인
 * 2. 도매사업자 권한 확인
 * 3. 문의 데이터 검증
 * 4. inquiries 테이블에 INSERT
 *
 * @dependencies
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - types/inquiry.ts (CreateInquiryRequest)
 *
 * @example
 * ```tsx
 * import { createInquiry } from '@/actions/wholesaler/create-inquiry';
 *
 * const result = await createInquiry({
 *   title: "정산 관련 문의",
 *   content: "정산이 늦게 들어왔어요"
 * });
 * ```
 */

"use server";

import { getUserProfile } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { CreateInquiryRequest } from "@/types/inquiry";

/**
 * 문의 생성 결과 타입
 */
export interface CreateInquiryResult {
  success: boolean;
  error?: string;
  inquiryId?: string;
}

/**
 * 관리자 문의 작성 Server Action
 *
 * 도매사업자가 관리자에게 문의를 작성합니다.
 * inquiry_type = 'wholesaler_to_admin'로 저장됩니다.
 *
 * @param {Omit<CreateInquiryRequest, 'user_id' | 'inquiry_type' | 'wholesaler_id' | 'order_id'>} formData - 문의 데이터
 * @returns {Promise<CreateInquiryResult>} 생성 결과
 *
 * @throws {Error} 인증 실패, 권한 없음 등
 */
export async function createInquiry(formData: {
  title: string;
  content: string;
  attachment_urls?: string[] | null;
}): Promise<CreateInquiryResult> {
  try {
    console.group("📝 [inquiry] 관리자 문의 작성 시작");
    console.log("formData:", formData);

    // 1. Clerk 인증 확인 및 profile_id 조회
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [inquiry] 인증되지 않은 사용자");
      return {
        success: false,
        error: "인증이 필요합니다. 다시 로그인해주세요.",
      };
    }

    // 도매사업자 권한 확인
    if (profile.role !== "wholesaler") {
      console.error("❌ [inquiry] 도매사업자 권한 없음:", profile.role);
      return {
        success: false,
        error: "도매사업자만 사용할 수 있는 기능입니다.",
      };
    }

    console.log("✅ [inquiry] 인증 확인 완료, profile_id:", profile.id);

    // 2. 입력 데이터 검증
    const title = formData.title.trim();
    const content = formData.content.trim();

    if (!title || title.length < 2) {
      return {
        success: false,
        error: "제목은 최소 2자 이상 입력해주세요.",
      };
    }

    if (title.length > 200) {
      return {
        success: false,
        error: "제목은 최대 200자까지 입력할 수 있습니다.",
      };
    }

    if (!content || content.length < 10) {
      return {
        success: false,
        error: "내용은 최소 10자 이상 입력해주세요.",
      };
    }

    if (content.length > 5000) {
      return {
        success: false,
        error: "내용은 최대 5000자까지 입력할 수 있습니다.",
      };
    }

    // 첨부 이미지 검증
    if (formData.attachment_urls && formData.attachment_urls.length > 5) {
      return {
        success: false,
        error: "첨부 이미지는 최대 5개까지 업로드할 수 있습니다.",
      };
    }

    // 3. inquiries 테이블에 INSERT
    const supabase = createClerkSupabaseClient();

    const { data: newInquiry, error: insertError } = await supabase
      .from("inquiries")
      .insert({
        user_id: profile.id,
        inquiry_type: "wholesaler_to_admin",
        wholesaler_id: null, // 도매→관리자 문의는 wholesaler_id 불필요
        order_id: null, // 도매→관리자 문의는 order_id 불필요
        title,
        content,
        status: "open",
        admin_reply: null,
        replied_at: null,
        attachment_urls:
          formData.attachment_urls && formData.attachment_urls.length > 0
            ? formData.attachment_urls
            : null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("❌ [inquiry] 문의 작성 실패:", insertError);
      return {
        success: false,
        error: `문의 작성 중 오류가 발생했습니다: ${insertError.message}`,
      };
    }

    // 4. inquiry_messages 테이블에 초기 메시지 추가
    const { error: messageError } = await supabase
      .from("inquiry_messages")
      .insert({
        inquiry_id: newInquiry.id,
        sender_type: "user", // 도매사업자가 관리자에게 보낸 문의이므로 'user'
        sender_id: profile.id,
        content: content.trim(),
      });

    if (messageError) {
      console.warn(
        "⚠️ [inquiry] inquiry_messages 저장 실패 (무시):",
        messageError,
      );
      // 메시지 저장 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [inquiry] inquiry_messages 저장 완료");
    }

    console.log("✅ [inquiry] 문의 작성 성공:", newInquiry.id);
    console.groupEnd();

    return {
      success: true,
      inquiryId: newInquiry.id,
    };
  } catch (error) {
    console.error("❌ [inquiry] 문의 작성 예외:", error);
    console.groupEnd();

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "문의 작성 중 예상치 못한 오류가 발생했습니다.",
    };
  }
}
