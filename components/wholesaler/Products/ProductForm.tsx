/**
 * @file ProductForm.tsx
 * @description 상품 등록/수정 폼 컴포넌트
 *
 * 도매점 상품 등록 및 수정을 위한 재사용 가능한 폼 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 상품 기본 정보 입력 (이름, 카테고리, 가격 등)
 * 2. 이미지 업로드 (드래그 앤 드롭, 최대 5개)
 * 3. 규격 정보 입력
 * 4. AI 표준화 버튼 (준비 중)
 * 5. 시세 참고 버튼 (준비 중)
 * 6. 등록/수정 모드 지원
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: zodResolver
 * - lib/validation/product.ts: 유효성 검증 스키마
 * - lib/supabase/storage.ts: 이미지 업로드 함수
 * - lib/supabase/clerk-client.ts: Supabase 클라이언트
 * - components/ui: shadcn/ui 컴포넌트들
 * - sonner: 토스트 알림
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  TrendingUp,
  ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { productSchema, type ProductFormData } from "@/lib/validation/product";
import { CATEGORIES, DELIVERY_METHODS, UNITS } from "@/lib/utils/constants";
import { uploadProductImage, deleteProductImage } from "@/lib/supabase/storage";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { Product } from "@/types/product";
import type { StandardizeResult } from "@/lib/api/ai-standardize";
import Image from "next/image";
import MarketPriceModal from "@/components/wholesaler/MarketPrices/MarketPriceModal";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
}

/**
 * specification에서 unit과 value 분리
 * 예: "10kg" → { value: "10", unit: "kg" }
 * 예: "1박스 (10kg)" → { value: "1박스 (10kg)", unit: "ea" } (복잡한 경우 그대로 유지)
 */
function parseSpecification(specification: string | null): {
  value: string;
  unit: string;
} {
  if (!specification) {
    return { value: "", unit: "ea" };
  }

  // UNITS 목록을 길이 순으로 정렬 (긴 단위부터 매칭)
  const sortedUnits = [...UNITS].sort((a, b) => b.length - a.length);

  // 단위로 끝나는지 확인
  for (const unit of sortedUnits) {
    if (specification.endsWith(unit)) {
      const value = specification.slice(0, -unit.length).trim();
      return { value, unit };
    }
  }

  // 단위를 찾지 못한 경우 그대로 반환
  return { value: specification, unit: "ea" };
}

export default function ProductForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set(),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 표준화 관련 상태
  const [isStandardizing, setIsStandardizing] = useState(false);
  const [standardizeDialogOpen, setStandardizeDialogOpen] = useState(false);
  const [standardizeResult, setStandardizeResult] =
    useState<StandardizeResult | null>(null);

  // 시세조회 모달 상태
  const [marketPriceModalOpen, setMarketPriceModalOpen] = useState(false);

  // specification 파싱 (수정 모드)
  const parsedSpec = initialData
    ? parseSpecification(initialData.specification)
    : { value: "", unit: "ea" };

  // 이미지 URL 배열 (수정 모드: 기존 이미지, 등록 모드: 빈 배열)
  const initialImages = initialData?.image_url ? [initialData.image_url] : [];

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      moq: initialData?.moq || 1,
      stock: initialData?.stock_quantity || 0,
      unit: parsedSpec.unit,
      specification_value: parsedSpec.value,
      delivery_fee: initialData?.shipping_fee || 0,
      delivery_method: initialData?.delivery_method || "courier",
      lead_time: initialData?.specification || "",
      specifications: {
        weight: "",
        size: "",
        origin: "",
        storage: "",
      },
      images: initialImages,
    },
  });

  const watchedImages = form.watch("images") || [];

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      const currentImages = form.getValues("images") || [];
      if (currentImages.length + files.length > 5) {
        toast.error("이미지는 최대 5개까지 업로드할 수 있습니다.");
        return;
      }

      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(async (file, index) => {
        const imageIndex = currentImages.length + index;
        setUploadingImages((prev) => new Set(prev).add(imageIndex));

        try {
          console.log("📤 [ProductForm] 이미지 업로드 시작:", file.name);
          const url = await uploadProductImage(file, user.id, supabase);
          console.log("✅ [ProductForm] 이미지 업로드 성공:", url);

          const currentImages = form.getValues("images") || [];
          form.setValue("images", [...currentImages, url], {
            shouldValidate: true,
          });

          toast.success(`${file.name} 업로드 완료`);
        } catch (error) {
          console.error("❌ [ProductForm] 이미지 업로드 실패:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : `${file.name} 업로드에 실패했습니다.`,
          );
        } finally {
          setUploadingImages((prev) => {
            const next = new Set(prev);
            next.delete(imageIndex);
            return next;
          });
        }
      });

      await Promise.all(uploadPromises);
    },
    [user, supabase, form],
  );

  // 이미지 삭제 핸들러
  const handleImageDelete = useCallback(
    async (index: number) => {
      const currentImages = form.getValues("images") || [];
      const imageUrl = currentImages[index];

      if (!imageUrl) return;

      try {
        // Storage에서 삭제 (새로 업로드한 이미지만)
        if (imageUrl.includes("/storage/v1/object/public/")) {
          console.log("🗑️ [ProductForm] 이미지 삭제 시작:", imageUrl);
          await deleteProductImage(imageUrl, supabase);
          console.log("✅ [ProductForm] 이미지 삭제 성공");
        }

        // 폼에서 제거
        const newImages = currentImages.filter((_, i) => i !== index);
        form.setValue("images", newImages, { shouldValidate: true });
        toast.success("이미지가 삭제되었습니다.");
      } catch (error) {
        console.error("❌ [ProductForm] 이미지 삭제 실패:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "이미지 삭제에 실패했습니다.",
        );
      }
    },
    [supabase, form],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload],
  );

  // AI 표준화 핸들러
  const handleStandardize = async () => {
    const currentName = form.getValues("name");

    if (!currentName || !currentName.trim()) {
      toast.error("상품명을 먼저 입력해주세요.");
      return;
    }

    setIsStandardizing(true);
    setStandardizeResult(null);

    try {
      console.group("🤖 [ProductForm] AI 표준화 시작");
      console.log("상품명:", currentName);

      const response = await fetch("/api/ai/standardize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productName: currentName }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ [ProductForm] 표준화 실패:", data);
        throw new Error(data.error || "표준화에 실패했습니다.");
      }

      if (data.success && data.data) {
        console.log("✅ [ProductForm] 표준화 성공:", data.data);
        setStandardizeResult(data.data);
        setStandardizeDialogOpen(true);
      } else {
        throw new Error("표준화 결과를 받지 못했습니다.");
      }
    } catch (error) {
      console.error("❌ [ProductForm] 표준화 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "AI 표준화 중 오류가 발생했습니다.",
      );
    } finally {
      setIsStandardizing(false);
      console.groupEnd();
    }
  };

  // 표준화 결과 적용 핸들러
  const handleAcceptStandardize = () => {
    if (!standardizeResult) return;

    console.log("✅ [ProductForm] 표준화 결과 적용:", standardizeResult);

    // 상품명 업데이트
    form.setValue("name", standardizeResult.standardizedName, {
      shouldValidate: true,
    });

    // 카테고리 업데이트 (추천 카테고리가 유효한 경우 항상 적용)
    console.log("🔍 [ProductForm] 카테고리 체크 시작");
    console.log("  - 추천 카테고리:", standardizeResult.suggestedCategory);
    console.log("  - 유효한 카테고리 목록:", CATEGORIES);
    
    if (
      standardizeResult.suggestedCategory &&
      CATEGORIES.includes(standardizeResult.suggestedCategory as any)
    ) {
      console.log("✅ [ProductForm] 추천 카테고리 적용:", standardizeResult.suggestedCategory);
      form.setValue("category", standardizeResult.suggestedCategory, {
        shouldValidate: true,
      });
      console.log("✅ [ProductForm] 카테고리 setValue 완료");
    } else if (standardizeResult.suggestedCategory) {
      console.warn("⚠️ [ProductForm] 추천 카테고리가 유효하지 않음:", {
        suggested: standardizeResult.suggestedCategory,
        validCategories: CATEGORIES,
        isIncluded: CATEGORIES.includes(standardizeResult.suggestedCategory as any),
      });
    } else {
      console.warn("⚠️ [ProductForm] 추천 카테고리가 없음");
    }

    // 단위 업데이트 (추천 단위가 유효한 경우 항상 적용)
    console.log("🔍 [ProductForm] 단위 체크 시작");
    console.log("  - 추천 단위:", standardizeResult.suggestedUnit);
    console.log("  - 유효한 단위 목록:", UNITS);
    
    if (
      standardizeResult.suggestedUnit &&
      UNITS.includes(standardizeResult.suggestedUnit as any)
    ) {
      console.log("✅ [ProductForm] 추천 단위 적용:", standardizeResult.suggestedUnit);
      form.setValue("unit", standardizeResult.suggestedUnit, {
        shouldValidate: true,
      });
      console.log("✅ [ProductForm] 단위 setValue 완료");
    } else if (standardizeResult.suggestedUnit) {
      console.warn("⚠️ [ProductForm] 추천 단위가 유효하지 않음:", {
        suggested: standardizeResult.suggestedUnit,
        validUnits: UNITS,
        isIncluded: UNITS.includes(standardizeResult.suggestedUnit as any),
      });
    }

    setStandardizeDialogOpen(false);
    toast.success("표준화된 상품명, 카테고리, 단위가 적용되었습니다.");
  };

  // 폼 제출 핸들러
  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      console.log("📝 [ProductForm] 폼 제출 시작:", {
        mode,
        data: { ...data, images: data.images?.length || 0 },
      });

      // onSubmit 콜백 호출
      // 부모 컴포넌트에서 specification_value와 unit을 받아서
      // combineSpecification() 함수를 사용하여 specification을 생성할 수 있습니다.
      await onSubmit(data);

      console.log("✅ [ProductForm] 폼 제출 성공");
    } catch (error) {
      console.error("❌ [ProductForm] 폼 제출 실패:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "상품 저장 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "상품 등록" : "상품 수정"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "새로운 상품 정보를 입력해주세요."
            : "상품 정보를 수정해주세요."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // 엔터키로 제출되는 것을 막음
            }}
            className="space-y-6"
          >
            {/* 상품명 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상품명 *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input
                        placeholder="예: 고당도 설향 딸기"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="md:size-auto md:px-3 md:gap-2"
                      onClick={handleStandardize}
                      disabled={isSubmitting || isStandardizing}
                      title="AI 표준화"
                    >
                      {isStandardizing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span className="hidden md:inline">AI 표준화</span>
                    </Button>
                  </div>
                  <FormDescription>
                    💡 AI 표준화를 사용하면 검색 최적화된 상품명으로 자동
                    변환됩니다
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 카테고리 */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 가격 */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>가격 (원) *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="1"
                        {...field}
                        value={field.value === 0 ? "" : field.value ?? ""}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // 빈 문자열이면 빈 문자열로 유지 (입력 중에는 허용)
                          if (inputValue === "") {
                            field.onChange("");
                            return;
                          }
                          const value = parseInt(inputValue, 10);
                          // 유효한 숫자만 업데이트
                          if (!isNaN(value) && value >= 0) {
                            field.onChange(value);
                          }
                        }}
                        onBlur={(e) => {
                          // 포커스를 잃을 때만 기본값 적용
                          const inputValue = e.target.value;
                          if (
                            inputValue === "" ||
                            inputValue === null ||
                            inputValue === undefined
                          ) {
                            field.onChange(0);
                          } else {
                            const value = parseInt(inputValue, 10);
                            const safeValue = isNaN(value)
                              ? 0
                              : Math.max(0, value);
                            field.onChange(safeValue);
                          }
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="md:size-auto md:px-3 md:gap-2"
                      onClick={() => {
                        setMarketPriceModalOpen(true);
                      }}
                      disabled={isSubmitting}
                      title="시세 참고"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span className="hidden md:inline">시세조회</span>
                    </Button>
                  </div>
                  <FormDescription>
                    상품 가격을 입력하세요. 시세 참고 버튼을 클릭하면 현재 시장
                    가격을 확인할 수 있습니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 최소주문수량 */}
            <FormField
              control={form.control}
              name="moq"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최소주문수량 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      step="1"
                      {...field}
                      value={field.value === 1 ? "" : field.value ?? ""}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // 빈 문자열이면 빈 문자열로 유지 (입력 중에는 허용)
                        if (inputValue === "") {
                          field.onChange("");
                          return;
                        }
                        const value = parseInt(inputValue, 10);
                        // 유효한 숫자만 업데이트
                        if (!isNaN(value) && value >= 1) {
                          field.onChange(value);
                        }
                      }}
                      onBlur={(e) => {
                        // 포커스를 잃을 때만 기본값 적용
                        const inputValue = e.target.value;
                        if (
                          inputValue === "" ||
                          inputValue === null ||
                          inputValue === undefined
                        ) {
                          field.onChange(1);
                        } else {
                          const value = parseInt(inputValue, 10);
                          const safeValue = isNaN(value)
                            ? 1
                            : Math.max(1, value);
                          field.onChange(safeValue);
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    최소 주문 가능한 수량을 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 재고 */}
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>재고 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="1"
                      {...field}
                      value={field.value === 0 ? "" : field.value ?? ""}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // 빈 문자열이면 빈 문자열로 유지 (입력 중에는 허용)
                        if (inputValue === "") {
                          field.onChange("");
                          return;
                        }
                        const value = parseInt(inputValue, 10);
                        // 유효한 숫자만 업데이트
                        if (!isNaN(value) && value >= 0) {
                          field.onChange(value);
                        }
                      }}
                      onBlur={(e) => {
                        // 포커스를 잃을 때만 기본값 적용
                        const inputValue = e.target.value;
                        if (
                          inputValue === "" ||
                          inputValue === null ||
                          inputValue === undefined
                        ) {
                          field.onChange(0);
                        } else {
                          const value = parseInt(inputValue, 10);
                          const safeValue = isNaN(value)
                            ? 0
                            : Math.max(0, value);
                          field.onChange(safeValue);
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    현재 재고 수량을 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 단위 및 규격 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>단위 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="단위 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specification_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>규격 값</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 10"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      단위와 함께 저장됩니다 (예: 10kg)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 배송비 */}
            <FormField
              control={form.control}
              name="delivery_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>배송비 (원) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="1"
                      {...field}
                      value={field.value === 0 ? "" : field.value ?? ""}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // 빈 문자열이면 빈 문자열로 유지 (입력 중에는 허용)
                        if (inputValue === "") {
                          field.onChange("");
                          return;
                        }
                        const value = parseInt(inputValue, 10);
                        // 유효한 숫자만 업데이트
                        if (!isNaN(value) && value >= 0) {
                          field.onChange(value);
                        }
                      }}
                      onBlur={(e) => {
                        // 포커스를 잃을 때만 기본값 적용
                        const inputValue = e.target.value;
                        if (
                          inputValue === "" ||
                          inputValue === null ||
                          inputValue === undefined
                        ) {
                          field.onChange(0);
                        } else {
                          const value = parseInt(inputValue, 10);
                          const safeValue = isNaN(value)
                            ? 0
                            : Math.max(0, value);
                          field.onChange(safeValue);
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>배송비를 입력하세요.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 배송 방법 */}
            <FormField
              control={form.control}
              name="delivery_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>배송 방법 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="배송 방법 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DELIVERY_METHODS).map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 납기 */}
            <FormField
              control={form.control}
              name="lead_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>납기</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 익일배송, 2-3일"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    배송 소요 기간을 입력하세요 (선택사항).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 상품 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상품 설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="상품에 대한 상세 설명을 입력하세요..."
                      rows={4}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    상품의 특징, 사용법 등을 자세히 설명해주세요 (선택사항).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 이미지 업로드 */}
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>상품 이미지 (최대 5개)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* 드래그 앤 드롭 영역 */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          disabled={isSubmitting}
                        />
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          이미지를 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPG, PNG, WEBP (최대 5MB, 최대 5개)
                        </p>
                      </div>

                      {/* 이미지 미리보기 */}
                      {watchedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {watchedImages.map((url, index) => (
                            <div
                              key={index}
                              className="relative aspect-square rounded-lg overflow-hidden border"
                            >
                              {uploadingImages.has(index) ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                              ) : (
                                <>
                                  <Image
                                    src={url}
                                    alt={`상품 이미지 ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleImageDelete(index);
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {watchedImages.length === 0 && (
                        <div className="flex items-center justify-center p-8 border border-dashed rounded-lg text-gray-400">
                          <ImageIcon className="h-8 w-8 mr-2" />
                          <span className="text-sm">이미지가 없습니다</span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    상품 이미지를 업로드하세요. 최대 5개까지 업로드할 수
                    있습니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 규격 정보 */}
            <div className="space-y-4">
              <FormLabel>규격 정보 (선택사항)</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specifications.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>무게</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 1kg"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications.size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>크기</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 10cm x 10cm"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications.origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>원산지</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 국내산"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications.storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>보관방법</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 냉장보관"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-4 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
              )}
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  form.handleSubmit(handleSubmit)();
                }}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "등록하기" : "수정하기"}
              </Button>
            </div>
          </form>
        </Form>

        {/* AI 표준화 결과 모달 */}
        <Dialog
          open={standardizeDialogOpen}
          onOpenChange={setStandardizeDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>AI 표준화 결과</DialogTitle>
              <DialogDescription>
                상품명을 표준화하여 검색 최적화를 개선했습니다.
              </DialogDescription>
            </DialogHeader>

            {standardizeResult && (
              <div className="space-y-6 py-4">
                {/* 원본 상품명 */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    원본 상품명
                  </label>
                  <p className="mt-1 text-base text-gray-900">
                    {standardizeResult.originalName}
                  </p>
                </div>

                {/* 표준화된 상품명 */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    표준화된 상품명
                  </label>
                  <p className="mt-1 text-lg font-semibold text-blue-600">
                    {standardizeResult.standardizedName}
                  </p>
                </div>

                {/* 추천 카테고리 */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    추천 카테고리
                  </label>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm">
                      {standardizeResult.suggestedCategory}
                    </Badge>
                  </div>
                </div>

                {/* 추천 단위 */}
                {standardizeResult.suggestedUnit && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      추천 단위
                    </label>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-sm">
                        {standardizeResult.suggestedUnit}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* 검색 키워드 */}
                {standardizeResult.keywords.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      검색 키워드
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {standardizeResult.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-sm"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 신뢰도 */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    신뢰도
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {Math.round(standardizeResult.confidence * 100)}%
                      </span>
                      {standardizeResult.confidence < 0.8 && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">
                            신뢰도가 낮습니다. 수동으로 확인해주세요.
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          standardizeResult.confidence >= 0.8
                            ? "bg-green-500"
                            : standardizeResult.confidence >= 0.6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${standardizeResult.confidence * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStandardizeDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={handleAcceptStandardize}
                disabled={!standardizeResult}
              >
                <Check className="mr-2 h-4 w-4" />
                적용하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 시세조회 모달 */}
        <MarketPriceModal
          open={marketPriceModalOpen}
          onOpenChange={setMarketPriceModalOpen}
          initialItemName={form.watch("name") || ""}
        />
      </CardContent>
    </Card>
  );
}
