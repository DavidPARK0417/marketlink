/**
 * @file storage.ts
 * @description Supabase Storage 이미지 업로드/삭제 유틸리티
 *
 * 이 파일은 상품 이미지와 문의 첨부 이미지를 Supabase Storage에 업로드하고 삭제하는 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. 상품 이미지 업로드 (파일 타입/크기 검증 포함)
 * 2. 상품 이미지 삭제
 * 3. 문의 첨부 이미지 업로드 (파일 타입/크기 검증 포함)
 *
 * 버킷 정보:
 * - 버킷 이름: 'product-images'
 * - 상품 이미지 경로: {clerk_user_id}/products/{timestamp}-{filename}
 * - 문의 첨부 이미지 경로: {clerk_user_id}/inquiries/{timestamp}-{filename}
 * - Public 버킷: 모든 사용자가 조회 가능
 * - 최대 파일 크기: 5MB
 * - 허용 포맷: jpg, jpeg, png, webp
 *
 * @dependencies
 * - @supabase/supabase-js: SupabaseClient 타입
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useUser } from '@clerk/nextjs';
 * import { uploadProductImage, deleteProductImage } from '@/lib/supabase/storage';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *   const { user } = useUser();
 *
 *   const handleUpload = async (file: File) => {
 *     if (!user) return;
 *     const url = await uploadProductImage(file, user.id, supabase);
 *     console.log('업로드된 이미지 URL:', url);
 *   };
 * }
 * ```
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/**
 * 상품 이미지 업로드
 *
 * @param file 업로드할 이미지 파일
 * @param clerkUserId Clerk 사용자 ID (경로에 사용)
 * @param supabase Supabase 클라이언트 인스턴스
 * @returns 업로드된 이미지의 Public URL
 * @throws 파일 타입/크기 검증 실패 또는 업로드 실패 시 에러
 *
 * @example
 * ```tsx
 * const url = await uploadProductImage(file, user.id, supabase);
 * ```
 */
export async function uploadProductImage(
  file: File,
  clerkUserId: string,
  supabase: SupabaseClient,
): Promise<string> {
  console.log("📤 [storage] 이미지 업로드 시작", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  // 파일 크기 검증 (먼저 체크)
  if (file.size === 0) {
    throw new Error("빈 파일은 업로드할 수 없습니다.");
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    throw new Error(`이미지 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
  }

  // 파일 확장자 추출 및 검증
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    throw new Error(
      `지원하지 않는 파일 형식입니다. 허용 형식: ${allowedExtensions.join(
        ", ",
      )}`,
    );
  }

  // 파일 타입 검증
  // MIME 타입이 없거나 빈 문자열인 경우 확장자 기반으로 추론
  let mimeType = file.type;

  if (
    !mimeType ||
    mimeType === "" ||
    mimeType === "application/json" ||
    mimeType === "application/octet-stream"
  ) {
    // 확장자 기반으로 MIME 타입 추론
    const mimeTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    mimeType = mimeTypeMap[fileExt] || file.type;
    console.warn(
      "⚠️ [storage] MIME 타입이 없거나 잘못됨, 확장자 기반으로 추론:",
      {
        originalType: file.type,
        inferredType: mimeType,
        fileExt,
      },
    );
  }

  if (!ALLOWED_TYPES.includes(mimeType as (typeof ALLOWED_TYPES)[number])) {
    const allowedTypes = ALLOWED_TYPES.join(", ");
    throw new Error(
      `지원하지 않는 이미지 형식입니다. 파일: ${file.name}, 감지된 형식: ${
        mimeType || "알 수 없음"
      }. 허용 형식: ${allowedTypes}`,
    );
  }

  // 파일명 생성 (타임스탬프 + 랜덤 문자열)
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  const filePath = `${clerkUserId}/products/${fileName}`;

  console.log("📁 [storage] 파일 경로:", filePath);
  console.log("📋 [storage] 최종 파일 정보:", {
    fileName,
    filePath,
    mimeType,
    fileSize: file.size,
    clerkUserId,
  });

  // 업로드 시도
  console.log("🚀 [storage] Storage 업로드 시작...");
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false, // 기존 파일 덮어쓰기 방지
      contentType: mimeType, // 명시적으로 MIME 타입 지정
    });

  if (error) {
    // 에러 객체의 모든 속성 확인
    const errorDetails: Record<string, unknown> = {};
    try {
      // 에러 객체를 JSON으로 직렬화 시도
      const errorJson = JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      );
      Object.assign(errorDetails, JSON.parse(errorJson));
    } catch {
      // 직렬화 실패 시 수동으로 속성 추출
      for (const key in error) {
        try {
          errorDetails[key] = (error as unknown as Record<string, unknown>)[key];
        } catch {
          // 직렬화 불가능한 속성은 무시
        }
      }
      // 에러 객체의 직접 속성도 확인
      if (error instanceof Error) {
        errorDetails.name = error.name;
        errorDetails.message = error.message;
        errorDetails.stack = error.stack;
      }
    }

    // 에러 메시지 추출 (여러 방법 시도)
    const errorMessage =
      error.message ||
      (error as { error?: string }).error ||
      (error as { message?: string }).message ||
      JSON.stringify(error) ||
      String(error) ||
      "알 수 없는 오류";

    // 에러 코드 추출
    const errorCode =
      error.statusCode ||
      (error as { statusCode?: number }).statusCode ||
      (error as { code?: string }).code ||
      "unknown";

    console.error("❌ [storage] 이미지 업로드 실패 - 상세 정보:", {
      errorMessage: errorMessage,
      errorCode: errorCode,
      errorDetails:
        Object.keys(errorDetails).length > 0
          ? errorDetails
          : "에러 상세 정보 없음",
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      fileName: file.name,
      fileType: file.type,
      inferredMimeType: mimeType,
      filePath: filePath,
      clerkUserId: clerkUserId,
      bucketName: BUCKET_NAME,
      // 원본 에러 객체는 별도로 출력 (디버깅용)
      originalError: error,
    });

    // 에러 메시지를 문자열로 변환하여 확인
    const errorMessageStr = String(errorMessage).toLowerCase();

    // RLS 정책 관련 에러 확인
    if (
      errorMessageStr.includes("row-level security") ||
      errorMessageStr.includes("rls") ||
      errorMessageStr.includes("policy") ||
      errorMessageStr.includes("permission") ||
      errorMessageStr.includes("unauthorized") ||
      errorMessageStr.includes("403") ||
      errorCode === 403 ||
      errorCode === "403"
    ) {
      throw new Error(
        `이미지 업로드 권한이 없습니다. 관리자 권한이 필요할 수 있습니다. (에러 코드: ${errorCode}, 메시지: ${errorMessage})`,
      );
    }

    // MIME 타입 관련 에러 확인
    if (
      errorMessageStr.includes("mime type") ||
      errorMessageStr.includes("content type") ||
      errorMessageStr.includes("not supported") ||
      errorMessageStr.includes("unsupported")
    ) {
      throw new Error(
        `이미지 파일 형식이 올바르지 않습니다. JPG, PNG, WebP 형식의 이미지 파일만 업로드할 수 있습니다. (파일: ${file.name}, 감지된 형식: ${mimeType}, 에러: ${errorMessage})`,
      );
    }

    // 일반 에러
    throw new Error(
      `이미지 업로드에 실패했습니다. (에러 코드: ${errorCode}, 메시지: ${errorMessage})`,
    );
  }

  console.log("✅ [storage] 이미지 업로드 성공:", data.path);

  // Public URL 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  console.log("🔗 [storage] Public URL:", publicUrl);

  return publicUrl;
}

/**
 * 상품 이미지 삭제
 *
 * @param imageUrl 삭제할 이미지의 Public URL 또는 파일 경로
 * @param supabase Supabase 클라이언트 인스턴스
 * @returns 삭제 성공 여부
 * @throws 삭제 실패 시 에러
 *
 * @example
 * ```tsx
 * await deleteProductImage(imageUrl, supabase);
 * ```
 */
export async function deleteProductImage(
  imageUrl: string,
  supabase: SupabaseClient,
): Promise<void> {
  console.log("🗑️ [storage] 이미지 삭제 시작:", imageUrl);

  // Public URL에서 파일 경로 추출
  // 예: https://xxx.supabase.co/storage/v1/object/public/product-images/user_id/products/file.jpg
  // → user_id/products/file.jpg
  let filePath: string;

  if (imageUrl.includes("/storage/v1/object/public/")) {
    // Public URL인 경우 경로 추출
    const urlParts = imageUrl.split("/storage/v1/object/public/");
    if (urlParts.length < 2) {
      throw new Error("올바른 이미지 URL 형식이 아닙니다.");
    }
    const pathParts = urlParts[1].split("/");
    if (pathParts.length < 2) {
      throw new Error("올바른 이미지 경로가 아닙니다.");
    }
    // 버킷 이름 제거하고 나머지 경로만 사용
    filePath = pathParts.slice(1).join("/");
  } else {
    // 이미 경로인 경우 그대로 사용
    filePath = imageUrl;
  }

  console.log("📁 [storage] 삭제할 파일 경로:", filePath);

  // 삭제
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error("❌ [storage] 이미지 삭제 실패:", error);
    throw new Error(`이미지 삭제에 실패했습니다: ${error.message}`);
  }

  console.log("✅ [storage] 이미지 삭제 성공:", filePath);
}

/**
 * 문의 첨부 이미지 업로드
 *
 * @param file 업로드할 이미지 파일
 * @param clerkUserId Clerk 사용자 ID (경로에 사용)
 * @param supabase Supabase 클라이언트 인스턴스
 * @returns 업로드된 이미지의 Public URL
 * @throws 파일 타입/크기 검증 실패 또는 업로드 실패 시 에러
 *
 * @example
 * ```tsx
 * const url = await uploadInquiryAttachment(file, user.id, supabase);
 * ```
 */
export async function uploadInquiryAttachment(
  file: File,
  clerkUserId: string,
  supabase: SupabaseClient,
): Promise<string> {
  console.log("📤 [storage] 문의 첨부 이미지 업로드 시작", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  // 파일 크기 검증 (먼저 체크)
  if (file.size === 0) {
    throw new Error("빈 파일은 업로드할 수 없습니다.");
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    throw new Error(`이미지 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
  }

  // 파일 확장자 추출 및 검증
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    throw new Error(
      `지원하지 않는 파일 형식입니다. 허용 형식: ${allowedExtensions.join(
        ", ",
      )}`,
    );
  }

  // 파일 타입 검증
  // MIME 타입이 없거나 빈 문자열인 경우 확장자 기반으로 추론
  let mimeType = file.type;

  if (
    !mimeType ||
    mimeType === "" ||
    mimeType === "application/json" ||
    mimeType === "application/octet-stream"
  ) {
    // 확장자 기반으로 MIME 타입 추론
    const mimeTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    mimeType = mimeTypeMap[fileExt] || file.type;
    console.warn(
      "⚠️ [storage] MIME 타입이 없거나 잘못됨, 확장자 기반으로 추론:",
      {
        originalType: file.type,
        inferredType: mimeType,
        fileExt,
      },
    );
  }

  if (!ALLOWED_TYPES.includes(mimeType as (typeof ALLOWED_TYPES)[number])) {
    const allowedTypes = ALLOWED_TYPES.join(", ");
    throw new Error(
      `지원하지 않는 이미지 형식입니다. 파일: ${file.name}, 감지된 형식: ${
        mimeType || "알 수 없음"
      }. 허용 형식: ${allowedTypes}`,
    );
  }

  // 파일명 생성 (타임스탬프 + 랜덤 문자열)
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  const filePath = `${clerkUserId}/inquiries/${fileName}`;

  console.log("📁 [storage] 파일 경로:", filePath);
  console.log("📋 [storage] 최종 파일 정보:", {
    fileName,
    filePath,
    mimeType,
    fileSize: file.size,
  });

  // 업로드
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false, // 기존 파일 덮어쓰기 방지
      contentType: mimeType, // 명시적으로 MIME 타입 지정
    });

  if (error) {
    console.error("❌ [storage] 문의 첨부 이미지 업로드 실패:", {
      error,
      errorCode: error.statusCode,
      errorMessage: error.message,
      fileName: file.name,
      fileType: file.type,
      inferredMimeType: mimeType,
    });

    // 더 친화적인 에러 메시지 제공
    if (
      error.message.includes("mime type") ||
      error.message.includes("content type")
    ) {
      throw new Error(
        `이미지 파일 형식이 올바르지 않습니다. JPG, PNG, WebP 형식의 이미지 파일만 업로드할 수 있습니다. (파일: ${file.name})`,
      );
    }

    throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
  }

  console.log("✅ [storage] 문의 첨부 이미지 업로드 성공:", data.path);

  // Public URL 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  console.log("🔗 [storage] Public URL:", publicUrl);

  return publicUrl;
}
