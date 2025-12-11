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
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

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
import { uploadInquiryAttachment } from "@/lib/supabase/storage";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

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
  onCancel?: () => void;
}

export default function InquiryCreateForm({
  onSuccess,
  onCancel,
}: InquiryCreateFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attachmentUrls, setAttachmentUrls] = React.useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = React.useState<Set<number>>(
    new Set(),
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // 이미지 업로드 핸들러
  const handleImageUpload = React.useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      const currentImages = attachmentUrls;
      if (currentImages.length + files.length > 5) {
        toast.error("이미지는 최대 5개까지 업로드할 수 있습니다.");
        return;
      }

      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(async (file, index) => {
        const imageIndex = currentImages.length + index;
        setUploadingImages((prev) => new Set(prev).add(imageIndex));

        try {
          console.log(
            "📤 [inquiry-create-form] 이미지 업로드 시작:",
            file.name,
          );
          const url = await uploadInquiryAttachment(file, user.id, supabase);
          console.log("✅ [inquiry-create-form] 이미지 업로드 성공:", url);

          setAttachmentUrls((prev) => [...prev, url]);
          toast.success(`${file.name} 업로드 완료`);
        } catch (error) {
          console.error("❌ [inquiry-create-form] 이미지 업로드 실패:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : `${file.name} 업로드에 실패했습니다.`,
          );
        } finally {
          setUploadingImages((prev) => {
            const next = new Set(prev);
            next.delete(imageIndex);
            return next;
          });
        }
      });

      await Promise.all(uploadPromises);
    },
    [user, supabase, attachmentUrls],
  );

  // 이미지 삭제 핸들러
  const handleImageDelete = React.useCallback((index: number) => {
    setAttachmentUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onSubmit = async (data: InquiryFormData) => {
    console.log("📝 [inquiry-create-form] 폼 제출", {
      ...data,
      attachmentUrls,
    });

    setIsSubmitting(true);

    try {
      const result = await createInquiry({
        title: data.title,
        content: data.content,
        attachment_urls: attachmentUrls.length > 0 ? attachmentUrls : null,
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
      setAttachmentUrls([]);

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

  const handleCancel = () => {
    console.log("⏹️ [inquiry-create-form] 작성 취소 - 폼 리셋 및 모달 닫기 요청");
    form.reset();
    onCancel?.();
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

        {/* 첨부 이미지 */}
        <FormItem>
          <FormLabel>첨부 이미지 (선택사항)</FormLabel>
          <FormDescription>
            최대 5개까지 첨부 가능합니다. 각 파일은 5MB 이하여야 합니다.
          </FormDescription>
          <div className="space-y-4 max-w-2xl">
            {/* 이미지 미리보기 */}
            {attachmentUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {attachmentUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border"
                  >
                    {uploadingImages.has(index) ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500" />
                      </div>
                    ) : (
                      <>
                        <Image
                          src={url}
                          alt={`첨부 이미지 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleImageDelete(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 파일 선택 버튼 */}
            {attachmentUrls.length < 5 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || attachmentUrls.length >= 5}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {attachmentUrls.length === 0
                    ? "이미지 선택"
                    : `이미지 추가 (${attachmentUrls.length}/5)`}
                </Button>
              </div>
            )}
          </div>
        </FormItem>

        <div className="flex justify-end gap-2 max-w-2xl pt-4 mt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
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
