/**
 * @file components/wholesaler/Inquiries/InquiryMessageEditForm.tsx
 * @description 문의 메시지 수정 폼 컴포넌트
 *
 * 문의 메시지를 수정하는 다이얼로그 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 *
 * @dependencies
 * - react-hook-form
 * - zod
 * - components/ui/dialog.tsx
 * - components/ui/form.tsx
 * - components/ui/textarea.tsx
 * - components/ui/button.tsx
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { InquiryMessage } from "@/types/database";

const editSchema = z.object({
  content: z
    .string()
    .min(10, "내용은 최소 10자 이상 입력해주세요.")
    .max(5000, "내용은 최대 5000자까지 입력할 수 있습니다."),
});

type EditFormData = z.infer<typeof editSchema>;

interface InquiryMessageEditFormProps {
  message: InquiryMessage | null;
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string; // "/api/wholesaler/inquiries/messages" 또는 "/api/admin/inquiries/messages"
  inquiryId: string;
}

export default function InquiryMessageEditForm({
  message,
  isOpen,
  onClose,
  apiEndpoint,
  inquiryId,
}: InquiryMessageEditFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { content: "" },
  });

  // 메시지가 변경되면 폼 초기화
  useEffect(() => {
    if (message) {
      form.reset({ content: message.content });
    }
  }, [message, form]);

  const mutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      if (!message) throw new Error("메시지가 없습니다.");

      console.log("✏️ [inquiry-message-edit-form] 메시지 수정 요청", {
        messageId: message.id,
        apiEndpoint: `${apiEndpoint}/${message.id}`,
      });

      const response = await fetch(`${apiEndpoint}/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content }),
      });

      if (!response.ok) {
        let errorMessage = "메시지 수정 실패";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("❌ [inquiry-message-edit-form] API 에러 응답:", errorData);
        } catch (e) {
          console.error("❌ [inquiry-message-edit-form] 에러 응답 파싱 실패:", e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ [inquiry-message-edit-form] 메시지 수정 성공");
      return result;
    },
    onSuccess: () => {
      toast.success("메시지가 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["inquiry-messages", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["admin-inquiry", inquiryId] });
      onClose();
    },
    onError: (error) => {
      console.error("❌ [inquiry-message-edit-form] 메시지 수정 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "메시지 수정 중 오류가 발생했습니다.",
      );
    },
  });

  const onSubmit = (data: EditFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>메시지 수정</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={6} className="resize-none" />
                    </FormControl>
                    <FormMessage />
                    <div className="text-sm text-gray-500">
                      {field.value.length} / 5000자
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 flex-shrink-0 pt-4 mt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "수정 중..." : "수정"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

