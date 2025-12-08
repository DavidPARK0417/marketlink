/**
 * @file product.ts
 * @description 상품 등록/수정 폼 유효성 검증 스키마
 *
 * 이 파일은 상품 등록 및 수정 시 사용하는 폼의 유효성 검증을 위한
 * Zod 스키마를 정의합니다.
 *
 * 주요 검증 규칙:
 * - 상품명: 2글자 이상
 * - 카테고리: 필수 선택
 * - 가격: 0 이상
 * - 최소주문수량: 1 이상 (정수)
 * - 재고: 0 이상 (정수)
 * - 단위: 기본값 "ea"
 * - 배송비: 0 이상
 * - 배송 방법: enum (courier/direct/quick/freight/dawn), 기본값 direct
 * - 납기: 선택
 * - 규격 정보: 객체 (weight, size, origin, storage) - 모두 선택
 * - 이미지: 문자열 배열 (최대 5개) - 선택
 *
 * @dependencies
 * - zod: 스키마 검증 라이브러리
 * - lib/utils/constants.ts: CATEGORIES, DELIVERY_METHODS, UNITS 상수
 *
 * @example
 * ```tsx
 * import { productSchema } from '@/lib/validation/product';
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const form = useForm({
 *   resolver: zodResolver(productSchema),
 * });
 * ```
 */

import { z } from "zod";
import { CATEGORIES, UNITS } from "@/lib/utils/constants";

/**
 * 상품 폼 데이터 스키마
 *
 * 주의: specification 필드는 폼에서는 unit과 specification_value로 분리하여 입력받고,
 * 저장 시 "{specification_value}{unit}" 형식으로 합쳐서 저장합니다.
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(2, "상품명은 2글자 이상이어야 합니다")
    .max(200, "상품명은 200글자 이하로 입력해주세요"),

  category: z
    .string()
    .min(1, "카테고리를 선택해주세요")
    .refine((val) => CATEGORIES.includes(val as (typeof CATEGORIES)[number]), {
      message: "올바른 카테고리를 선택해주세요",
    }),

  description: z.string().optional(),

  price: z
    .number({
      required_error: "가격을 입력해주세요",
      invalid_type_error: "가격은 숫자여야 합니다",
    })
    .min(0, "가격은 0 이상이어야 합니다")
    .int("가격은 정수여야 합니다"),

  moq: z
    .number({
      required_error: "최소주문수량을 입력해주세요",
      invalid_type_error: "최소주문수량은 숫자여야 합니다",
    })
    .int("최소주문수량은 정수여야 합니다")
    .min(1, "최소주문수량은 1 이상이어야 합니다"),

  stock: z
    .number({
      required_error: "재고를 입력해주세요",
      invalid_type_error: "재고는 숫자여야 합니다",
    })
    .int("재고는 정수여야 합니다")
    .min(0, "재고는 0 이상이어야 합니다"),

  unit: z
    .string()
    .default("ea")
    .refine((val) => UNITS.includes(val as (typeof UNITS)[number]), {
      message: "올바른 단위를 선택해주세요",
    }),

  specification_value: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+(\.\d+)?$/.test(val),
      { message: "숫자만 입력해주세요 (소수점 가능)" }
    ), // 단위와 함께 저장될 값 (소수점 포함 숫자만 허용)

  delivery_fee: z
    .number({
      required_error: "배송비를 입력해주세요",
      invalid_type_error: "배송비는 숫자여야 합니다",
    })
    .int("배송비는 정수여야 합니다")
    .min(0, "배송비는 0 이상이어야 합니다"),

  delivery_method: z
    .enum(["courier", "direct", "quick", "freight", "dawn"], {
      errorMap: () => ({ message: "배송 방법을 선택해주세요" }),
    })
    .default("direct"),

  lead_time: z.string().optional(),

  specifications: z
    .object({
      weight: z.string().optional(),
      size: z.string().optional(),
      origin: z.string().optional(),
      storage: z.string().optional(),
    })
    .optional(),

  images: z
    .array(z.string().url("올바른 이미지 URL 형식이 아닙니다"))
    .max(5, "이미지는 최대 5개까지 업로드할 수 있습니다")
    .optional()
    .default([]),
});

/**
 * 상품 폼 데이터 타입
 */
export type ProductFormData = z.infer<typeof productSchema>;
