/**
 * @file RetailerOnboardingForm.tsx
 * @description 소매점 온보딩 폼 컴포넌트
 *
 * 소매점 회원가입 시 기본 정보를 입력받는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 *
 * 주요 기능:
 * 1. 기본 정보 입력 필드 (상호명, 전화번호, 주소, 이메일)
 * 2. 전화번호 하이픈 자동 추가
 * 3. 폼 제출 시 Server Action 호출
 * 4. 성공 시 환영 메시지 Dialog 표시 후 대시보드로 리다이렉트
 * 5. 에러 처리 및 토스트 알림
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: zodResolver
 * - actions/retailer/create-retailer.ts: Server Action
 * - lib/validation/retailer.ts: 유효성 검증 스키마
 * - components/ui: shadcn/ui 컴포넌트들
 * - sonner: 토스트 알림
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  retailerOnboardingSchema,
  type RetailerOnboardingFormData,
} from "@/lib/validation/retailer";
import { createRetailer } from "@/actions/retailer/create-retailer";

export default function RetailerOnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<RetailerOnboardingFormData>({
    resolver: zodResolver(retailerOnboardingSchema),
    defaultValues: {
      business_name: "",
      phone: "",
      address: "",
      email: "",
    },
  });

  // 전화번호 하이픈 자동 추가 핸들러
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let formatted = value;

    if (digits.length <= 3) {
      formatted = digits;
    } else if (digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 11) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }

    form.setValue("phone", formatted, { shouldValidate: true });
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: RetailerOnboardingFormData) => {
    setIsSubmitting(true);

    try {
      console.log("📝 [retailer-onboarding] 폼 제출:", data);

      const result = await createRetailer(data);

      if (!result.success) {
        console.error("❌ [retailer-onboarding] 소매점 생성 실패:", result.error);
        toast.error(result.error || "소매점 등록 중 오류가 발생했습니다.");
        return;
      }

      console.log("✅ [retailer-onboarding] 소매점 생성 성공:", result.retailerId);

      // 성공 시 환영 메시지 Dialog 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ [retailer-onboarding] 폼 제출 예외:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "소매점 등록 중 예상치 못한 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 환영 메시지 Dialog 확인 핸들러
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push("/retailer/dashboard");
  };

  return (
    <div className="w-full">
      {/* 환영 메시지 Dialog */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              환영합니다!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              소매사업자 회원가입이 완료되었습니다.
              <br />
              소매 대시보드로 이동합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleSuccessConfirm}
              className="w-full sm:w-auto min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보 입력</CardTitle>
          <CardDescription>
            소매점 회원가입을 위해 기본 정보를 입력해주세요.
            <br />
            입력하신 정보는 즉시 활성화됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 상호명 */}
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상호명 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 강남식자재마트"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>상호명을 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 전화번호 */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 010-1234-5678"
                        {...field}
                        onChange={(e) => {
                          handlePhoneChange(e.target.value);
                        }}
                        maxLength={13}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>010-####-#### 형식으로 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 주소 */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주소 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="예: 서울시 강남구 테헤란로 123"
                        {...field}
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>사업장 주소를 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 이메일 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일 *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="예: retailer@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>이메일 주소를 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제출 버튼 */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    "등록하기"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

