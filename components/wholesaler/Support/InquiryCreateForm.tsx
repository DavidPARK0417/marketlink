/**
 * @file components/wholesaler/Support/InquiryCreateForm.tsx
 * @description 관리자 문의 작성 폼 컴포넌트
 *
 * 도매사업자가 관리자에게 문의를 작성하는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 *
 * @dependencies
 * - react-hook-form
 * - zod
 * - components/ui/form.tsx
 * - components/ui/input.tsx
 * - components/ui/textarea.tsx
 * - components/ui/button.tsx
 * - actions/wholesaler/create-inquiry.ts
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createInquiry } from "@/actions/wholesaler/create-inquiry";

// 문의 작성 스키마
const inquirySchema = z.object({
  title: z
    .string()
    .min(2, "제목은 최소 2자 이상 입력해주세요.")
    .max(200, "제목은 최대 200자까지 입력할 수 있습니다."),
  content: z
    .string()
    .min(10, "내용은 최소 10자 이상 입력해주세요.")
    .max(5000, "내용은 최대 5000자까지 입력할 수 있습니다."),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryCreateFormProps {
  onSuccess?: () => void;
}

export default function InquiryCreateForm({
  onSuccess,
}: InquiryCreateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    console.log("📝 [inquiry-create-form] 폼 제출", data);

    setIsSubmitting(true);

    try {
      const result = await createInquiry({
        title: data.title,
        content: data.content,
      });

      if (!result.success) {
        console.error("❌ [inquiry-create-form] 문의 작성 실패:", result.error);
        toast.error(result.error || "문의 작성에 실패했습니다.");
        return;
      }

      console.log("✅ [inquiry-create-form] 문의 작성 성공:", result.inquiryId);
      toast.success("문의가 성공적으로 작성되었습니다.");

      // 폼 초기화
      form.reset();

      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess();
      } else {
        // 기본 동작: 내가 보낸 문의 목록으로 이동
        router.push("/wholesaler/support?tab=my-inquiries");
      }
    } catch (error) {
      console.error("❌ [inquiry-create-form] 문의 작성 예외:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "문의 작성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="문의 제목을 입력해주세요"
                  className="max-w-2xl"
                />
              </FormControl>
              <FormDescription>{field.value.length} / 200자</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="문의 내용을 입력해주세요. 정산, 계정, 기술 지원 등 어떤 내용이든 문의해주세요."
                  rows={10}
                  className="resize-none max-w-2xl"
                />
              </FormControl>
              <FormDescription>{field.value.length} / 5000자</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 max-w-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "작성 중..." : "문의 작성"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
