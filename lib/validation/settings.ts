/**
 * @file settings.ts
 * @description 설정 페이지 유효성 검증 스키마
 *
 * 이 파일은 설정 페이지에서 사용하는 폼의 유효성 검증을 위한
 * Zod 스키마를 정의합니다.
 *
 * 주요 검증 규칙:
 * - 사업자 정보 수정: 상호명, 연락처, 주소, 상세주소, 계좌번호
 * - 이메일 변경: 이메일 형식 검증
 * - 알림 설정: boolean 값 검증
 *
 * @dependencies
 * - zod: 스키마 검증 라이브러리
 * - lib/utils/constants.ts: BANKS 상수
 *
 * @example
 * ```tsx
 * import { updateWholesalerSchema } from '@/lib/validation/settings';
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const form = useForm({
 *   resolver: zodResolver(updateWholesalerSchema),
 * });
 * ```
 */

import { z } from "zod";
import { BANKS } from "@/lib/utils/constants";

/**
 * 사업자 정보 수정 폼 데이터 스키마
 */
export const updateWholesalerSchema = z.object({
  business_name: z
    .string()
    .min(2, "상호명은 2글자 이상 입력해주세요.")
    .max(100, "상호명은 100글자 이하로 입력해주세요."),

  phone: z
    .string()
    .min(1, "연락처를 입력해주세요.")
    .refine(
      (val) => {
        // 하이픈 제거 후 숫자만 추출
        const digits = val.replace(/\D/g, "");
        // 010으로 시작하는 11자리 또는 10자리 번호
        return (
          (digits.length === 11 || digits.length === 10) &&
          digits.startsWith("010") &&
          /^\d+$/.test(digits)
        );
      },
      {
        message: "연락처는 010-####-#### 형식으로 입력해주세요.",
      },
    ),

  address: z
    .string()
    .min(5, "주소는 5글자 이상 입력해주세요.")
    .max(200, "주소는 200글자 이하로 입력해주세요."),

  address_detail: z
    .string()
    .max(100, "상세주소는 100글자 이하로 입력해주세요.")
    .optional(),

  bank_name: z
    .string()
    .min(1, "은행을 선택해주세요.")
    .refine((val) => BANKS.includes(val as (typeof BANKS)[number]), {
      message: "올바른 은행을 선택해주세요.",
    }),

  bank_account_number: z
    .string()
    .min(5, "계좌번호는 5글자 이상 입력해주세요.")
    .max(20, "계좌번호는 20글자 이하로 입력해주세요.")
    .refine((val) => /^[\d-]+$/.test(val), {
      message: "계좌번호는 숫자와 하이픈(-)만 입력 가능합니다.",
    }),
});

/**
 * 사업자 정보 수정 폼 데이터 타입
 */
export type UpdateWholesalerFormData = z.infer<typeof updateWholesalerSchema>;

/**
 * 이메일 변경 폼 데이터 스키마
 */
export const updateEmailSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식이 아닙니다."),
});

/**
 * 이메일 변경 폼 데이터 타입
 */
export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;

/**
 * 알림 설정 폼 데이터 스키마
 */
export const updateNotificationPreferencesSchema = z.object({
  new_order: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
  settlement_completed: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
  inquiry_answered: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
});

/**
 * 알림 설정 폼 데이터 타입
 */
export type UpdateNotificationPreferencesFormData = z.infer<
  typeof updateNotificationPreferencesSchema
>;

/**
 * 탈퇴 사유 옵션 상수
 */
export const DELETE_REASON_OPTIONS = [
  "서비스가 필요 없어졌습니다",
  "이용 빈도가 낮습니다",
  "다른 서비스를 이용하게 되었습니다",
  "서비스 품질에 불만이 있습니다",
  "개인정보 보호가 우려됩니다",
  "기타",
] as const;

/**
 * 회원탈퇴 폼 데이터 스키마
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  reason: z
    .string()
    .min(1, "탈퇴 사유를 선택해주세요.")
    .refine(
      (val) => DELETE_REASON_OPTIONS.includes(val as (typeof DELETE_REASON_OPTIONS)[number]),
      {
        message: "올바른 탈퇴 사유를 선택해주세요.",
      },
    ),
  feedback: z
    .string()
    .max(500, "추가 설명은 500글자 이하로 입력해주세요.")
    .optional(),
});

/**
 * 회원탈퇴 폼 데이터 타입
 */
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;