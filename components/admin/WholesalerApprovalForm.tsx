/**
 * @file components/admin/WholesalerApprovalForm.tsx
 * @description 도매사업자 승인/반려 폼 컴포넌트
 *
 * 관리자가 도매사업자를 승인하거나 반려할 수 있는 UI 컴포넌트입니다.
 * 승인 버튼과 반려 버튼을 제공하며, 반려 시 사유를 입력받는 모달을 표시합니다.
 *
 * 주요 기능:
 * 1. 승인 버튼 (확인 모달 포함)
 * 2. 반려 버튼 (반려 사유 입력 모달)
 * 3. react-hook-form + zod를 사용한 폼 검증
 * 4. 로딩 상태 관리
 * 5. 에러 처리 및 알림
 *
 * @dependencies
 * - actions/admin/wholesaler-approval.ts (approveWholesaler, rejectWholesaler)
 * - components/ui/button, dialog, form, textarea
 * - react-hook-form, zod
 * - lucide-react (아이콘)
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  approveWholesaler,
  rejectWholesaler,
} from "@/actions/admin/wholesaler-approval";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * 반려 사유 검증 스키마
 * - 최소 10자, 최대 500자
 */
const rejectSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "반려 사유는 최소 10자 이상 입력해주세요.")
    .max(500, "반려 사유는 최대 500자까지 입력 가능합니다."),
});

type RejectFormData = z.infer<typeof rejectSchema>;

interface WholesalerApprovalFormProps {
  wholesalerId: string;
  adminId: string;
}

/**
 * 도매사업자 승인/반려 폼 컴포넌트
 *
 * @param {WholesalerApprovalFormProps} props
 * @param {string} props.wholesalerId - 도매사업자 ID
 * @param {string} props.adminId - 관리자 ID (profiles.id)
 */
export default function WholesalerApprovalForm({
  wholesalerId,
  adminId,
}: WholesalerApprovalFormProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const form = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      rejectionReason: "",
    },
  });

  /**
   * 승인 처리
   */
  const handleApprove = async () => {
    if (
      !confirm("정말 이 도매사업자를 승인하시겠습니까?\n승인 후에는 취소할 수 없습니다.")
    ) {
      return;
    }

    setIsApproving(true);
    try {
      console.log("✅ [admin] 승인 버튼 클릭:", { wholesalerId, adminId });
      await approveWholesaler(wholesalerId, adminId);
      // Server Action에서 redirect하므로 여기 도달하지 않음
    } catch (error) {
      console.error("❌ [admin] 승인 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "승인 처리 중 오류가 발생했습니다.",
      );
      setIsApproving(false);
    }
  };

  /**
   * 반려 처리
   */
  const handleReject = async (data: RejectFormData) => {
    setIsRejecting(true);
    try {
      console.log("❌ [admin] 반려 버튼 클릭:", {
        wholesalerId,
        adminId,
        rejectionReason: data.rejectionReason,
      });
      await rejectWholesaler(wholesalerId, adminId, data.rejectionReason);
      // Server Action에서 redirect하므로 여기 도달하지 않음
    } catch (error) {
      console.error("❌ [admin] 반려 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "반려 처리 중 오류가 발생했습니다.",
      );
      setIsRejecting(false);
    }
  };

  return (
    <div className="mt-6 md:mt-8 bg-white dark:bg-gray-950 rounded-lg shadow border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 p-4 md:p-6 transition-colors duration-200">
      <h2 className="text-base md:text-lg font-semibold text-foreground dark:text-foreground mb-3 md:mb-4 transition-colors duration-200">
        승인/반려 처리
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        {/* 승인 버튼 */}
        <Button
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-98 h-10 md:h-11 text-sm md:text-base"
        >
          {isApproving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">승인 중...</span>
              <span className="sm:hidden">승인 중</span>
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              승인
            </>
          )}
        </Button>

        {/* 반려 버튼 및 모달 */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isApproving || isRejecting}
              className="flex-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-98 h-10 md:h-11 text-sm md:text-base"
            >
              <XCircle className="mr-2 h-4 w-4" />
              반려
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>도매사업자 반려</DialogTitle>
              <DialogDescription>
                반려 사유를 입력해주세요. (최소 10자 이상)
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleReject)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="rejectionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>반려 사유</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="반려 사유를 상세히 입력해주세요. (최소 10자 이상)"
                          rows={5}
                          disabled={isRejecting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsRejectDialogOpen(false);
                      form.reset();
                    }}
                    disabled={isRejecting}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isRejecting}
                  >
                    {isRejecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        반려 중...
                      </>
                    ) : (
                      "반려 처리"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

