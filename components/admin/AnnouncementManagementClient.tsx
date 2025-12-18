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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  initialPage: number;
  initialPageSize: number;
  total: number;
  totalPages: number;
}

export default function AnnouncementManagementClient({
  initialAnnouncements,
  initialPage,
  initialPageSize,
  total,
  totalPages,
}: AnnouncementManagementClientProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(
    initialAnnouncements,
  );
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  // initialAnnouncements가 변경되면 상태 업데이트 (router.refresh() 후)
  React.useEffect(() => {
    setAnnouncements(initialAnnouncements);
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialAnnouncements, initialPage, initialPageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    router.push(`/admin/announcements?${params.toString()}`);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("pageSize", String(newPageSize));
    params.set("page", "1"); // 페이지 크기 변경 시 첫 페이지로 이동
    router.push(`/admin/announcements?${params.toString()}`);
  };
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    React.useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] =
    React.useState<Announcement | null>(null);

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
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200">
        {announcements.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground dark:text-muted-foreground">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-200">
            {announcements.map((announcement, index) => {
              const newLabel = isNew(announcement.created_at);
              // 먼저 작성한 글이 1번이 되도록 번호 계산
              // 내림차순 정렬이므로 역순으로 계산: total - (page - 1) * pageSize - index
              const number = total - (page - 1) * pageSize - index;
              return (
                <div
                  key={announcement.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground min-w-[2rem]">
                          {number}
                        </span>
                        {newLabel && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
                            NEW
                          </span>
                        )}
                        <button
                          onClick={() => setViewingAnnouncement(announcement)}
                          className="font-semibold text-foreground dark:text-foreground hover:text-[#10B981] transition-colors text-left"
                        >
                          {announcement.title}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
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

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 페이지 정보 및 페이지 크기 선택 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* 현재 페이지 정보 */}
            <div className="text-sm text-muted-foreground dark:text-gray-300">
              {(() => {
                const startIndex = (page - 1) * pageSize + 1;
                const endIndex = Math.min(page * pageSize, total);
                return `${startIndex}-${endIndex} / ${total}건`;
              })()}
            </div>

            {/* 페이지 크기 선택 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground dark:text-gray-300 whitespace-nowrap">
                페이지당:
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  handlePageSizeChange(Number(value));
                }}
              >
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 페이지 네비게이션 */}
          <div className="flex items-center gap-2">
            {/* 이전 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="h-9 px-3"
            >
              이전
            </Button>

            {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
            <div className="hidden md:flex items-center gap-1">
              {(() => {
                const maxPages = 5;

                // 페이지 번호 배열 생성
                const getPageNumbers = (): (number | string)[] => {
                  const pages: (number | string)[] = [];

                  if (totalPages <= maxPages) {
                    // 전체 페이지가 5개 이하면 모두 표시
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // 현재 페이지 중심으로 5개 표시
                    if (page <= 3) {
                      // 앞부분
                      for (let i = 1; i <= 5; i++) {
                        pages.push(i);
                      }
                      pages.push("...");
                      pages.push(totalPages);
                    } else if (page >= totalPages - 2) {
                      // 뒷부분
                      pages.push(1);
                      pages.push("...");
                      for (let i = totalPages - 4; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // 중간
                      pages.push(1);
                      pages.push("...");
                      for (let i = page - 1; i <= page + 1; i++) {
                        pages.push(i);
                      }
                      pages.push("...");
                      pages.push(totalPages);
                    }
                  }

                  return pages;
                };

                const pageNumbers = getPageNumbers();

                return pageNumbers.map((pageNum, index) => {
                  if (pageNum === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-sm text-muted-foreground dark:text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNumber = pageNum as number;
                  const isActive = pageNumber === page;

                  return (
                    <Button
                      key={pageNumber}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`h-9 min-w-[36px] ${
                        isActive
                          ? "bg-[#10B981] hover:bg-[#059669] text-white border-[#10B981]"
                          : ""
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* 현재 페이지 번호 (모바일만 표시) */}
            <div className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground dark:text-foreground">
              {page} / {totalPages}
            </div>

            {/* 다음 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-9 px-3"
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>공지사항 추가</DialogTitle>
            <DialogDescription>
              새로운 공지사항을 작성합니다.
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

      {/* 상세 보기 모달 */}
      <Dialog
        open={!!viewingAnnouncement}
        onOpenChange={(open) => !open && setViewingAnnouncement(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{viewingAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              작성일:{" "}
              {viewingAnnouncement &&
                format(
                  new Date(viewingAnnouncement.created_at),
                  "yyyy년 MM월 dd일 HH:mm",
                  { locale: ko },
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">
              {viewingAnnouncement?.content}
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 mt-4 border-t">
            <Button
              type="button"
              onClick={() => setViewingAnnouncement(null)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog
        open={!!editingAnnouncement}
        onOpenChange={(open) => !open && setEditingAnnouncement(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <DialogDescription>
              공지사항 내용을 수정합니다.
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
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 mt-4 border-t">
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

