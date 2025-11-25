/**
 * @file format.ts
 * @description 포맷팅 유틸리티 함수들
 *
 * 이 파일은 날짜, 금액, 전화번호 등을 포맷팅하는 유틸리티 함수들을 제공합니다.
 * 프로젝트 전반에서 일관된 포맷을 사용하기 위한 공통 함수입니다.
 *
 * @example
 * ```tsx
 * import { formatDate, formatCurrency, formatPhone } from '@/lib/utils/format';
 *
 * // 날짜 포맷
 * const date = formatDate('2025-11-20'); // "2025-11-20"
 * const dateKr = formatDate('2025-11-20', 'ko'); // "2025년 11월 20일"
 *
 * // 금액 포맷
 * const price = formatCurrency(10000); // "₩10,000"
 *
 * // 전화번호 포맷
 * const phone = formatPhone('01012345678'); // "010-1234-5678"
 * ```
 *
 * @dependencies
 * - Intl.DateTimeFormat (네이티브)
 * - Intl.NumberFormat (네이티브)
 */

/**
 * 날짜 포맷 함수
 *
 * 날짜를 지정된 형식으로 포맷팅합니다.
 *
 * @param {string | Date} date - 포맷팅할 날짜 (ISO 문자열 또는 Date 객체)
 * @param {string} format - 포맷 형식 ('default' | 'ko' | 'short')
 *   - 'default': "YYYY-MM-DD" (예: "2025-11-20")
 *   - 'ko': "YYYY년 MM월 DD일" (예: "2025년 11월 20일")
 *   - 'short': "MM/DD" (예: "11/20")
 * @returns {string} 포맷팅된 날짜 문자열
 *
 * @example
 * ```tsx
 * formatDate('2025-11-20'); // "2025-11-20"
 * formatDate('2025-11-20', 'ko'); // "2025년 11월 20일"
 * formatDate(new Date(), 'short'); // "11/20"
 * ```
 */
export function formatDate(
  date: string | Date,
  format: "default" | "ko" | "short" = "default",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    console.warn("⚠️ [format] 잘못된 날짜:", date);
    return "";
  }

  switch (format) {
    case "ko":
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObj);
    case "short":
      return new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj);
    case "default":
    default:
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(dateObj)
        .replace(/\. /g, "-")
        .replace(/\./g, "");
  }
}

/**
 * 날짜+시간 포맷 함수
 *
 * 날짜와 시간을 지정된 형식으로 포맷팅합니다.
 *
 * @param {string | Date} date - 포맷팅할 날짜 (ISO 문자열 또는 Date 객체)
 * @param {string} format - 포맷 형식 ('default' | 'ko' | 'time-only')
 *   - 'default': "YYYY-MM-DD HH:mm" (예: "2025-11-20 14:30")
 *   - 'ko': "YYYY년 MM월 DD일 HH:mm" (예: "2025년 11월 20일 14:30")
 *   - 'time-only': "HH:mm" (예: "14:30")
 * @returns {string} 포맷팅된 날짜+시간 문자열
 *
 * @example
 * ```tsx
 * formatDateTime('2025-11-20T14:30:00Z'); // "2025-11-20 14:30"
 * formatDateTime('2025-11-20T14:30:00Z', 'ko'); // "2025년 11월 20일 14:30"
 * formatDateTime(new Date(), 'time-only'); // "14:30"
 * ```
 */
export function formatDateTime(
  date: string | Date,
  format: "default" | "ko" | "time-only" = "default",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    console.warn("⚠️ [format] 잘못된 날짜:", date);
    return "";
  }

  switch (format) {
    case "ko":
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    case "time-only":
      return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    case "default":
    default:
      const dateStr = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(dateObj)
        .replace(/\. /g, "-")
        .replace(/\./g, "");
      const timeStr = new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
      return `${dateStr} ${timeStr}`;
  }
}

/**
 * 금액 포맷 함수
 *
 * 숫자를 원화 형식으로 포맷팅합니다.
 *
 * @param {number} amount - 포맷팅할 금액
 * @param {Intl.NumberFormatOptions} options - 추가 포맷 옵션
 * @returns {string} 포맷팅된 금액 문자열 (예: "₩10,000")
 *
 * @example
 * ```tsx
 * formatCurrency(10000); // "₩10,000"
 * formatCurrency(1000000); // "₩1,000,000"
 * formatCurrency(10000, { notation: 'compact' }); // "₩1만"
 * ```
 */
export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions,
): string {
  if (isNaN(amount)) {
    console.warn("⚠️ [format] 잘못된 금액:", amount);
    return "₩0";
  }

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    ...options,
  }).format(amount);
}

/**
 * 가격 포맷 함수 (간단한 형식)
 *
 * 숫자를 한국 원화 형식으로 포맷팅합니다.
 * formatCurrency와 달리 "원" 접미사만 사용합니다.
 *
 * @param {number} price - 포맷팅할 가격
 * @returns {string} 포맷팅된 가격 문자열 (예: "3,000원")
 *
 * @example
 * ```tsx
 * formatPrice(3000); // "3,000원"
 * formatPrice(1000000); // "1,000,000원"
 * ```
 */
export function formatPrice(price: number): string {
  if (isNaN(price)) {
    console.warn("⚠️ [format] 잘못된 가격:", price);
    return "0원";
  }

  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

/**
 * 전화번호 포맷 함수
 *
 * 전화번호를 표준 형식(010-1234-5678)으로 포맷팅합니다.
 *
 * @param {string} phone - 포맷팅할 전화번호
 * @returns {string} 포맷팅된 전화번호 (예: "010-1234-5678")
 *
 * @example
 * ```tsx
 * formatPhone('01012345678'); // "010-1234-5678"
 * formatPhone('010-1234-5678'); // "010-1234-5678"
 * formatPhone('010 1234 5678'); // "010-1234-5678"
 * ```
 */
export function formatPhone(phone: string): string {
  if (!phone) {
    return "";
  }

  // 숫자만 추출
  const digits = phone.replace(/\D/g, "");

  // 010으로 시작하는 11자리 번호인지 확인
  if (digits.length === 11 && digits.startsWith("010")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  // 010으로 시작하는 10자리 번호 (구형 번호)
  if (digits.length === 10 && digits.startsWith("010")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // 이미 포맷팅된 경우 그대로 반환
  if (phone.includes("-")) {
    return phone;
  }

  // 형식이 맞지 않으면 원본 반환
  console.warn("⚠️ [format] 전화번호 형식이 올바르지 않습니다:", phone);
  return phone;
}
