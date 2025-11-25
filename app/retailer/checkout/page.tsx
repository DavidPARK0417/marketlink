/**
 * @file app/retailer/checkout/page.tsx
 * @description 소매점 주문/결제 페이지
 *
 * 주요 기능:
 * 1. 배송 옵션 선택 (R.ORDER.01)
 * 2. 배송 시간 지정 (R.ORDER.02)
 * 3. Toss Payments 연동 (R.ORDER.03)
 * 4. 수취인 플랫폼 (R.ORDER.04)
 * 5. 데이터 무결성 (R.ORDER.05)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.ORDER.01~05 요구사항
 */

import Image from "next/image";
import { Clock, Package, CreditCard } from "lucide-react";

// 임시 목 데이터
const mockOrderItems = [
  {
    id: "1",
    product_name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
    product_image: "/strawberry.jpg",
    quantity: 2,
    price: 15900,
  },
  {
    id: "2",
    product_name: "노르웨이 생연어 필렛 500g",
    product_image: "/salmon.jpg",
    quantity: 1,
    price: 22000,
  },
];

const mockUserInfo = {
  name: "김소매",
  phone: "010-1234-5678",
  address: "서울특별시 강남구 테헤란로 427",
  addressDetail: "위워크타워 10층",
};

export default function CheckoutPage() {
  const totalProductPrice = mockOrderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalShippingFee = 3000;
  const totalPrice = totalProductPrice + totalShippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          주문/결제
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 주문 정보 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 배송 정보 */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                배송 정보
              </h2>
              <button className="text-sm text-green-600 dark:text-green-400 font-medium hover:underline">
                변경
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="text-gray-600 dark:text-gray-400">
                  받는 분
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {mockUserInfo.name}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="text-gray-600 dark:text-gray-400">
                  연락처
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {mockUserInfo.phone}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="text-gray-600 dark:text-gray-400">주소</span>
                <div className="text-gray-900 dark:text-gray-100">
                  <p>{mockUserInfo.address}</p>
                  <p>{mockUserInfo.addressDetail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 배송 옵션 */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              배송 옵션
            </h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-green-600 rounded-lg cursor-pointer bg-green-50 dark:bg-green-900/20">
                <input
                  type="radio"
                  name="delivery-option"
                  defaultChecked
                  className="mt-0.5 w-5 h-5 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      새벽 배송
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    다음날 오전 7시 전 도착 (+5,000원)
                  </p>
                  {/* 시간 선택 */}
                  <select className="mt-3 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
                    <option>오전 6:00 ~ 7:00</option>
                    <option>오전 7:00 ~ 8:00</option>
                  </select>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <input
                  type="radio"
                  name="delivery-option"
                  className="mt-0.5 w-5 h-5 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      일반 배송
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    2-3일 소요 (무료)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 배송 요청사항 */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              배송 요청사항
            </h2>
            <textarea
              placeholder="배송 기사님께 전달할 요청사항을 입력해주세요."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 주문 상품 */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              주문 상품
            </h2>

            <div className="space-y-4">
              {mockOrderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      수량: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 결제 정보 (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* 최종 결제 금액 */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                최종 결제 금액
              </h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    총 상품 금액
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
                    총 결제 예정 금액
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 결제 수단 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                  결제 수단
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border-2 border-green-600 rounded-lg cursor-pointer bg-green-50 dark:bg-green-900/20">
                    <input
                      type="radio"
                      name="payment-method"
                      defaultChecked
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      토스페이먼츠
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="radio"
                      name="payment-method"
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      신용/체크카드
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="radio"
                      name="payment-method"
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      계좌이체
                    </span>
                  </label>
                </div>
              </div>

              <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
                {totalPrice.toLocaleString()}원 결제하기
              </button>

              <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
                수취인: Farm to Biz (플랫폼)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

