/**
 * @file app/retailer/cart/page.tsx
 * @description 소매점 장바구니 페이지
 *
 * 주요 기능:
 * 1. 장바구니 상품 목록 관리 (R.CART.01)
 * 2. 수량/삭제 수정 (R.CART.02)
 * 3. 예상 총합계 (R.CART.03)
 * 4. 주문하기 이동 (R.CART.04)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.CART.01~04 요구사항
 */

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

// 임시 목 데이터
const mockCartItems = [
  {
    id: "1",
    product_id: "1",
    product_name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
    product_image: "/strawberry.jpg",
    anonymous_seller_id: "Partner #F2B-01",
    seller_region: "경기도 양평군",
    price: 15900,
    quantity: 2,
    specification: "1kg",
    shipping_fee: 3000,
  },
  {
    id: "2",
    product_id: "2",
    product_name: "노르웨이 생연어 필렛 500g",
    product_image: "/salmon.jpg",
    anonymous_seller_id: "Partner #F2B-02",
    seller_region: "부산시 해운대구",
    price: 22000,
    quantity: 1,
    specification: "500g",
    shipping_fee: 5000,
  },
  {
    id: "3",
    product_id: "3",
    product_name: "무농약 아스파라거스 1단",
    product_image: "/asparagus.png",
    anonymous_seller_id: "Partner #F2B-03",
    seller_region: "충청남도 논산시",
    price: 4500,
    quantity: 4,
    specification: "1단",
    shipping_fee: 3000,
  },
];

export default function CartPage() {
  // 계산
  const totalProductPrice = mockCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalShippingFee = mockCartItems.reduce(
    (sum, item) => sum + item.shipping_fee,
    0
  );
  const totalPrice = totalProductPrice + totalShippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          장바구니
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {mockCartItems.length}개 상품
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 장바구니 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 전체 선택 */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                전체 선택 ({mockCartItems.length}/{mockCartItems.length})
              </span>
            </label>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500">
              선택 삭제
            </button>
          </div>

          {/* 상품 목록 */}
          {mockCartItems.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 체크박스 및 이미지 */}
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 flex-shrink-0"
                  />

                  {/* 이미지 */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  {/* 판매자 */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.anonymous_seller_id} · {item.seller_region}
                  </p>

                  {/* 상품명 */}
                  <Link
                    href={`/retailer/products/${item.product_id}`}
                    className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 line-clamp-2"
                  >
                    {item.product_name}
                  </Link>

                  {/* 규격 */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.specification}
                  </p>

                  {/* 수량 조절 및 가격 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
                    {/* 수량 조절 */}
                    <div className="flex items-center gap-2">
                      <button className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        readOnly
                        className="w-12 h-8 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                      <button className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 가격 */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                      <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 오른쪽: 주문 요약 (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              주문 요약
            </h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  상품 금액
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {totalProductPrice.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  배송비
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {totalShippingFee.toLocaleString()}원
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-base font-bold">
                <span className="text-gray-900 dark:text-gray-100">
                  총 결제 예상 금액
                </span>
                <span className="text-green-600 dark:text-green-400">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <Link
              href="/retailer/checkout"
              className="flex items-center justify-center gap-2 w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>주문하기</span>
            </Link>

            <Link
              href="/retailer/products"
              className="block text-center mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

