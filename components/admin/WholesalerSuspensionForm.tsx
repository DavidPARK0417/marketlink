/**
 * @file components/admin/WholesalerSuspensionForm.tsx
 * @description 도매사업자 정지/해제 폼 컴포넌트
 *
 * 관리자가 도매사업자를 정지하거나 해제할 수 있는 UI 컴포넌트입니다.
 * 정지 버튼과 해제 버튼을 제공하며, 정지 시 사유를 입력받는 모달을 표시합니다.
 *
 * 주요 기능:
 * 1. 정지 버튼 (정지 사유 입력 모달)
 * 2. 해제 버튼 (확인 모달)
 * 3. react-hook-form + zod를 사용한 폼 검증
 * 4. 로딩 상태 관리
 * 5. 에러 처리 및 알림
 *
 * @dependencies
 * - actions/admin/account-management.ts (suspendWholesaler, unsuspendWholesaler)
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
  suspendWholesaler,
  unsuspendWholesaler,
} from "@/actions/admin/account-management";
import { Ban, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * 정지 사유 검증 스키마
 * - 최소 10자, 최대 500자
 */
const suspendSchema = z.object({
  suspensionReason: z
    .string()
    .min(10, "정지 사유는 최소 10자 이상 입력해주세요.")
    .max(500, "정지 사유는 최대 500자까지 입력 가능합니다."),
});

type SuspendFormData = z.infer<typeof suspendSchema>;

interface WholesalerSuspensionFormProps {
  wholesalerId: string;
  currentStatus: string;
}

/**
 * 도매사업자 정지/해제 폼 컴포넌트
 *
 * @param {WholesalerSuspensionFormProps} props
 * @param {string} props.wholesalerId - 도매사업자 ID
 * @param {string} props.currentStatus - 현재 상태 ('approved', 'suspended')
 */
export default function WholesalerSuspensionForm({
  wholesalerId,
  currentStatus,
}: WholesalerSuspensionFormProps) {
  const [isSuspending, setIsSuspending] = useState(false);
  const [isUnsuspending, setIsUnsuspending] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const router = useRouter();

  const form = useForm<SuspendFormData>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      suspensionReason: "",
    },
  });

  /**
   * 정지 처리
   */
  const handleSuspend = async (data: SuspendFormData) => {
    setIsSuspending(true);
    try {
      console.log("🔴 [admin] 정지 버튼 클릭:", {
        wholesalerId,
        suspensionReason: data.suspensionReason,
      });
      await suspendWholesaler(wholesalerId, data.suspensionReason);
      // 성공 시 페이지 새로고침
      router.refresh();
      setIsSuspendDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("❌ [admin] 정지 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "정지 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSuspending(false);
    }
  };

  /**
   * 해제 처리
   */
  const handleUnsuspend = async () => {
    if (
      !confirm(
        "정말 이 도매사업자 계정을 해제하시겠습니까?\n해제 후에는 정지 사유가 삭제됩니다.",
      )
    ) {
      return;
    }

    setIsUnsuspending(true);
    try {
      console.log("🟢 [admin] 해제 버튼 클릭:", { wholesalerId });
      await unsuspendWholesaler(wholesalerId);
      // 성공 시 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("❌ [admin] 해제 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "해제 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsUnsuspending(false);
    }
  };

  // 정지된 경우 해제 버튼만 표시
  if (currentStatus === "suspended") {
    return (
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 p-6 transition-colors duration-200">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-4 transition-colors duration-200">
          계정 정지 관리
        </h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ 이 계정은 현재 정지 상태입니다.
          </p>
        </div>
        <Button
          onClick={handleUnsuspend}
          disabled={isUnsuspending}
          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-98"
        >
          {isUnsuspending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              해제 중...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              계정 해제
            </>
          )}
        </Button>
      </div>
    );
  }

  // 승인된 경우 정지 버튼만 표시
  if (currentStatus === "approved") {
    return (
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 p-6 transition-colors duration-200">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-4 transition-colors duration-200">
          계정 정지 관리
        </h2>
        <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isSuspending || isUnsuspending}
              className="w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-98"
            >
              <Ban className="mr-2 h-4 w-4" />
              계정 정지
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>도매사업자 계정 정지</DialogTitle>
              <DialogDescription>
                정지 사유를 입력해주세요. (최소 10자 이상)
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSuspend)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="suspensionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정지 사유</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="정지 사유를 상세히 입력해주세요. (최소 10자 이상)"
                          rows={5}
                          disabled={isSuspending}
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
                      setIsSuspendDialogOpen(false);
                      form.reset();
                    }}
                    disabled={isSuspending}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isSuspending}
                  >
                    {isSuspending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        정지 중...
                      </>
                    ) : (
                      "정지 처리"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // pending, rejected 등 다른 상태인 경우 버튼 표시 안 함
  return null;
}

