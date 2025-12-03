/**
 * @file components/admin/AnnouncementManagementClient.tsx
 * @description 공지사항 관리 클라이언트 컴포넌트
 *
 * 공지사항 목록을 표시하고, 생성, 수정, 삭제 기능을 제공하는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 공지사항 목록 표시
 * 2. 공지사항 생성 모달
 * 3. 공지사항 수정 모달
 * 4. 공지사항 삭제 확인
 *
 * @dependencies
 * - actions/admin/announcements.ts
 * - components/ui/button.tsx
 * - components/ui/dialog.tsx
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/actions/admin/announcements";
import type { Announcement } from "@/types/announcement";

// 공지사항 폼 스키마
const announcementSchema = z.object({
  title: z
    .string()
    .min(2, "제목은 최소 2자 이상 입력해주세요.")
    .max(200, "제목은 최대 200자까지 입력할 수 있습니다."),
  content: z
    .string()
    .min(10, "내용은 최소 10자 이상 입력해주세요.")
    .max(10000, "내용은 최대 10000자까지 입력할 수 있습니다."),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementManagementClientProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementManagementClient({
  initialAnnouncements,
}: AnnouncementManagementClientProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(
    initialAnnouncements,
  );

  // initialAnnouncements가 변경되면 상태 업데이트 (router.refresh() 후)
  React.useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    React.useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const createForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const editForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // 공지사항 목록 갱신
  const refreshAnnouncements = React.useCallback(() => {
    router.refresh();
  }, [router]);

  // 공지사항 생성
  const handleCreate = async (data: AnnouncementFormData) => {
    const result = await createAnnouncement({
      title: data.title,
      content: data.content,
    });
    if (result.success) {
      toast.success("공지사항이 생성되었습니다.");
      setIsCreateModalOpen(false);
      createForm.reset();
      refreshAnnouncements();
    } else {
      toast.error(result.error || "공지사항 생성 실패");
    }
  };

  // 공지사항 수정 모달 열기
  const handleEditClick = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    editForm.reset({
      title: announcement.title,
      content: announcement.content,
    });
  };

  // 공지사항 수정
  const handleUpdate = async (data: AnnouncementFormData) => {
    if (!editingAnnouncement) return;

    const result = await updateAnnouncement(editingAnnouncement.id, data);
    if (result.success) {
      toast.success("공지사항이 수정되었습니다.");
      setEditingAnnouncement(null);
      editForm.reset();
      refreshAnnouncements();
    } else {
      toast.error(result.error || "공지사항 수정 실패");
    }
  };

  // 공지사항 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteAnnouncement(id);
    setIsDeleting(null);

    if (result.success) {
      toast.success("공지사항이 삭제되었습니다.");
      refreshAnnouncements();
    } else {
      toast.error(result.error || "공지사항 삭제 실패");
    }
  };

  // 7일 이내 작성된 공지사항인지 확인
  const isNew = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  return (
    <div className="space-y-6">
      {/* 생성 버튼 */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          공지사항 추가
        </Button>
      </div>

      {/* 공지사항 목록 */}
      <div className="rounded-lg border bg-white">
        {announcements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {announcements.map((announcement) => {
              const newLabel = isNew(announcement.created_at);
              return (
                <div
                  key={announcement.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {newLabel && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            NEW
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(announcement.created_at),
                          "yyyy-MM-dd HH:mm",
                          { locale: ko },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 수정 버튼 */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(announcement)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* 삭제 버튼 */}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                        disabled={isDeleting === announcement.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>공지사항 추가</DialogTitle>
            <DialogDescription>
              새로운 공지사항을 작성합니다.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="공지사항 제목을 입력해주세요" />
                    </FormControl>
                    <FormDescription>
                      {field.value.length} / 200자
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="공지사항 내용을 입력해주세요"
                        rows={10}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length} / 10000자
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
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
      <Dialog
        open={!!editingAnnouncement}
        onOpenChange={(open) => !open && setEditingAnnouncement(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <DialogDescription>
              공지사항 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="공지사항 제목을 입력해주세요" />
                    </FormControl>
                    <FormDescription>
                      {field.value.length} / 200자
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="공지사항 내용을 입력해주세요"
                        rows={10}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length} / 10000자
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAnnouncement(null)}
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

