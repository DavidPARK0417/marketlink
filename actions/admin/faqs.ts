/**
 * @file actions/admin/faqs.ts
 * @description FAQ 관리 Server Actions
 *
 * 관리자가 FAQ를 생성, 수정, 삭제, 순서 변경하는 Server Actions입니다.
 *
 * 주요 기능:
 * 1. FAQ 생성
 * 2. FAQ 수정
 * 3. FAQ 삭제
 * 4. FAQ 순서 변경 (위/아래 화살표)
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 */

"use server";

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { CreateFAQRequest, UpdateFAQRequest } from "@/types/faq";

/**
 * FAQ 생성
 */
export async function createFAQ(data: CreateFAQRequest) {
  try {
    console.group("📝 [admin/faqs] FAQ 생성 시작");
    console.log("data:", data);

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    // display_order가 없으면 가장 큰 값 + 1로 설정
    if (data.display_order === undefined) {
      const { data: maxOrder } = await supabase
        .from("faqs")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .single();

      data.display_order = (maxOrder?.display_order ?? -1) + 1;
    }

    const { data: faq, error } = await supabase
      .from("faqs")
      .insert({
        question: data.question.trim(),
        answer: data.answer.trim(),
        display_order: data.display_order,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [admin/faqs] FAQ 생성 오류:", error);
      return {
        success: false,
        error: error.message || "FAQ 생성 실패",
      };
    }

    console.log("✅ [admin/faqs] FAQ 생성 성공:", faq.id);
    console.groupEnd();

    return {
      success: true,
      faq,
    };
  } catch (error) {
    console.error("❌ [admin/faqs] FAQ 생성 예외:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "FAQ 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 수정
 */
export async function updateFAQ(id: string, data: UpdateFAQRequest) {
  try {
    console.group("📝 [admin/faqs] FAQ 수정 시작", { id });
    console.log("data:", data);

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    const updateData: Partial<UpdateFAQRequest> = {};
    if (data.question !== undefined) {
      updateData.question = data.question.trim();
    }
    if (data.answer !== undefined) {
      updateData.answer = data.answer.trim();
    }
    if (data.display_order !== undefined) {
      updateData.display_order = data.display_order;
    }

    const { data: faq, error } = await supabase
      .from("faqs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ [admin/faqs] FAQ 수정 오류:", error);
      return {
        success: false,
        error: error.message || "FAQ 수정 실패",
      };
    }

    console.log("✅ [admin/faqs] FAQ 수정 성공");
    console.groupEnd();

    return {
      success: true,
      faq,
    };
  } catch (error) {
    console.error("❌ [admin/faqs] FAQ 수정 예외:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "FAQ 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 삭제
 */
export async function deleteFAQ(id: string) {
  try {
    console.group("🗑️ [admin/faqs] FAQ 삭제 시작", { id });

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) {
      console.error("❌ [admin/faqs] FAQ 삭제 오류:", error);
      return {
        success: false,
        error: error.message || "FAQ 삭제 실패",
      };
    }

    console.log("✅ [admin/faqs] FAQ 삭제 성공");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [admin/faqs] FAQ 삭제 예외:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "FAQ 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 순서 변경 (위로 이동)
 */
export async function moveFAQUp(id: string) {
  try {
    console.group("⬆️ [admin/faqs] FAQ 위로 이동 시작", { id });

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    // 현재 FAQ 조회
    const { data: currentFAQ, error: currentError } = await supabase
      .from("faqs")
      .select("id, display_order")
      .eq("id", id)
      .single();

    if (currentError || !currentFAQ) {
      return {
        success: false,
        error: "FAQ를 찾을 수 없습니다.",
      };
    }

    // 위에 있는 FAQ 조회 (display_order가 작은 것)
    const { data: prevFAQ, error: prevError } = await supabase
      .from("faqs")
      .select("id, display_order")
      .lt("display_order", currentFAQ.display_order)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    if (prevError || !prevFAQ) {
      return {
        success: false,
        error: "이미 가장 위에 있습니다.",
      };
    }

    // 순서 교환
    const { error: updateError1 } = await supabase
      .from("faqs")
      .update({ display_order: prevFAQ.display_order })
      .eq("id", currentFAQ.id);

    const { error: updateError2 } = await supabase
      .from("faqs")
      .update({ display_order: currentFAQ.display_order })
      .eq("id", prevFAQ.id);

    if (updateError1 || updateError2) {
      console.error("❌ [admin/faqs] FAQ 순서 변경 오류");
      return {
        success: false,
        error: "순서 변경 실패",
      };
    }

    console.log("✅ [admin/faqs] FAQ 위로 이동 성공");
    
    // 업데이트된 FAQ 목록 조회
    const { data: updatedFAQs, error: listError } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (listError) {
      console.error("❌ [admin/faqs] FAQ 목록 조회 오류:", listError);
      // 목록 조회 실패해도 순서 변경은 성공했으므로 성공으로 반환
      console.groupEnd();
      return {
        success: true,
      };
    }

    console.groupEnd();

    return {
      success: true,
      faqs: updatedFAQs || [],
    };
  } catch (error) {
    console.error("❌ [admin/faqs] FAQ 위로 이동 예외:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "순서 변경 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 순서 변경 (아래로 이동)
 */
export async function moveFAQDown(id: string) {
  try {
    console.group("⬇️ [admin/faqs] FAQ 아래로 이동 시작", { id });

    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    // 현재 FAQ 조회
    const { data: currentFAQ, error: currentError } = await supabase
      .from("faqs")
      .select("id, display_order")
      .eq("id", id)
      .single();

    if (currentError || !currentFAQ) {
      return {
        success: false,
        error: "FAQ를 찾을 수 없습니다.",
      };
    }

    // 아래에 있는 FAQ 조회 (display_order가 큰 것)
    const { data: nextFAQ, error: nextError } = await supabase
      .from("faqs")
      .select("id, display_order")
      .gt("display_order", currentFAQ.display_order)
      .order("display_order", { ascending: true })
      .limit(1)
      .single();

    if (nextError || !nextFAQ) {
      return {
        success: false,
        error: "이미 가장 아래에 있습니다.",
      };
    }

    // 순서 교환
    const { error: updateError1 } = await supabase
      .from("faqs")
      .update({ display_order: nextFAQ.display_order })
      .eq("id", currentFAQ.id);

    const { error: updateError2 } = await supabase
      .from("faqs")
      .update({ display_order: currentFAQ.display_order })
      .eq("id", nextFAQ.id);

    if (updateError1 || updateError2) {
      console.error("❌ [admin/faqs] FAQ 순서 변경 오류");
      return {
        success: false,
        error: "순서 변경 실패",
      };
    }

    console.log("✅ [admin/faqs] FAQ 아래로 이동 성공");
    
    // 업데이트된 FAQ 목록 조회
    const { data: updatedFAQs, error: listError } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (listError) {
      console.error("❌ [admin/faqs] FAQ 목록 조회 오류:", listError);
      // 목록 조회 실패해도 순서 변경은 성공했으므로 성공으로 반환
      console.groupEnd();
      return {
        success: true,
      };
    }

    console.groupEnd();

    return {
      success: true,
      faqs: updatedFAQs || [],
    };
  } catch (error) {
    console.error("❌ [admin/faqs] FAQ 아래로 이동 예외:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "순서 변경 중 오류가 발생했습니다.",
    };
  }
}

