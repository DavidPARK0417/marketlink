/**
 * @file components/admin/FAQManagementClient.tsx
 * @description FAQ 관리 클라이언트 컴포넌트
 *
 * FAQ 목록을 표시하고, 생성, 수정, 삭제, 순서 변경 기능을 제공하는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. FAQ 목록 표시
 * 2. FAQ 생성 모달
 * 3. FAQ 수정 모달
 * 4. FAQ 삭제 확인
 * 5. FAQ 순서 변경 (위/아래 화살표)
 *
 * @dependencies
 * - actions/admin/faqs.ts
 * - components/ui/button.tsx
 * - components/ui/dialog.tsx
 * - components/ui/accordion.tsx
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createFAQ,
  updateFAQ,
  deleteFAQ,
  moveFAQUp,
  moveFAQDown,
} from "@/actions/admin/faqs";
import type { FAQ } from "@/types/faq";

// FAQ 폼 스키마
const faqSchema = z.object({
  question: z
    .string()
    .min(2, "질문은 최소 2자 이상 입력해주세요.")
    .max(500, "질문은 최대 500자까지 입력할 수 있습니다."),
  answer: z
    .string()
    .min(10, "답변은 최소 10자 이상 입력해주세요.")
    .max(5000, "답변은 최대 5000자까지 입력할 수 있습니다."),
  display_order: z.number().int().min(0).optional(),
});

type FAQFormData = z.infer<typeof faqSchema>;

interface FAQManagementClientProps {
  initialFAQs: FAQ[];
}

export default function FAQManagementClient({
  initialFAQs,
}: FAQManagementClientProps) {
  const router = useRouter();
  const [faqs, setFAQs] = React.useState<FAQ[]>(initialFAQs);

  // initialFAQs가 변경되면 상태 업데이트 (router.refresh() 후)
  React.useEffect(() => {
    setFAQs(initialFAQs);
  }, [initialFAQs]);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingFAQ, setEditingFAQ] = React.useState<FAQ | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const createForm = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      display_order: undefined,
    },
  });

  const editForm = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      display_order: undefined,
    },
  });

  // FAQ 목록 갱신
  const refreshFAQs = React.useCallback(() => {
    router.refresh();
  }, [router]);

  // FAQ 생성
  const handleCreate = async (data: FAQFormData) => {
    // FAQFormData는 폼 검증을 통과했으므로 question과 answer가 반드시 존재함
    const result = await createFAQ({
      question: data.question,
      answer: data.answer,
      display_order: data.display_order,
    });
    if (result.success) {
      toast.success("FAQ가 생성되었습니다.");
      setIsCreateModalOpen(false);
      createForm.reset();
      refreshFAQs();
    } else {
      toast.error(result.error || "FAQ 생성 실패");
    }
  };

  // FAQ 수정 모달 열기
  const handleEditClick = (faq: FAQ) => {
    setEditingFAQ(faq);
    editForm.reset({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
    });
  };

  // FAQ 수정
  const handleUpdate = async (data: FAQFormData) => {
    if (!editingFAQ) return;

    const result = await updateFAQ(editingFAQ.id, data);
    if (result.success) {
      toast.success("FAQ가 수정되었습니다.");
      setEditingFAQ(null);
      editForm.reset();
      refreshFAQs();
    } else {
      toast.error(result.error || "FAQ 수정 실패");
    }
  };

  // FAQ 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 FAQ를 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteFAQ(id);
    setIsDeleting(null);

    if (result.success) {
      toast.success("FAQ가 삭제되었습니다.");
      refreshFAQs();
    } else {
      toast.error(result.error || "FAQ 삭제 실패");
    }
  };

  // FAQ 위로 이동
  const handleMoveUp = async (id: string) => {
    const result = await moveFAQUp(id);
    if (result.success) {
      toast.success("순서가 변경되었습니다.");
      refreshFAQs();
    } else {
      toast.error(result.error || "순서 변경 실패");
    }
  };

  // FAQ 아래로 이동
  const handleMoveDown = async (id: string) => {
    const result = await moveFAQDown(id);
    if (result.success) {
      toast.success("순서가 변경되었습니다.");
      refreshFAQs();
    } else {
      toast.error(result.error || "순서 변경 실패");
    }
  };

  return (
    <div className="space-y-6">
      {/* 생성 버튼 */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          FAQ 추가
        </Button>
      </div>

      {/* FAQ 목록 */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200">
        {faqs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground dark:text-muted-foreground">
            등록된 FAQ가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-200">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        {index + 1}.
                      </span>
                      <h3 className="font-semibold text-foreground dark:text-foreground">
                        {faq.question}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* 순서 변경 버튼 */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveUp(faq.id)}
                        disabled={index === 0}
                        title="위로 이동"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveDown(faq.id)}
                        disabled={index === faqs.length - 1}
                        title="아래로 이동"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* 수정 버튼 */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(faq)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* 삭제 버튼 */}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(faq.id)}
                      disabled={isDeleting === faq.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>FAQ 추가</DialogTitle>
            <DialogDescription>
              새로운 자주 묻는 질문을 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreate)}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <FormField
                  control={createForm.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>질문</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="질문을 입력해주세요" />
                      </FormControl>
                      <FormDescription>
                        {field.value.length} / 500자
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>답변</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="답변을 입력해주세요"
                          rows={8}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value.length} / 5000자
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 mt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">추가</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={!!editingFAQ} onOpenChange={(open) => !open && setEditingFAQ(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>FAQ 수정</DialogTitle>
            <DialogDescription>
              FAQ 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <FormField
                  control={editForm.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>질문</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="질문을 입력해주세요" />
                      </FormControl>
                      <FormDescription>
                        {field.value.length} / 500자
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>답변</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="답변을 입력해주세요"
                          rows={8}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value.length} / 5000자
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 mt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingFAQ(null)}
                >
                  취소
                </Button>
                <Button type="submit">수정</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

