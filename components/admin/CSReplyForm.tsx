/**
 * @file components/admin/CSReplyForm.tsx
 * @description CS 답변 작성 폼 컴포넌트
 *
 * 관리자가 CS 문의에 답변을 작성하는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 * Server Action을 사용하여 답변을 저장합니다.
 *
 * @dependencies
 * - react-hook-form
 * - zod
 * - components/ui/form.tsx
 * - components/ui/textarea.tsx
 * - components/ui/button.tsx
 * - actions/admin/cs-reply.ts (replyToCS)
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
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { replyToCS } from "@/actions/admin/cs-reply";

// 답변 작성 스키마
const replySchema = z.object({
  content: z
    .string()
    .min(5, "답변은 최소 5자 이상 입력해주세요.")
    .max(5000, "답변은 최대 5000자까지 입력할 수 있습니다."),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface CSReplyFormProps {
  threadId: string;
  onSuccess?: () => void;
}

export default function CSReplyForm({
  threadId,
  onSuccess,
}: CSReplyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: ReplyFormData) => {
    try {
      console.log("📝 [cs-reply-form] 폼 제출", { threadId, contentLength: data.content.length });
      setIsSubmitting(true);

      const result = await replyToCS(threadId, data.content);

      if (result.success) {
        console.log("✅ [cs-reply-form] 답변 작성 성공");
        toast.success("답변이 작성되었습니다.");
        form.reset();

        // 페이지 새로고침 (Server Action이 revalidatePath를 호출하지만, 클라이언트에서도 명시적으로 새로고침)
        router.refresh();

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("❌ [cs-reply-form] 답변 작성 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "답변을 작성하는 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>답변 내용</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="답변 내용을 입력해주세요..."
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? "작성 중..." : "답변 작성"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

