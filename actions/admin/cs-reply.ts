/**
 * @file actions/admin/cs-reply.ts
 * @description CS 답변 및 티켓 종료 Server Action
 *
 * 관리자가 CS 문의에 답변을 작성하거나 티켓을 종료하는 Server Action입니다.
 * 답변 작성 시 cs_messages 테이블에 메시지를 삽입하고, 티켓 상태를 업데이트합니다.
 * 모든 액션은 감사 로그에 기록됩니다.
 *
 * 주요 기능:
 * 1. CS 답변 작성 (replyToCS)
 *    - cs_messages 테이블에 답변 삽입
 *    - cs_threads.status를 'answered'로 업데이트
 *    - audit_logs에 기록
 * 2. CS 티켓 종료 (closeCSThread)
 *    - cs_threads.status를 'closed'로 업데이트
 *    - closed_at 설정
 *    - audit_logs에 기록
 * 3. CS 답변 수정 (updateCSMessage)
 *    - 관리자가 작성한 답변 수정
 *    - audit_logs에 기록 (이전 내용 포함)
 * 4. CS 답변 삭제 (deleteCSMessage)
 *    - 관리자가 작성한 답변 삭제
 *    - audit_logs에 기록 (삭제된 내용 포함)
 *
 * @dependencies
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/clerk/auth.ts (requireAdmin)
 * - next/headers (headers)
 * - next/cache (revalidatePath)
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/clerk/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * IP 주소 추출
 *
 * Next.js 15에서는 headers()가 Promise를 반환합니다.
 * x-forwarded-for 또는 x-real-ip 헤더에서 IP 주소를 추출합니다.
 *
 * @returns {Promise<string>} IP 주소 (추출 실패 시 "unknown")
 */
async function getIpAddress(): Promise<string> {
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  console.log("🔍 [admin/cs-reply] IP 주소 추출:", ipAddress);
  return ipAddress;
}

/**
 * CS 답변 작성
 *
 * 관리자가 CS 문의에 답변을 작성합니다.
 * cs_messages 테이블에 답변을 삽입하고, cs_threads.status를 'answered'로 업데이트합니다.
 *
 * @param {string} threadId - CS 스레드 ID
 * @param {string} content - 답변 내용
 * @throws {Error} 답변 작성 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await replyToCS(threadId, "답변 내용입니다.");
 * ```
 */
export async function replyToCS(threadId: string, content: string) {
  try {
    console.group("📝 [admin/cs-reply] CS 답변 작성 시작");
    console.log("threadId:", threadId);
    console.log("content length:", content.length);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    console.log("✅ [admin/cs-reply] 관리자 확인:", profile.email);

    // 답변 내용 유효성 검증
    if (!content || content.trim().length === 0) {
      throw new Error("답변 내용을 입력해주세요.");
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 5) {
      throw new Error("답변 내용은 최소 5자 이상 입력해주세요.");
    }

    if (trimmedContent.length > 5000) {
      throw new Error("답변 내용은 최대 5,000자까지 입력 가능합니다.");
    }

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. CS 스레드 정보 조회 (존재 여부 확인)
    const { data: thread, error: threadError } = await supabase
      .from("cs_threads")
      .select("id, status")
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      console.error("❌ [admin/cs-reply] CS 스레드 조회 오류:", threadError);
      throw new Error("CS 문의를 찾을 수 없습니다.");
    }

    // closed 상태에서는 답변 불가
    if (thread.status === "closed") {
      throw new Error("이미 종료된 티켓에는 답변을 작성할 수 없습니다.");
    }

    console.log("✅ [admin/cs-reply] CS 스레드 확인:", thread.status);

    // 2. cs_messages 테이블에 답변 삽입
    const { data: message, error: messageError } = await supabase
      .from("cs_messages")
      .insert({
        cs_thread_id: threadId,
        sender_type: "admin",
        sender_id: profile.id,
        content: trimmedContent,
      })
      .select()
      .single();

    if (messageError) {
      console.error("❌ [admin/cs-reply] 메시지 삽입 오류:", messageError);
      throw new Error("답변을 저장하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 메시지 삽입 완료:", message.id);

    // 3. cs_threads.status를 'answered'로 업데이트
    const { error: updateError } = await supabase
      .from("cs_threads")
      .update({
        status: "answered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", threadId);

    if (updateError) {
      console.error("❌ [admin/cs-reply] 스레드 상태 업데이트 오류:", updateError);
      throw new Error("티켓 상태를 업데이트하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 스레드 상태 업데이트 완료: answered");

    // 4. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: profile.id,
      action: "cs_reply",
      target_type: "cs_thread",
      target_id: threadId,
      details: {
        thread_id: threadId,
        message_id: message.id,
        content_length: trimmedContent.length,
        previous_status: thread.status,
        new_status: "answered",
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin/cs-reply] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin/cs-reply] 감사 로그 기록 완료");
    }

    console.log("✅ [admin/cs-reply] CS 답변 작성 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/cs/${threadId}`);
    revalidatePath("/admin/cs");

    return { success: true, messageId: message.id };
  } catch (error) {
    console.error("❌ [admin/cs-reply] replyToCS 예외:", error);
    throw error;
  }
}

/**
 * CS 티켓 종료
 *
 * 관리자가 CS 티켓을 종료합니다.
 * cs_threads.status를 'closed'로 업데이트하고, closed_at을 설정합니다.
 *
 * @param {string} threadId - CS 스레드 ID
 * @throws {Error} 티켓 종료 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await closeCSThread(threadId);
 * ```
 */
export async function closeCSThread(threadId: string) {
  try {
    console.group("🔒 [admin/cs-reply] CS 티켓 종료 시작");
    console.log("threadId:", threadId);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    console.log("✅ [admin/cs-reply] 관리자 확인:", profile.email);

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. CS 스레드 정보 조회 (현재 상태 확인)
    const { data: thread, error: threadError } = await supabase
      .from("cs_threads")
      .select("id, status")
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      console.error("❌ [admin/cs-reply] CS 스레드 조회 오류:", threadError);
      throw new Error("CS 문의를 찾을 수 없습니다.");
    }

    if (thread.status === "closed") {
      throw new Error("이미 종료된 티켓입니다.");
    }

    console.log("✅ [admin/cs-reply] CS 스레드 확인:", thread.status);

    // 2. cs_threads.status를 'closed'로 업데이트
    const closedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("cs_threads")
      .update({
        status: "closed",
        closed_at: closedAt,
        updated_at: closedAt,
      })
      .eq("id", threadId);

    if (updateError) {
      console.error("❌ [admin/cs-reply] 스레드 상태 업데이트 오류:", updateError);
      throw new Error("티켓을 종료하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 스레드 상태 업데이트 완료: closed");

    // 3. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: profile.id,
      action: "cs_close",
      target_type: "cs_thread",
      target_id: threadId,
      details: {
        thread_id: threadId,
        previous_status: thread.status,
        new_status: "closed",
        closed_at: closedAt,
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin/cs-reply] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin/cs-reply] 감사 로그 기록 완료");
    }

    console.log("✅ [admin/cs-reply] CS 티켓 종료 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/cs/${threadId}`);
    revalidatePath("/admin/cs");

    return { success: true };
  } catch (error) {
    console.error("❌ [admin/cs-reply] closeCSThread 예외:", error);
    throw error;
  }
}

/**
 * CS 답변 수정
 *
 * 관리자가 작성한 CS 답변을 수정합니다.
 * 본인이 작성한 메시지만 수정할 수 있으며, 수정 전 내용은 audit_logs에 기록됩니다.
 *
 * @param {string} messageId - 수정할 메시지 ID
 * @param {string} newContent - 새로운 답변 내용
 * @throws {Error} 답변 수정 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await updateCSMessage(messageId, "수정된 답변 내용입니다.");
 * ```
 */
export async function updateCSMessage(
  messageId: string,
  newContent: string,
) {
  try {
    console.group("✏️ [admin/cs-reply] CS 답변 수정 시작");
    console.log("messageId:", messageId);
    console.log("newContent length:", newContent.length);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    console.log("✅ [admin/cs-reply] 관리자 확인:", profile.email);

    // 답변 내용 유효성 검증
    if (!newContent || newContent.trim().length === 0) {
      throw new Error("답변 내용을 입력해주세요.");
    }

    const trimmedContent = newContent.trim();

    if (trimmedContent.length < 5) {
      throw new Error("답변 내용은 최소 5자 이상 입력해주세요.");
    }

    if (trimmedContent.length > 5000) {
      throw new Error("답변 내용은 최대 5,000자까지 입력 가능합니다.");
    }

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. 메시지 정보 조회 (존재 여부 및 권한 확인)
    const { data: message, error: messageError } = await supabase
      .from("cs_messages")
      .select("id, cs_thread_id, sender_type, sender_id, content")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      console.error("❌ [admin/cs-reply] 메시지 조회 오류:", messageError);
      throw new Error("답변을 찾을 수 없습니다.");
    }

    // 관리자가 작성한 메시지만 수정 가능
    if (message.sender_type !== "admin") {
      throw new Error("관리자가 작성한 답변만 수정할 수 있습니다.");
    }

    // 본인이 작성한 메시지인지 확인 (선택사항이지만 보안을 위해 추가)
    if (message.sender_id !== profile.id) {
      console.warn(
        "⚠️ [admin/cs-reply] 다른 관리자가 작성한 메시지 수정 시도:",
        message.sender_id,
      );
      // 관리자는 다른 관리자의 메시지도 수정할 수 있도록 허용
      // 필요시 아래 주석을 해제하여 본인 메시지만 수정 가능하도록 제한
      // throw new Error("본인이 작성한 답변만 수정할 수 있습니다.");
    }

    console.log("✅ [admin/cs-reply] 메시지 확인:", message.id);
    console.log("이전 내용 길이:", message.content.length);

    // 2. 메시지 내용 업데이트
    const { error: updateError } = await supabase
      .from("cs_messages")
      .update({
        content: trimmedContent,
      })
      .eq("id", messageId);

    if (updateError) {
      console.error("❌ [admin/cs-reply] 메시지 수정 오류:", updateError);
      throw new Error("답변을 수정하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 메시지 수정 완료");

    // 3. 스레드의 updated_at 업데이트
    const { error: threadUpdateError } = await supabase
      .from("cs_threads")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.cs_thread_id);

    if (threadUpdateError) {
      console.warn(
        "⚠️ [admin/cs-reply] 스레드 updated_at 업데이트 실패 (무시):",
        threadUpdateError,
      );
    }

    // 4. 감사 로그 기록 (이전 내용 포함)
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: profile.id,
      action: "cs_message_update",
      target_type: "cs_message",
      target_id: messageId,
      details: {
        message_id: messageId,
        thread_id: message.cs_thread_id,
        previous_content: message.content,
        previous_content_length: message.content.length,
        new_content: trimmedContent,
        new_content_length: trimmedContent.length,
        sender_id: message.sender_id,
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin/cs-reply] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin/cs-reply] 감사 로그 기록 완료");
    }

    console.log("✅ [admin/cs-reply] CS 답변 수정 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/cs/${message.cs_thread_id}`);
    revalidatePath("/admin/cs");

    return { success: true };
  } catch (error) {
    console.error("❌ [admin/cs-reply] updateCSMessage 예외:", error);
    throw error;
  }
}

/**
 * CS 답변 삭제
 *
 * 관리자가 작성한 CS 답변을 삭제합니다.
 * 본인이 작성한 메시지만 삭제할 수 있으며, 삭제 전 내용은 audit_logs에 기록됩니다.
 *
 * @param {string} messageId - 삭제할 메시지 ID
 * @throws {Error} 답변 삭제 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await deleteCSMessage(messageId);
 * ```
 */
export async function deleteCSMessage(messageId: string) {
  try {
    console.group("🗑️ [admin/cs-reply] CS 답변 삭제 시작");
    console.log("messageId:", messageId);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    console.log("✅ [admin/cs-reply] 관리자 확인:", profile.email);

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. 메시지 정보 조회 (존재 여부 및 권한 확인)
    const { data: message, error: messageError } = await supabase
      .from("cs_messages")
      .select("id, cs_thread_id, sender_type, sender_id, content")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      console.error("❌ [admin/cs-reply] 메시지 조회 오류:", messageError);
      throw new Error("답변을 찾을 수 없습니다.");
    }

    // 관리자가 작성한 메시지만 삭제 가능
    if (message.sender_type !== "admin") {
      throw new Error("관리자가 작성한 답변만 삭제할 수 있습니다.");
    }

    // 본인이 작성한 메시지인지 확인 (선택사항이지만 보안을 위해 추가)
    if (message.sender_id !== profile.id) {
      console.warn(
        "⚠️ [admin/cs-reply] 다른 관리자가 작성한 메시지 삭제 시도:",
        message.sender_id,
      );
      // 관리자는 다른 관리자의 메시지도 삭제할 수 있도록 허용
      // 필요시 아래 주석을 해제하여 본인 메시지만 삭제 가능하도록 제한
      // throw new Error("본인이 작성한 답변만 삭제할 수 있습니다.");
    }

    console.log("✅ [admin/cs-reply] 메시지 확인:", message.id);
    console.log("삭제할 내용 길이:", message.content.length);

    // 2. 삭제 전 내용을 audit_logs에 저장하기 위해 변수에 저장
    const deletedContent = message.content;
    const threadId = message.cs_thread_id;

    // 3. 메시지 삭제
    const { error: deleteError } = await supabase
      .from("cs_messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) {
      console.error("❌ [admin/cs-reply] 메시지 삭제 오류:", deleteError);
      throw new Error("답변을 삭제하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 메시지 삭제 완료");

    // 4. 스레드의 updated_at 업데이트
    const { error: threadUpdateError } = await supabase
      .from("cs_threads")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", threadId);

    if (threadUpdateError) {
      console.warn(
        "⚠️ [admin/cs-reply] 스레드 updated_at 업데이트 실패 (무시):",
        threadUpdateError,
      );
    }

    // 5. 감사 로그 기록 (삭제된 내용 포함)
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: profile.id,
      action: "cs_message_delete",
      target_type: "cs_message",
      target_id: messageId,
      details: {
        message_id: messageId,
        thread_id: threadId,
        deleted_content: deletedContent,
        deleted_content_length: deletedContent.length,
        sender_id: message.sender_id,
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin/cs-reply] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin/cs-reply] 감사 로그 기록 완료");
    }

    console.log("✅ [admin/cs-reply] CS 답변 삭제 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/cs/${threadId}`);
    revalidatePath("/admin/cs");

    return { success: true };
  } catch (error) {
    console.error("❌ [admin/cs-reply] deleteCSMessage 예외:", error);
    throw error;
  }
}

