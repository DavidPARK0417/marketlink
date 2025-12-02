/**
 * @file components/wholesaler/Inquiries/InquiryFollowUpForm.tsx
 * @description 문의 추가 질문 작성 폼 컴포넌트
 *
 * 문의자가 답변을 받은 후 추가 질문을 작성하는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 *
 * @dependencies
 * - react-hook-form
 * - zod
 * - components/ui/form.tsx
 * - components/ui/textarea.tsx
 * - components/ui/button.tsx
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

// 추가 질문 작성 스키마
const followUpSchema = z.object({
  content: z
    .string()
    .min(10, "질문 내용은 최소 10자 이상 입력해주세요.")
    .max(5000, "질문 내용은 최대 5000자까지 입력할 수 있습니다."),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

interface InquiryFollowUpFormProps {
  inquiryId: string;
  onSuccess?: () => void;
  apiEndpoint?: string; // API 엔드포인트 커스터마이징
}

// 추가 질문 작성 API 호출 함수
async function submitFollowUp(
  inquiryId: string,
  content: string,
  apiEndpoint: string = `/api/wholesaler/inquiries/${inquiryId}/follow-up`,
) {
  console.log("🔍 [inquiry-follow-up-form] 추가 질문 작성 요청", {
    inquiryId,
    apiEndpoint,
  });

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    let errorMessage = "추가 질문 작성 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      console.error("❌ [inquiry-follow-up-form] API 에러 응답:", errorData);
    } catch (e) {
      console.error("❌ [inquiry-follow-up-form] 에러 응답 파싱 실패:", e);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("✅ [inquiry-follow-up-form] 추가 질문 작성 성공");
  return data;
}

export default function InquiryFollowUpForm({
  inquiryId,
  onSuccess,
  apiEndpoint,
}: InquiryFollowUpFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      content: "",
    },
  });

  // 추가 질문 작성 뮤테이션
  const mutation = useMutation({
    mutationFn: (data: FollowUpFormData) =>
      submitFollowUp(
        inquiryId,
        data.content,
        apiEndpoint || `/api/wholesaler/inquiries/${inquiryId}/follow-up`,
      ),
    onSuccess: () => {
      console.log("✅ [inquiry-follow-up-form] 추가 질문 작성 성공");
      toast.success("추가 질문이 작성되었습니다.");
      form.reset();

      // 문의 목록 및 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("❌ [inquiry-follow-up-form] 추가 질문 작성 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "추가 질문을 작성하는 중 오류가 발생했습니다.",
      );
    },
  });

  const onSubmit = (data: FollowUpFormData) => {
    console.log("📝 [inquiry-follow-up-form] 폼 제출", data);
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>추가 질문</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="추가로 궁금한 점이 있으시면 질문해주세요. (최소 10자)"
                  rows={6}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
              <div className="text-sm text-gray-500">
                {field.value.length} / 5000자
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={mutation.isPending}
          >
            취소
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "작성 중..." : "질문 작성"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

