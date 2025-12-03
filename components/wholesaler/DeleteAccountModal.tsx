/**
 * @file components/wholesaler/DeleteAccountModal.tsx
 * @description 회원탈퇴 모달 컴포넌트
 *
 * 도매점 설정 페이지에서 회원탈퇴를 처리하는 모달입니다.
 *
 * 주요 기능:
 * 1. 비밀번호 확인
 * 2. 탈퇴 사유 입력 (드롭다운 + 추가 설명)
 * 3. 탈퇴 처리
 * 4. 탈퇴 완료 안내 모달
 *
 * @dependencies
 * - @clerk/nextjs (useClerk, useUser)
 * - next/navigation (useRouter)
 * - react-hook-form (useForm)
 * - zod (zodResolver)
 * - components/ui: Dialog, Form, Input, Select, Button, Textarea
 * - actions/wholesaler/delete-account.ts
 * - lib/validation/settings.ts
 */

"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/actions/wholesaler/delete-account";
import {
  deleteAccountSchema,
  DELETE_REASON_OPTIONS,
  type DeleteAccountFormData,
} from "@/lib/validation/settings";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 탈퇴 완료 안내 모달
 */
function DeleteAccountSuccessModal({
  open,
  onConfirm,
}: {
  open: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            탈퇴가 완료되었습니다
          </DialogTitle>
          <DialogDescription className="pt-2 text-base text-center">
            회원탈퇴가 성공적으로 처리되었습니다.
            <br />
            <br />
            이용해 주셔서 감사합니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 pt-4">
          <Button onClick={onConfirm} className="min-w-[120px]">
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 회원탈퇴 모달 컴포넌트
 */
export default function DeleteAccountModal({
  open,
  onOpenChange,
}: DeleteAccountModalProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      reason: "",
      feedback: "",
    },
  });

  // 폼 제출 처리
  const onSubmit = async (data: DeleteAccountFormData) => {
    setIsSubmitting(true);

    try {
      console.log("🗑️ [delete-account-modal] 탈퇴 요청 시작");

      const result = await deleteAccount(data);

      if (!result.success) {
        console.error("❌ [delete-account-modal] 탈퇴 실패:", result.error);
        toast.error(result.error || "회원탈퇴 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      console.log("✅ [delete-account-modal] 탈퇴 성공");
      
      // 모달 닫기
      onOpenChange(false);
      
      // 탈퇴 완료 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ [delete-account-modal] 탈퇴 예외:", error);
      toast.error("회원탈퇴 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  // 탈퇴 완료 모달 확인 버튼 클릭
  const handleSuccessConfirm = async () => {
    try {
      // 로그아웃 처리
      await signOut();
      // 홈으로 이동
      router.push("/");
    } catch (error) {
      console.error("❌ [delete-account-modal] 로그아웃 오류:", error);
      // 에러가 발생해도 홈으로 이동
      router.push("/");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">
              회원탈퇴
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-center">
              정말로 탈퇴하시겠습니까?
              <br />
              <br />
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              <br />
              주문이나 정산 내역이 있으면 탈퇴할 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 비밀번호 입력 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인 *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      탈퇴를 확인하기 위해 비밀번호를 입력해주세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 탈퇴 사유 선택 */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>탈퇴 사유 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="탈퇴 사유를 선택해주세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DELETE_REASON_OPTIONS.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      탈퇴 사유를 선택해주세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 추가 설명 */}
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>추가 설명 (선택)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="추가로 전달하고 싶은 내용이 있으시면 입력해주세요"
                        className="resize-none"
                        rows={4}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      서비스 개선을 위해 의견을 남겨주시면 감사하겠습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "탈퇴하기"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 탈퇴 완료 모달 */}
      <DeleteAccountSuccessModal
        open={showSuccessModal}
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}

