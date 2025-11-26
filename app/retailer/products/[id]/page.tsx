/**
 * @file app/retailer/products/[id]/page.tsx
 * @description 소매점 상품 상세 페이지
 *
 * 주요 기능:
 * 1. 상품 상세 정보 표시
 * 2. 도매 정보 익명화 (R.SEARCH.04)
 * 3. 장바구니 추가 (R.SEARCH.05)
 * 4. 수량 선택
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.SEARCH.04, R.SEARCH.05 요구사항
 */

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShoppingCart, Truck, Package } from "lucide-react";
import { ProductDetailTabs } from "./product-detail-tabs";

// 임시 목 데이터
const mockProduct = {
  id: "1",
  name: "고당도 설향 딸기",
  standardized_name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
  category: "과일",
  specification: "1kg",
  description:
    "GAP 인증을 받은 고랭지에서 재배한 프리미엄 설향 딸기입니다. 당도가 높고 향이 풍부하여 디저트나 생과로 드시기에 적합합니다.",
  price: 15900,
  moq: 1,
  shipping_fee: 3000,
  delivery_method: "courier",
  stock_quantity: 50,
  image_url: "/strawberry.jpg",
  anonymous_seller_id: "Partner #F2B-01",
  seller_region: "경기도 양평군",
  is_seasonal: true,
  delivery_dawn_available: true,
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 뒤로가기 */}
      <Link
        href="/retailer/products"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>상품 목록으로</span>
      </Link>

      {/* 상품 상세 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* 왼쪽: 이미지 */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
            <Image
              src={mockProduct.image_url}
              alt={mockProduct.standardized_name}
              fill
              className="object-cover"
              priority
            />
            {/* 배지 */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {mockProduct.is_seasonal && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  제철 농산물
                </span>
              )}
              {mockProduct.delivery_dawn_available && (
                <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                  새벽배송 가능
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 정보 */}
        <div className="flex flex-col gap-6">
          {/* 판매자 정보 */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Package className="w-4 h-4" />
            <span>
              {mockProduct.anonymous_seller_id} · {mockProduct.seller_region}
            </span>
          </div>

          {/* 상품명 */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {mockProduct.standardized_name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {mockProduct.category} · {mockProduct.specification}
            </p>
          </div>

          {/* 설명 */}
          <p className="text-gray-700 dark:text-gray-300">
            {mockProduct.description}
          </p>

          {/* 구분선 */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* 가격 정보 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {mockProduct.price.toLocaleString()}원
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                / {mockProduct.specification}
              </span>
            </div>
            {mockProduct.moq > 1 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                최소 주문 수량: {mockProduct.moq}개
              </p>
            )}
          </div>

          {/* 배송 정보 */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                배송비: {mockProduct.shipping_fee.toLocaleString()}원
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {mockProduct.delivery_dawn_available
                  ? "새벽 배송 가능 (다음날 오전 7시 전 도착)"
                  : "일반 배송 (2-3일 소요)"}
              </p>
            </div>
          </div>

          {/* 수량 선택 */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              수량
            </label>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                -
              </button>
              <input
                type="number"
                min={mockProduct.moq}
                defaultValue={mockProduct.moq}
                className="w-20 h-10 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <button className="flex items-center justify-center w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                +
              </button>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span>장바구니 담기</span>
            </button>
            <button className="flex-1 px-6 py-4 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-bold rounded-lg transition-colors">
              바로 구매
            </button>
          </div>
        </div>
      </div>

      {/* 추가 정보 탭 */}
      <ProductDetailTabs product={mockProduct} />
    </div>
  );
}

