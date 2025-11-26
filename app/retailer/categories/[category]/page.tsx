/**
 * @file app/retailer/categories/[category]/page.tsx
 * @description 소매점 카테고리별 상품 목록 페이지
 *
 * 주요 기능:
 * 1. 카테고리별 상품 표시
 * 2. 도매 정보 익명화
 *
 * @dependencies
 * - lib/supabase/queries/retailer-products.ts
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.SEARCH.01~04 요구사항
 */

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { getRetailerProducts } from "@/lib/supabase/queries/retailer-products";

// 카테고리 목록 (한글 카테고리명으로 매핑)
const categories: Record<string, { name: string; icon: string }> = {
  과일: { name: "과일", icon: "🍎" },
  채소: { name: "채소", icon: "🥬" },
  곡물: { name: "곡물", icon: "🌾" },
  견과류: { name: "견과류", icon: "🥜" },
  수산물: { name: "수산물", icon: "🐟" },
  기타: { name: "기타", icon: "📦" },
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const { category } = await params;
  const searchParamsData = await searchParams;

  // 카테고리 정보 가져오기
  const categoryInfo = categories[category] || categories["기타"];

  // 유효하지 않은 카테고리인 경우 기타로 리다이렉트
  if (!categories[category]) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <p className="text-gray-500 dark:text-gray-400">
          유효하지 않은 카테고리입니다.
        </p>
        <Link
          href="/retailer/products"
          className="mt-4 inline-block text-primary hover:underline"
        >
          전체 상품으로 돌아가기
        </Link>
      </div>
    );
  }

  // 쿼리 파라미터 파싱
  const page = parseInt(searchParamsData.page ?? "1", 10);
  const sortBy =
    (searchParamsData.sortBy as "created_at" | "price" | "standardized_name") ??
    "created_at";
  const sortOrder = (searchParamsData.sortOrder as "asc" | "desc") ?? "desc";

  console.log("🔍 [retailer-category-page] 카테고리 페이지 로드", {
    category,
    page,
    sortBy,
    sortOrder,
  });

  // 상품 목록 조회
  let productsData;
  try {
    productsData = await getRetailerProducts({
      page,
      pageSize: 12,
      sortBy,
      sortOrder,
      filter: {
        category: category,
      },
    });
  } catch (error) {
    console.error("❌ [retailer-category-page] 상품 목록 조회 실패:", error);
    productsData = {
      products: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
    };
  }

  const { products, total, totalPages } = productsData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 뒤로가기 */}
      <Link
        href="/retailer/products"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>전체 상품</span>
      </Link>

      {/* 헤더 */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{categoryInfo.icon}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {categoryInfo.name}
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          신선한 {categoryInfo.name} 상품을 만나보세요
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          총 {total.toLocaleString()}개의 상품이 있습니다.
        </p>
      </div>

      {/* 정렬 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link
            href={`/retailer/categories/${category}?sortBy=created_at&sortOrder=desc`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sortBy === "created_at" && sortOrder === "desc"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            최신순
          </Link>
          <Link
            href={`/retailer/categories/${category}?sortBy=price&sortOrder=asc`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sortBy === "price" && sortOrder === "asc"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            낮은 가격순
          </Link>
          <Link
            href={`/retailer/categories/${category}?sortBy=price&sortOrder=desc`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sortBy === "price" && sortOrder === "desc"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            높은 가격순
          </Link>
          <Link
            href={`/retailer/categories/${category}?sortBy=standardized_name&sortOrder=asc`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sortBy === "standardized_name" && sortOrder === "asc"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            이름순
          </Link>
        </div>
      </div>

      {/* 상품 그리드 */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                {/* 이미지 영역 */}
                <Link href={`/retailer/products/${product.id}`}>
                  <div className="relative aspect-square w-full overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.standardized_name || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">이미지 없음</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* 상품 정보 */}
                <div className="flex flex-col p-4 gap-3">
                  {/* 판매자 정보 (익명화) */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.wholesaler_anonymous_code} · {product.wholesaler_region}
                  </p>

                  {/* 상품명 (AI 표준화된 이름 우선 표시) */}
                  <Link href={`/retailer/products/${product.id}`}>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-primary transition-colors">
                      {product.standardized_name || product.name}
                    </h3>
                  </Link>

                  {/* 규격 */}
                  {product.specification && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.specification}
                    </p>
                  )}

                  {/* 가격 및 재고 */}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {product.price.toLocaleString()}원
                      </p>
                      {product.stock_quantity !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          재고: {product.stock_quantity > 0 ? `${product.stock_quantity}개` : "품절"}
                        </p>
                      )}
                    </div>
                    {product.moq > 1 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        최소 {product.moq}개
                      </p>
                    )}
                  </div>

                  {/* 장바구니 버튼 */}
                  <Link
                    href={`/retailer/products/${product.id}`}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>장바구니 담기</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/retailer/categories/${category}?page=${page - 1}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  이전
                </Link>
              )}
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/retailer/categories/${category}?page=${page + 1}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  다음
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {categoryInfo.name} 카테고리에 상품이 없습니다.
          </p>
          <Link
            href="/retailer/products"
            className="mt-4 text-primary hover:underline"
          >
            전체 상품으로 돌아가기
          </Link>
        </div>
      )}
    </div>
  );
}
