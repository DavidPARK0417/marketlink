/**
 * @file components/wholesaler/Inquiries/InquiryReplyForm.tsx
 * @description 문의 답변 작성 폼 컴포넌트
 *
 * 문의에 답변을 작성하는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 *
 * @dependencies
 * - react-hook-form
 * - zod
 * - components/ui/form.tsx
 * - components/ui/textarea.tsx
 * - components/ui/button.tsx
 * - lib/supabase/queries/inquiries.ts
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// 답변 작성 스키마
const replySchema = z.object({
  admin_reply: z
    .string()
    .min(10, "답변은 최소 10자 이상 입력해주세요.")
    .max(5000, "답변은 최대 5000자까지 입력할 수 있습니다."),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface InquiryReplyFormProps {
  inquiryId: string;
  onSuccess?: () => void;
  apiEndpoint?: string; // API 엔드포인트 커스터마이징 (기본값: 도매사업자용)
}

// 답변 작성 API 호출 함수
async function submitReply(
  inquiryId: string,
  reply: string,
  apiEndpoint: string = "/api/wholesaler/inquiries/reply",
) {
  console.log("🔍 [inquiry-reply-form] 답변 작성 요청", {
    inquiryId,
    apiEndpoint,
  });

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inquiry_id: inquiryId,
      admin_reply: reply,
    }),
  });

  if (!response.ok) {
    let errorMessage = "답변 작성 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [inquiry-reply-form] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [inquiry-reply-form] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [inquiry-reply-form] 답변 작성 성공");
  return data;
}

export default function InquiryReplyForm({
  inquiryId,
  onSuccess,
  apiEndpoint = "/api/wholesaler/inquiries/reply",
}: InquiryReplyFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      admin_reply: "",
    },
  });

  // 답변 작성 뮤테이션
  const mutation = useMutation({
    mutationFn: (data: ReplyFormData) =>
      submitReply(inquiryId, data.admin_reply, apiEndpoint),
    onSuccess: () => {
      console.log("✅ [inquiry-reply-form] 답변 작성 성공");
      toast.success("답변이 작성되었습니다.");
      form.reset();

      // 문의 목록 및 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("❌ [inquiry-reply-form] 답변 작성 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "답변을 작성하는 중 오류가 발생했습니다.",
      );
    },
  });

  const onSubmit = (data: ReplyFormData) => {
    console.log("📝 [inquiry-reply-form] 폼 제출", data);
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
        <FormField
          control={form.control}
          name="admin_reply"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs md:text-sm">답변 내용</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="문의에 대한 답변을 입력해주세요. (최소 10자)"
                  rows={6}
                  className="resize-none text-xs md:text-sm min-h-[120px] md:min-h-[160px]"
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs md:text-sm text-gray-500">
                {field.value.length} / 5000자
              </div>
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={mutation.isPending}
            className="h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm w-full sm:w-auto"
          >
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm w-full sm:w-auto"
          >
            {mutation.isPending ? (
              <>
                <span className="hidden sm:inline">작성 중...</span>
                <span className="sm:hidden">작성 중</span>
              </>
            ) : (
              "답변 작성"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
