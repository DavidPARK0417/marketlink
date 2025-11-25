/**
 * @file retailer.ts
 * @description 소매점 온보딩 폼 유효성 검증 스키마
 *
 * 이 파일은 소매점 회원가입 시 기본 정보 입력 폼의 유효성 검증을 위한
 * Zod 스키마를 정의합니다.
 *
 * 주요 검증 규칙:
 * - 상호명: 2글자 이상
 * - 연락처: 010-####-#### 형식 (하이픈 자동 추가)
 * - 주소: 5글자 이상
 * - 이메일: 유효한 이메일 형식
 *
 * @dependencies
 * - zod: 스키마 검증 라이브러리
 *
 * @example
 * ```tsx
 * import { retailerOnboardingSchema } from '@/lib/validation/retailer';
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const form = useForm({
 *   resolver: zodResolver(retailerOnboardingSchema),
 * });
 * ```
 */

import { z } from "zod";

/**
 * 소매점 온보딩 폼 데이터 스키마
 */
export const retailerOnboardingSchema = z.object({
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

  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식으로 입력해주세요."),
});

/**
 * 소매점 온보딩 폼 데이터 타입
 */
export type RetailerOnboardingFormData = z.infer<
  typeof retailerOnboardingSchema
>;

