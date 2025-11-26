/**
 * @file components/retailer/command-palette.tsx
 * @description Command Palette 컴포넌트 (R.SEARCH.01)
 *
 * Cmd+K (또는 Ctrl+K) 단축키로 열리는 통합 검색 인터페이스입니다.
 * 상품명 검색, 카테고리 필터, 주문 내역 검색을 지원합니다.
 *
 * @dependencies
 * - cmdk: Command Menu 컴포넌트 라이브러리
 * - lib/supabase/queries/retailer-products.ts
 * - types/product.ts
 * - types/order.ts
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import { Search, Package, ShoppingBag, Sparkles } from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

/**
 * Command Palette 컴포넌트
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useClerkSupabaseClient();

  // Cmd+K 또는 Ctrl+K 단축키 등록
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 검색어 변경 시 상품 및 주문 검색
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setOrders([]);
      return;
    }

    const searchProductsAndOrders = async () => {
      setIsLoading(true);
      try {
        // 상품 검색
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(
            `
            *,
            wholesalers!inner (
              anonymous_code,
              address
            )
          `
          )
          .eq("is_active", true)
          .or(
            `standardized_name.ilike.%${searchQuery}%,original_name.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
          )
          .limit(5);

        if (productsError) {
          console.error("❌ [command-palette] 상품 검색 오류:", productsError);
        } else {
          // 데이터 변환: 익명화된 도매 정보 포함
          const transformedProducts = (productsData || []).map((item: any) => {
            const wholesaler = Array.isArray(item.wholesalers)
              ? item.wholesalers[0]
              : item.wholesalers;

            // 주소에서 시/구만 추출
            const addressParts = wholesaler?.address?.split(" ") || [];
            const region =
              addressParts.length >= 2
                ? `${addressParts[0]} ${addressParts[1]}`
                : wholesaler?.address || "";

            // delivery_options에서 새벽 배송 가능 여부 확인
            const deliveryOptions = item.delivery_options || {};
            const dawnDeliveryAvailable =
              deliveryOptions.dawn_delivery_available === true;

            return {
              ...item,
              wholesaler_anonymous_code: wholesaler?.anonymous_code || "Unknown",
              wholesaler_region: region,
              delivery_dawn_available: dawnDeliveryAvailable,
            };
          });
          setProducts(transformedProducts);
        }

        // TODO: 주문 내역 검색 (API 연동 필요)
        // const ordersData = await searchOrders({ search: searchQuery });
        // setOrders(ordersData.orders);
        setOrders([]); // 임시로 빈 배열
      } catch (error) {
        console.error("❌ [command-palette] 검색 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // 디바운스: 300ms 후 검색 실행
    const timeoutId = setTimeout(searchProductsAndOrders, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 상품 클릭 핸들러
  const handleProductClick = (productId: string) => {
    router.push(`/retailer/products/${productId}`);
    setOpen(false);
  };

  // 주문 클릭 핸들러
  const handleOrderClick = (orderId: string) => {
    router.push(`/retailer/orders/${orderId}`);
    setOpen(false);
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category: string) => {
    router.push(`/retailer/products?category=${encodeURIComponent(category)}`);
    setOpen(false);
  };

  // AI 질의 모드 클릭 핸들러 (Phase 5)
  const handleAiQueryClick = () => {
    // TODO: AI 질의 모드 구현 (Phase 5)
    console.log("🔮 [command-palette] AI 질의 모드 (Phase 5 예정)");
    setOpen(false);
  };

  // 카테고리 목록
  const categories = [
    { value: "과일", label: "과일" },
    { value: "채소", label: "채소" },
    { value: "곡물", label: "곡물" },
    { value: "견과류", label: "견과류" },
    { value: "수산물", label: "수산물" },
    { value: "기타", label: "기타" },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="상품명, 카테고리, 주문번호 검색..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? "검색 중..." : "검색 결과가 없습니다."}
        </CommandEmpty>

        {/* 카테고리 필터 */}
        {!searchQuery && (
          <>
            <CommandGroup heading="카테고리">
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  onSelect={() => handleCategoryClick(category.value)}
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-gray-500" />
                  <span>{category.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* 상품 검색 결과 */}
        {products.length > 0 && (
          <>
            <CommandGroup heading="상품">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleProductClick(product.id)}
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">
                      {product.standardized_name ||
                        product.original_name ||
                        product.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.price.toLocaleString()}원 ·{" "}
                      {product.wholesaler_anonymous_code}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* 주문 내역 검색 결과 */}
        {orders.length > 0 && (
          <>
            <CommandGroup heading="주문 내역">
              {orders.map((order) => (
                <CommandItem
                  key={order.id}
                  onSelect={() => handleOrderClick(order.id)}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{order.order_number}</span>
                    <span className="text-xs text-gray-500">
                      {order.order_date} · {order.total_price.toLocaleString()}원
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* AI 질의 모드 (Phase 5) */}
        {!searchQuery && (
          <CommandGroup heading="AI 기능">
            <CommandItem
              onSelect={handleAiQueryClick}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span>AI 질의 모드 (Phase 5 예정)</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

