/**
 * @file app/wholesaler/settings/page.tsx
 * @description 설정 페이지
 *
 * 도매점 계정 및 사업자 정보를 관리하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 계정 정보 조회 (읽기 전용): 사업자번호, 대표자명, 익명 코드, 승인 상태, 승인일, 가입일
 * 2. 사업자 정보 수정: 상호명, 연락처, 주소, 상세주소, 계좌번호
 * 3. 이메일 변경: Clerk 이메일 변경 요청
 * 4. 알림 설정: 새 주문, 정산 완료, 문의 답변 알림 설정
 *
 * @dependencies
 * - components/ui: Form, Input, Select, Button, Checkbox
 * - components/wholesaler/DeleteAccountModal.tsx
 * - hooks/useWholesaler.ts
 * - actions/wholesaler: updateWholesaler, updateEmail, updateNotificationPreferences
 * - lib/validation/settings.ts
 * - @clerk/nextjs (useUser)
 */

"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserButton, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2, Search, Mail, Bell, Info } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWholesaler } from "@/hooks/useWholesaler";
import { updateWholesaler } from "@/actions/wholesaler/update-wholesaler";
import { updateEmail } from "@/actions/wholesaler/update-email";
import { updateNotificationPreferences } from "@/actions/wholesaler/update-notification-preferences";
import {
  updateWholesalerSchema,
  updateEmailSchema,
  updateNotificationPreferencesSchema,
  type UpdateWholesalerFormData,
  type UpdateEmailFormData,
  type UpdateNotificationPreferencesFormData,
} from "@/lib/validation/settings";
import { BANKS } from "@/lib/utils/constants";
import { getWholesalerStatusLabel } from "@/lib/utils/constants";
import { formatBusinessNumber } from "@/lib/utils/format";
import type { DaumPostcodeData } from "@/types/daum";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import DeleteAccountModal from "@/components/wholesaler/DeleteAccountModal";

export default function SettingsPage() {
  const { user } = useUser();
  const { data: wholesaler, isLoading: isLoadingWholesaler } = useWholesaler();
  const [isSubmittingWholesaler, setIsSubmittingWholesaler] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingNotifications, setIsSubmittingNotifications] =
    useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isEmailSameModalOpen, setIsEmailSameModalOpen] = useState(false);

  // 사업자 정보 수정 폼
  const wholesalerForm = useForm<UpdateWholesalerFormData>({
    resolver: zodResolver(updateWholesalerSchema),
    defaultValues: {
      business_name: "",
      phone: "",
      address: "",
      address_detail: "",
      bank_name: "",
      bank_account_number: "",
    },
  });

  // 이메일 변경 폼
  const emailForm = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  // 알림 설정 폼
  const notificationForm = useForm<UpdateNotificationPreferencesFormData>({
    resolver: zodResolver(updateNotificationPreferencesSchema),
    defaultValues: {
      new_order: { email: true, push: true },
      settlement_completed: { email: true, push: false },
      inquiry_answered: { email: true, push: true },
    },
  });

  // 도매점 정보가 로드되면 폼에 데이터 채우기
  useEffect(() => {
    if (wholesaler) {
      console.log(
        "📝 [settings] 도매점 정보 로드 완료, 폼 초기화:",
        wholesaler,
      );

      // 계좌번호 파싱 (첫 번째 공백 기준 분리)
      console.log("🏦 [settings] bank_account 원본:", wholesaler.bank_account);
      
      const parsedBankName = wholesaler.bank_account
        ? wholesaler.bank_account.split(" ")[0]?.trim() || ""
        : "";
      const parsedAccountNumber = wholesaler.bank_account
        ? wholesaler.bank_account.split(" ").slice(1).join(" ").trim() || ""
        : "";
      
      console.log("🏦 [settings] 파싱된 bank_name:", parsedBankName);
      console.log("🏦 [settings] 파싱된 bank_account_number:", parsedAccountNumber);

      // 사업자 정보 폼 초기화
      wholesalerForm.reset({
        business_name: wholesaler.business_name || "",
        phone: wholesaler.phone || "",
        address: wholesaler.address || "",
        address_detail: wholesaler.address_detail || "",
        bank_name: parsedBankName,
        bank_account_number: parsedAccountNumber,
      });

      // Select 컴포넌트가 업데이트되도록 명시적으로 setValue 호출
      if (parsedBankName) {
        wholesalerForm.setValue("bank_name", parsedBankName, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }

      // 알림 설정 폼 초기화
      if (wholesaler.notification_preferences) {
        notificationForm.reset(wholesaler.notification_preferences);
      }
    }
  }, [wholesaler, wholesalerForm, notificationForm]);

  // 이메일 폼 초기화
  useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      emailForm.reset({
        email: user.emailAddresses[0].emailAddress,
      });
    }
  }, [user, emailForm]);

  // 전화번호 하이픈 자동 추가 핸들러
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let formatted = value;

    if (digits.length <= 3) {
      formatted = digits;
    } else if (digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 11) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(
        7,
      )}`;
    } else {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(
        7,
        11,
      )}`;
    }

    wholesalerForm.setValue("phone", formatted, { shouldValidate: true });
  };

  // 카카오 주소 검색 함수
  const handleAddressSearch = () => {
    if (typeof window !== "undefined" && window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: DaumPostcodeData) {
          let fullAddress = data.address;
          let extraAddress = "";

          if (data.userSelectedType === "R") {
            fullAddress = data.roadAddress;
          } else {
            fullAddress = data.jibunAddress;
          }

          if (data.userSelectedType === "R") {
            if (data.bname !== "") {
              extraAddress += data.bname;
            }
            if (data.buildingName !== "") {
              extraAddress +=
                extraAddress !== ""
                  ? `, ${data.buildingName}`
                  : data.buildingName;
            }
            if (extraAddress !== "") {
              fullAddress += ` (${extraAddress})`;
            }
          }

          wholesalerForm.setValue("address", fullAddress, {
            shouldValidate: true,
          });

          console.log("✅ [주소 검색] 주소 선택 완료:", fullAddress);
        },
        onclose: function (state: "COMPLETE_CLOSE" | "FORCE_CLOSE") {
          if (state === "FORCE_CLOSE") {
            console.log("ℹ️ [주소 검색] 사용자가 주소 검색을 취소했습니다.");
          }
        },
        width: "100%",
        height: "100%",
      }).open();
    } else {
      console.error(
        "❌ [주소 검색] 카카오 우편번호 스크립트가 로드되지 않았습니다.",
      );
      toast.error(
        "주소 검색 기능을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  // 사업자 정보 수정 제출
  const onSubmitWholesaler = async (data: UpdateWholesalerFormData) => {
    setIsSubmittingWholesaler(true);

    try {
      console.log("📝 [settings] 사업자 정보 수정 제출:", data);

      const result = await updateWholesaler(data);

      if (!result.success) {
        console.error("❌ [settings] 사업자 정보 수정 실패:", result.error);
        toast.error(result.error || "사업자 정보 수정 중 오류가 발생했습니다.");
        return;
      }

      console.log("✅ [settings] 사업자 정보 수정 성공");
      toast.success("사업자 정보가 수정되었습니다.");
    } catch (error) {
      console.error("❌ [settings] 사업자 정보 수정 예외:", error);
      toast.error("사업자 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingWholesaler(false);
    }
  };

  // 이메일 변경 제출
  const onSubmitEmail = async (data: UpdateEmailFormData) => {
    // 현재 이메일과 동일한지 확인
    const currentEmail = user?.emailAddresses[0]?.emailAddress;
    if (currentEmail && data.email.toLowerCase().trim() === currentEmail.toLowerCase().trim()) {
      console.log("ℹ️ [settings] 기존 이메일과 동일한 이메일 입력");
      setIsEmailSameModalOpen(true);
      return;
    }

    setIsSubmittingEmail(true);

    try {
      console.log("📧 [settings] 이메일 변경 제출:", data.email);

      const result = await updateEmail(data);

      if (!result.success) {
        console.error("❌ [settings] 이메일 변경 실패:", result.error);
        toast.error(result.error || "이메일 변경 중 오류가 발생했습니다.");
        return;
      }

      console.log("✅ [settings] 이메일 변경 요청 성공");
      toast.success(result.message || "인증 이메일이 발송되었습니다.");
    } catch (error) {
      console.error("❌ [settings] 이메일 변경 예외:", error);
      toast.error("이메일 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  // 알림 설정 제출
  const onSubmitNotifications = async (
    data: UpdateNotificationPreferencesFormData,
  ) => {
    setIsSubmittingNotifications(true);

    try {
      console.log("🔔 [settings] 알림 설정 제출:", data);

      const result = await updateNotificationPreferences(data);

      if (!result.success) {
        console.error("❌ [settings] 알림 설정 실패:", result.error);
        toast.error(result.error || "알림 설정 저장 중 오류가 발생했습니다.");
        return;
      }

      console.log("✅ [settings] 알림 설정 저장 성공");
      toast.success("알림 설정이 저장되었습니다.");
    } catch (error) {
      console.error("❌ [settings] 알림 설정 예외:", error);
      toast.error("알림 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingNotifications(false);
    }
  };

  if (isLoadingWholesaler) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!wholesaler) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-6 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p className="text-center text-gray-600">
            도매점 정보를 찾을 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 카카오 우편번호 서비스 스크립트 로드 */}
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />

      <div className="max-w-2xl mx-auto w-full space-y-6 pb-12">
        {/* 1. 계정 정보 (읽기 전용) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">계정 정보</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
            사업자 등록 정보입니다. 수정할 수 없습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                사업자번호
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                {formatBusinessNumber(wholesaler.business_number)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                대표자명
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                {wholesaler.representative}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                익명 코드
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                {wholesaler.anonymous_code}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                승인 상태
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                {getWholesalerStatusLabel(wholesaler.status)}
              </p>
            </div>
            {wholesaler.approved_at && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  승인일
                </p>
                <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                  {format(
                    new Date(wholesaler.approved_at),
                    "yyyy년 MM월 dd일",
                    { locale: ko },
                  )}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">가입일</p>
              <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                {format(new Date(wholesaler.created_at), "yyyy년 MM월 dd일", {
                  locale: ko,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* 2. 사업자 정보 수정 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            사업자 정보 수정
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
            상호명, 연락처, 주소, 계좌번호를 수정할 수 있습니다.
          </p>

          <Form {...wholesalerForm}>
            <form
              onSubmit={wholesalerForm.handleSubmit(onSubmitWholesaler)}
              className="space-y-5"
            >
                {/* 상호명 */}
                <FormField
                  control={wholesalerForm.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                        상호명 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 농산물도매상사"
                          {...field}
                          disabled={isSubmittingWholesaler}
                          className="px-4 py-3 rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        사업자 등록증에 기재된 상호명을 입력해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 연락처 */}
                <FormField
                  control={wholesalerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                        연락처 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 010-1234-5678"
                          {...field}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          disabled={isSubmittingWholesaler}
                          className="px-4 py-3 rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        연락 가능한 전화번호를 입력해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 주소 */}
                <FormField
                  control={wholesalerForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                        주소 <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="flex gap-2 mb-2">
                        <FormControl>
                          <Input
                            placeholder="주소를 검색해주세요"
                            {...field}
                            disabled={isSubmittingWholesaler}
                            readOnly
                            className="flex-1 px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-100"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddressSearch}
                          disabled={isSubmittingWholesaler}
                          className="px-4 py-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <Search className="w-4 h-4" />
                          주소 검색
                        </Button>
                      </div>
                      <FormDescription className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                        주소 검색 버튼을 클릭하여 주소를 검색해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 상세주소 */}
                <FormField
                  control={wholesalerForm.control}
                  name="address_detail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                        상세주소
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 101호, 2층 (선택사항)"
                          {...field}
                          disabled={isSubmittingWholesaler}
                          className="px-4 py-3 rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        상세주소를 입력해주세요 (선택사항)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 은행명 */}
                <FormField
                  control={wholesalerForm.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                        은행명 <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        key={field.value || "empty"}
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isSubmittingWholesaler}
                      >
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 h-auto rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all">
                            <SelectValue placeholder="은행을 선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BANKS.map((bank) => (
                            <SelectItem key={bank} value={bank}>
                              {bank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        정산을 받을 은행을 선택해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 계좌번호 */}
                <FormField
                  control={wholesalerForm.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                        계좌번호 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 123-456-789"
                          {...field}
                          disabled={isSubmittingWholesaler}
                          className="px-4 py-3 rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        선택한 은행의 계좌번호를 입력해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 제출 버튼 */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmittingWholesaler}
                    className="px-8 py-3 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
                  >
                    {isSubmittingWholesaler ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      "저장"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

        {/* 3. 이메일 변경 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">이메일 변경</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-6 pl-7">
            이메일을 변경하면 새 이메일로 인증 링크가 발송됩니다.
          </p>

          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              className="space-y-4 pl-7"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                      새 이메일 주소
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="예: new@example.com"
                        {...field}
                        disabled={isSubmittingEmail}
                        className="px-4 py-3 rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                      새 이메일 주소를 입력하면 인증 이메일이 발송됩니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingEmail}
                  className="px-6 py-2.5 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
                >
                  {isSubmittingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      요청 중...
                    </>
                  ) : (
                    "변경 요청"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* 4. 비밀번호 변경 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            비밀번호 변경
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
            비밀번호를 변경하려면 아래 버튼을 사용하세요.
          </p>

          <div
            className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
            onClick={() =>
              console.log("🔑 [settings] UserButton 클릭 - Clerk 계정 설정 열기")
            }
          >
            <UserButton
              afterSignOutUrl="/sign-in/wholesaler"
              userProfileMode="popover"
              appearance={{
                elements: {
                  avatarBox:
                    "w-7 h-7 bg-[#10B981] text-white text-xs font-bold",
                  userButtonTrigger:
                    "shadow-none p-0 hover:shadow-none focus-visible:ring-2 focus-visible:ring-[#10B981]/40",
                },
              }}
            />
            <p className="text-sm text-gray-600 dark:text-gray-200 pt-0.5">
              클릭하면 Clerk 계정 설정(비밀번호 변경 포함) 메뉴가 열립니다.
            </p>
          </div>
        </div>

        {/* 5. 알림 설정 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">알림 설정</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-6 pl-7">
            받고 싶은 알림을 선택하세요.
          </p>

          <Form {...notificationForm}>
            <form
              onSubmit={notificationForm.handleSubmit(onSubmitNotifications)}
              className="space-y-6 pl-7"
            >
                {/* 새 주문 알림 */}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                    새 주문 알림
                  </p>
                  <div className="space-y-2">
                    <FormField
                      control={notificationForm.control}
                      name="new_order.email"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmittingNotifications}
                              className="w-5 h-5 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer font-normal">
                            이메일 알림
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="new_order.push"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmittingNotifications}
                              className="w-5 h-5 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer font-normal">
                            푸시 알림
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 정산 완료 알림 */}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                    정산 완료 알림
                  </p>
                  <div className="space-y-2">
                    <FormField
                      control={notificationForm.control}
                      name="settlement_completed.email"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmittingNotifications}
                              className="w-5 h-5 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer font-normal">
                            이메일 알림
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="settlement_completed.push"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmittingNotifications}
                              className="w-5 h-5 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer font-normal">
                            푸시 알림
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 문의 답변 알림 */}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                    문의 답변 알림
                  </p>
                  <div className="space-y-2">
                    <FormField
                      control={notificationForm.control}
                      name="inquiry_answered.email"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmittingNotifications}
                              className="w-5 h-5 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer font-normal">
                            이메일 알림
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="inquiry_answered.push"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmittingNotifications}
                              className="w-5 h-5 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer font-normal">
                            푸시 알림
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmittingNotifications}
                    className="px-8 py-3 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
                  >
                    {isSubmittingNotifications ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      "저장"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

        {/* 6. 회원 탈퇴 */}
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={() => setIsDeleteAccountModalOpen(true)}
            className="text-sm text-red-500 underline decoration-red-300 hover:text-red-600 hover:decoration-red-600 transition-colors font-medium"
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* 회원탈퇴 모달 */}
      <DeleteAccountModal
        open={isDeleteAccountModalOpen}
        onOpenChange={setIsDeleteAccountModalOpen}
      />

      {/* 이메일 동일 안내 모달 */}
      <Dialog open={isEmailSameModalOpen} onOpenChange={setIsEmailSameModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-6 h-6 text-[#10B981]" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">
              이메일 변경 안내
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-center">
              입력하신 이메일 주소가 현재 사용 중인 이메일과 동일합니다.
              <br />
              <br />
              다른 이메일 주소를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 pt-4">
            <Button
              onClick={() => setIsEmailSameModalOpen(false)}
              className="px-8 py-2.5 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
