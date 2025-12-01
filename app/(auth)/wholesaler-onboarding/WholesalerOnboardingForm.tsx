/**
 * @file WholesalerOnboardingForm.tsx
 * @description 도매점 온보딩 폼 컴포넌트
 *
 * 도매점 회원가입 시 사업자 정보를 입력받는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 *
 * 주요 기능:
 * 1. 사업자 정보 입력 필드 (사업자명, 사업자번호, 대표자명, 연락처, 주소, 은행명, 계좌번호)
 * 2. 전화번호 하이픈 자동 추가
 * 3. 사업자번호 하이픈 자동 제거
 * 4. 진행 표시 (2/3 단계)
 * 5. 폼 제출 시 Server Action 호출
 * 6. 성공 시 승인 대기 페이지로 리다이렉트
 * 7. 에러 처리 및 토스트 알림
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: zodResolver
 * - actions/wholesaler/create-wholesaler.ts: Server Action
 * - lib/validation/wholesaler.ts: 유효성 검증 스키마
 * - components/ui: shadcn/ui 컴포넌트들
 * - sonner: 토스트 알림
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useClerk, useAuth } from "@clerk/nextjs";
import { Loader2, CheckCircle, Search, ArrowLeft, LogOut, AlertCircle } from "lucide-react";
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
  wholesalerOnboardingSchema,
  type WholesalerOnboardingFormData,
} from "@/lib/validation/wholesaler";
import { BANKS } from "@/lib/utils/constants";
import { createWholesaler } from "@/actions/wholesaler/create-wholesaler";
import type { DaumPostcodeData } from "@/types/daum";

interface WholesalerOnboardingFormProps {
  previousData?: Partial<WholesalerOnboardingFormData>;
}

export default function WholesalerOnboardingForm({
  previousData,
}: WholesalerOnboardingFormProps) {
  const router = useRouter();
  const { isLoaded } = useAuth();
  // useClerk는 항상 호출해야 함 (React Hook 규칙)
  // ClerkProvider 밖에서 호출되면 에러가 발생하지만, 
  // 루트 레이아웃에 ClerkProvider가 있으므로 정상적으로 작동해야 함
  const { signOut } = useClerk();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDaumScriptLoaded, setIsDaumScriptLoaded] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  
  const businessNumberInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<WholesalerOnboardingFormData>({
    resolver: zodResolver(wholesalerOnboardingSchema),
    defaultValues: {
      business_name: previousData?.business_name || "",
      business_number: previousData?.business_number || "",
      representative: previousData?.representative || "",
      phone: previousData?.phone || "",
      address: previousData?.address || "",
      address_detail: previousData?.address_detail || "",
      bank_name: previousData?.bank_name || "",
      bank_account_number: previousData?.bank_account_number || "",
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

  // 사업자번호 하이픈 제거 핸들러 (숫자만 입력)
  const handleBusinessNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    form.setValue("business_number", digits, { shouldValidate: true });
  };

  // 카카오 우편번호 스크립트 동적 로드
  useEffect(() => {
    // 이미 로드되어 있는지 확인
    if (typeof window !== "undefined" && window.daum && window.daum.Postcode) {
      console.log("✅ [주소 검색] 카카오 우편번호 스크립트 이미 로드됨");
      setIsDaumScriptLoaded(true);
      return;
    }

    // 이미 스크립트 태그가 있는지 확인
    const existingScript = document.querySelector(
      'script[src*="postcode.v2.js"]'
    );
    if (existingScript) {
      console.log("⏳ [주소 검색] 스크립트 태그 존재, 로드 대기 중...");
      // 스크립트가 로드될 때까지 대기
      const checkScript = (attempts = 0) => {
        if (attempts > 50) {
          // 최대 10초 대기 (50 * 200ms)
          console.error("❌ [주소 검색] 스크립트 로드 타임아웃");
          setIsLoadingScript(false);
          return;
        }
        if (typeof window !== "undefined" && window.daum && window.daum.Postcode) {
          console.log("✅ [주소 검색] 카카오 우편번호 스크립트 로드 완료");
          setIsDaumScriptLoaded(true);
          setIsLoadingScript(false);
        } else {
          setTimeout(() => checkScript(attempts + 1), 200);
        }
      };
      checkScript();
      return;
    }

    // 스크립트가 없으면 동적으로 로드
    console.log("📥 [주소 검색] 카카오 우편번호 스크립트 로드 시작");
    setIsLoadingScript(true);

    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ [주소 검색] 카카오 우편번호 스크립트 로드 완료");
      setIsDaumScriptLoaded(true);
      setIsLoadingScript(false);
    };
    script.onerror = () => {
      console.error("❌ [주소 검색] 카카오 우편번호 스크립트 로드 실패");
      setIsLoadingScript(false);
      toast.error("주소 검색 기능을 불러오는 중 오류가 발생했습니다.");
    };

    document.head.appendChild(script);

    // cleanup 함수
    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 곳에서도 사용 가능)
    };
  }, []);

  // 카카오 주소 검색 함수
  const handleAddressSearch = () => {
    // 스크립트가 로드되지 않았으면 에러 표시
    if (!isDaumScriptLoaded) {
      if (isLoadingScript) {
        toast.info("주소 검색 기능을 불러오는 중입니다. 잠시만 기다려주세요.");
        return;
      }
      console.error(
        "❌ [주소 검색] 카카오 우편번호 스크립트가 로드되지 않았습니다.",
      );
      toast.error(
        "주소 검색 기능을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.",
      );
      return;
    }

    // window 객체에 daum이 있는지 확인
    if (typeof window !== "undefined" && window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: DaumPostcodeData) {
          // 주소 타입에 따라 조합
          let fullAddress = data.address; // 기본 주소
          let extraAddress = ""; // 참고항목 주소

          // 사용자가 선택한 주소 타입이 도로명 주소인 경우
          if (data.userSelectedType === "R") {
            fullAddress = data.roadAddress;
          } else {
            // 지번 주소인 경우
            fullAddress = data.jibunAddress;
          }

          // 사용자가 선택한 주소가 도로명 타입일 때 참고항목을 조합
          if (data.userSelectedType === "R") {
            // 법정동명이 있을 경우 추가
            if (data.bname !== "") {
              extraAddress += data.bname;
            }
            // 건물명이 있을 경우 추가
            if (data.buildingName !== "") {
              extraAddress +=
                extraAddress !== ""
                  ? `, ${data.buildingName}`
                  : data.buildingName;
            }
            // 조합된 참고항목을 해당 필드에 넣는다
            if (extraAddress !== "") {
              fullAddress += ` (${extraAddress})`;
            }
          }

          // 주소 필드에 값 설정
          form.setValue("address", fullAddress, { shouldValidate: true });

          console.log("✅ [주소 검색] 주소 선택 완료:", fullAddress);
        },
        onclose: function (state: "COMPLETE_CLOSE" | "FORCE_CLOSE") {
          // 사용자가 검색 결과를 선택하지 않고 창을 닫은 경우
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
        "주소 검색 기능을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.",
      );
    }
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: WholesalerOnboardingFormData) => {
    setIsSubmitting(true);

    try {
      console.log("📝 [wholesaler-onboarding] 폼 제출:", data);

      const result = await createWholesaler(data);

      if (!result.success) {
        console.error("❌ [wholesaler-onboarding] 도매점 생성 실패:", result.error);
        
        // 사업자번호 중복 에러인지 확인
        if (result.error === "이미 등록된 사업자번호입니다.") {
          setShowDuplicateModal(true);
        } else {
          toast.error(result.error || "도매점 등록 중 오류가 발생했습니다.");
        }
        return;
      }

      console.log("✅ [wholesaler-onboarding] 도매점 생성 성공:", result.wholesalerId);

      // 성공 시 완료 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ [wholesaler-onboarding] 폼 제출 예외:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "도매점 등록 중 예상치 못한 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 완료 모달 확인 핸들러
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  // 중복 모달 확인 핸들러
  const handleDuplicateConfirm = () => {
    setShowDuplicateModal(false);
    // 사업자번호 필드로 포커스 이동
    setTimeout(() => {
      businessNumberInputRef.current?.focus();
      businessNumberInputRef.current?.select();
    }, 100);
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    console.log("🔙 [wholesaler-onboarding] 뒤로가기 - 로그인 페이지로 이동");
    router.push("/sign-in/wholesaler");
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (!isLoaded) {
      console.warn("⚠️ [wholesaler-onboarding] Clerk가 아직 로드되지 않음");
      // Clerk가 로드되지 않았어도 로그인 페이지로 이동
      router.push("/sign-in/wholesaler");
      return;
    }

    try {
      console.log("🚪 [wholesaler-onboarding] 로그아웃 시작");
      setIsLoggingOut(true);
      await signOut();
      router.push("/sign-in/wholesaler");
      console.log("✅ [wholesaler-onboarding] 로그아웃 완료");
    } catch (error) {
      console.error("❌ [wholesaler-onboarding] 로그아웃 오류:", error);
      setIsLoggingOut(false);
      toast.error("로그아웃 중 오류가 발생했습니다.");
      // 에러가 발생해도 강제로 로그인 페이지로 이동
      router.push("/sign-in/wholesaler");
    }
  };

  return (
    <div className="w-full">
      {/* 완료 모달 */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              등록 완료
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              사업자 정보가 성공적으로 등록되었습니다.
              <br />
              관리자 승인을 기다려주세요.
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

      {/* 사업자번호 중복 안내 모달 */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-orange-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              이미 등록된 사업자번호
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              입력하신 사업자번호는 이미 등록되어 있습니다.
              <br />
              다른 사업자번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleDuplicateConfirm}
              className="w-full sm:w-auto min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 네비게이션 버튼 영역 */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={handleGoBack}
          disabled={isSubmitting || isLoggingOut}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          뒤로가기
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={isSubmitting || isLoggingOut}
          className="flex items-center gap-2"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              로그아웃 중...
            </>
          ) : (
            <>
              <LogOut className="size-4" />
              로그아웃
            </>
          )}
        </Button>
      </div>

      {/* 진행 표시 */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <span>2/3 단계</span>
          <span className="text-blue-600 dark:text-blue-400">사업자 정보 입력</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사업자 정보 입력</CardTitle>
          <CardDescription>
            {previousData ? (
              <>
                이전에 작성하신 정보가 표시됩니다. 필요한 부분을 수정 후 재신청해주세요.
                <br />
                수정하신 정보는 관리자 승인 후 활성화됩니다.
              </>
            ) : (
              <>
                도매점 회원가입을 위해 사업자 정보를 입력해주세요.
                <br />
                입력하신 정보는 관리자 승인 후 활성화됩니다.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 사업자명 */}
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업자명 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 농산물도매상사"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>사업자 등록증에 기재된 상호명을 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 사업자번호 */}
              <FormField
                control={form.control}
                name="business_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업자번호 *</FormLabel>
                    <FormControl>
                      <Input
                        ref={businessNumberInputRef}
                        placeholder="예: 1234567890"
                        {...field}
                        onKeyDown={(e) => {
                          // 숫자 키 (0-9)
                          if (e.key >= '0' && e.key <= '9') {
                            // 최대 10자리 제한 확인
                            const currentValue = field.value || '';
                            if (currentValue.length >= 10) {
                              e.preventDefault();
                              return;
                            }
                            return; // 허용
                          }
                          
                          // 특수 키 허용
                          const allowedKeys = [
                            'Backspace',
                            'Delete',
                            'Tab',
                            'ArrowLeft',
                            'ArrowRight',
                            'ArrowUp',
                            'ArrowDown',
                            'Home',
                            'End',
                            'Enter',
                          ];
                          
                          if (allowedKeys.includes(e.key)) {
                            return; // 허용
                          }
                          
                          // Ctrl/Cmd + A, C, V, X
                          if (e.ctrlKey || e.metaKey) {
                            if (['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                              return; // 허용
                            }
                          }
                          
                          // 그 외 모든 키 차단
                          e.preventDefault();
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text');
                          const numbersOnly = pastedText.replace(/[^0-9]/g, '').slice(0, 10); // 최대 10자리
                          if (numbersOnly) {
                            handleBusinessNumberChange(numbersOnly);
                          }
                        }}
                        onChange={(e) => {
                          handleBusinessNumberChange(e.target.value);
                        }}
                        maxLength={10}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>하이픈 없이 10자리 숫자만 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 대표자명 */}
              <FormField
                control={form.control}
                name="representative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대표자명 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 홍길동"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>사업자 등록증에 기재된 대표자명을 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 연락처 */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연락처 *</FormLabel>
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="주소 검색 버튼을 클릭해주세요"
                          {...field}
                          readOnly
                          disabled={isSubmitting}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddressSearch}
                        disabled={isSubmitting || isLoadingScript}
                        className="shrink-0"
                      >
                        {isLoadingScript ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            로딩 중...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 size-4" />
                            주소 검색
                          </>
                        )}
                      </Button>
                    </div>
                    <FormDescription>
                      주소 검색 버튼을 클릭하여 사업장 주소를 검색해주세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 상세주소 */}
              <FormField
                control={form.control}
                name="address_detail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상세주소</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 101호, 2층 (선택사항)"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      상세주소를 입력해주세요 (선택사항)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 은행명 */}
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>은행명 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormDescription>정산을 받을 은행을 선택해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 계좌번호 */}
              <FormField
                control={form.control}
                name="bank_account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>계좌번호 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 123-456-789"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>선택한 은행의 계좌번호를 입력해주세요.</FormDescription>
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
                      {previousData ? "재신청 중..." : "등록 중..."}
                    </>
                  ) : (
                    previousData ? "재신청하기" : "등록하기"
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

