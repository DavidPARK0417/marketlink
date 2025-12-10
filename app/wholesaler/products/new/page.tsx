/**
 * @file app/wholesaler/products/new/page.tsx
 * @description 상품 등록 페이지
 *
 * 도매점 상품을 등록하는 페이지입니다.
 *
 * 주요 기능:
 * 1. ProductForm 컴포넌트를 사용한 상품 등록 폼
 * 2. 이미지 업로드 처리
 * 3. products 테이블에 데이터 INSERT
 * 4. 성공 시 상품 목록 페이지로 리다이렉트
 *
 * @dependencies
 * - components/wholesaler/Products/ProductForm.tsx
 * - lib/supabase/clerk-client.ts
 * - lib/validation/product.ts
 * - types/product.ts
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import ProductForm from "@/components/wholesaler/Products/ProductForm";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { ProductFormData } from "@/lib/validation/product";
import PageHeader from "@/components/common/PageHeader";

/**
 * specification_value와 unit을 합쳐서 specification 생성
 * 예: "10" + "kg" → "10kg"
 */
function combineSpecification(
  value: string | undefined,
  unit: string | undefined,
): string | null {
  if (!value || !value.trim()) {
    return null;
  }
  const trimmedValue = value.trim();
  const trimmedUnit = unit?.trim() || "ea";
  return `${trimmedValue}${trimmedUnit}`;
}

/**
 * 상품 등록 페이지
 */
export default function NewProductPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useClerkSupabaseClient();
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  // wholesaler_id 조회
  useEffect(() => {
    const fetchWholesalerId = async () => {
      if (!isUserLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        console.group("🔍 [new-product-page] 도매점 ID 조회 시작");
        console.log("Clerk userId:", user.id);

        // 프로필 조회
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError || !profile) {
          console.error(
            "❌ [new-product-page] 프로필 조회 오류:",
            profileError,
          );
          toast.error("프로필 정보를 불러올 수 없습니다.");
          setIsLoading(false);
          return;
        }

        console.log("✅ [new-product-page] 프로필 조회 완료:", profile.id);

        if (profile.role === "admin") {
          console.warn(
            "⛔️ [new-product-page] 관리자 계정은 상품 등록을 사용할 수 없습니다.",
          );
          toast.error(
            "관리자 계정에서는 상품 등록을 할 수 없습니다. 도매점 계정으로 로그인해 주세요.",
          );
          setIsBlocked(true);
          setIsLoading(false);
          return;
        }

        // wholesaler 정보 조회
        const { data: wholesaler, error: wholesalerError } = await supabase
          .from("wholesalers")
          .select("id")
          .eq("profile_id", profile.id)
          .single();

        if (wholesalerError || !wholesaler) {
          console.error(
            "❌ [new-product-page] 도매점 정보 조회 오류:",
            wholesalerError,
          );
          toast.error("도매점 정보를 불러올 수 없습니다.");
          setIsLoading(false);
          return;
        }

        console.log(
          "✅ [new-product-page] 도매점 ID 조회 완료:",
          wholesaler.id,
        );
        setWholesalerId(wholesaler.id);
      } catch (error) {
        console.error("❌ [new-product-page] 도매점 ID 조회 예외:", error);
        toast.error("도매점 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    };

    fetchWholesalerId();
  }, [isUserLoaded, user, supabase]);

  // 폼 제출 핸들러
  const handleSubmit = async (data: ProductFormData) => {
    if (!wholesalerId) {
      toast.error("도매점 정보를 불러올 수 없습니다.");
      return;
    }

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      console.group("📝 [new-product-page] 상품 등록 시작");
      console.log("wholesaler_id:", wholesalerId);
      console.log("form data:", {
        ...data,
        images: data.images?.length || 0,
      });

      // specification 생성 (specification_value + unit)
      const specification = combineSpecification(
        data.specification_value,
        data.unit,
      );

      console.log("specification:", specification);

      // 이미지 URL (첫 번째 이미지만 저장, products 테이블은 단일 이미지만 지원)
      const images = data.images && data.images.length > 0 ? data.images : [];
      const imageUrl = images.length > 0 ? images[0] : null;

      console.log("image_url:", imageUrl);

      // products 테이블에 INSERT
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          wholesaler_id: wholesalerId,
          name: data.name,
          category: data.category,
          specification: specification,
          description: data.description || null,
          price: data.price,
          moq: data.moq,
          shipping_fee: data.delivery_fee,
          delivery_method: data.delivery_method,
          stock_quantity: data.stock,
          images,
          image_url: imageUrl, // 호환용(리스트/주문 등 단일 이미지 표시)
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ [new-product-page] 상품 등록 실패:", error);
        throw new Error(
          error.message || "상품 등록 중 오류가 발생했습니다.",
        );
      }

      console.log("✅ [new-product-page] 상품 등록 성공:", product);
      console.groupEnd();

      // 성공 토스트 알림
      toast.success("상품이 성공적으로 등록되었습니다.");

      // 상품 목록 페이지로 리다이렉트
      router.push("/wholesaler/products");
    } catch (error) {
      console.error("❌ [new-product-page] 상품 등록 예외:", error);
      console.groupEnd();

      // 에러는 ProductForm에서 이미 처리하므로 여기서는 추가 처리 불필요
      // 하지만 명확성을 위해 다시 throw
      throw error;
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.push("/wholesaler/products");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="상품 등록"
          description="새로운 상품을 등록하세요."
        />
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isBlocked || !wholesalerId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="상품 등록"
          description="새로운 상품을 등록하세요."
        />
        <div className="flex items-center justify-center p-12">
          <div className="w-full max-w-xl space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              상품 등록이 제한되었습니다.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              관리자 계정에서는 상품 등록을 할 수 없습니다. 도매점 계정으로 로그인해 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="상품 등록"
        description="새로운 상품을 등록하세요."
      />

      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

