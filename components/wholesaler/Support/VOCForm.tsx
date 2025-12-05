/**
 * @file components/wholesaler/Support/VOCForm.tsx
 * @description 고객의 소리 제출 폼 컴포넌트
 *
 * 도매사업자가 서비스 개선을 위한 피드백을 제출하는 폼입니다.
 *
 * 주요 기능:
 * 1. 제목 및 내용 입력
 * 2. 유효성 검증
 * 3. 제출 후 확인 메시지 표시
 *
 * @dependencies
 * - react-hook-form
 * - zod
 * - components/ui/form.tsx
 * - components/ui/input.tsx
 * - components/ui/textarea.tsx
 * - components/ui/button.tsx
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

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

// VOC 제출 스키마
const vocSchema = z.object({
  title: z
    .string()
    .min(2, "제목은 최소 2자 이상 입력해주세요.")
    .max(200, "제목은 최대 200자까지 입력할 수 있습니다."),
  content: z
    .string()
    .min(10, "내용은 최소 10자 이상 입력해주세요.")
    .max(2000, "내용은 최대 2000자까지 입력할 수 있습니다."),
});

type VOCFormData = z.infer<typeof vocSchema>;

interface VOCFormProps {
  /**
   * 제출 성공 핸들러
   */
  onSuccess?: () => void;
  /**
   * 취소 핸들러 (모달 닫기)
   */
  onCancel?: () => void;
}

export default function VOCForm({ onSuccess, onCancel }: VOCFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<VOCFormData>({
    resolver: zodResolver(vocSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: VOCFormData) => {
    try {
      setIsSubmitting(true);
      console.log("📝 [voc-form] VOC 제출 시작", data);

      const response = await fetch("/api/wholesaler/voc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "피드백 제출 실패");
      }

      console.log("✅ [voc-form] VOC 제출 성공");
      toast.success("의견이 성공적으로 제출되었습니다. 감사합니다!");
      
      // 폼 초기화
      form.reset();
      
      // 성공 핸들러 호출
      onSuccess?.();
    } catch (error) {
      console.error("❌ [voc-form] VOC 제출 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "피드백 제출 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* 폼 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                  제목
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="피드백 제목을 입력해주세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 mt-1">
                  {field.value.length} / 200자
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                  내용
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="서비스 이용 중 불편하셨던 점이나 개선할 점을 자유롭게 적어주세요."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 mt-1">
                  {field.value.length} / 2000자
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  제출 중...
                </>
              ) : (
                "보내기"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

