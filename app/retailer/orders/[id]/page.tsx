/**
 * @file app/retailer/orders/[id]/page.tsx
 * @description 소매점 주문 상세 페이지
 *
 * 주요 기능:
 * 1. 주문 정보 요약 (R.MY.01)
 * 2. 배송 타임라인 UI (R.MY.02)
 * 3. 구매 확정 버튼 (R.MY.03)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.MY.01~03 요구사항
 */

import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Phone,
} from "lucide-react";

// 임시 목 데이터 (추후 API로 교체 예정)
const mockOrderDetail = {
  id: "1",
  order_number: "20241125-0001",
  order_date: "2024-11-25",
  status: "delivered",
  status_label: "배송 완료",
  delivery_method: "새벽 배송",
  delivery_scheduled_time: "2024-11-26 오전 7시",
  products: [
    {
      id: "p1",
      name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
      image_url: "/strawberry.jpg",
      quantity: 2,
      unit_price: 15900,
      subtotal: 31800,
      anonymous_seller_id: "Partner #F2B-01",
      seller_region: "경기도 양평군",
    },
  ],
  delivery_info: {
    recipient_name: "홍길동",
    phone: "010-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    address_detail: "1층 과일가게",
    request: "문 앞에 놓아주세요",
  },
  payment_info: {
    method: "신용카드",
    card_name: "삼성카드",
    card_number: "1234-****-****-5678",
    paid_at: "2024-11-25 10:30",
  },
  price_info: {
    product_total: 31800,
    shipping_fee: 4000,
    total: 35800,
  },
  timeline: [
    {
      status: "ordered",
      label: "주문 접수",
      timestamp: "2024-11-25 10:30",
      completed: true,
    },
    {
      status: "confirmed",
      label: "주문 확인",
      timestamp: "2024-11-25 11:00",
      completed: true,
    },
    {
      status: "preparing",
      label: "상품 준비 중",
      timestamp: "2024-11-25 14:00",
      completed: true,
    },
    {
      status: "shipping",
      label: "배송 중",
      timestamp: "2024-11-26 04:00",
      completed: true,
    },
    {
      status: "delivered",
      label: "배송 완료",
      timestamp: "2024-11-26 06:45",
      completed: true,
    },
  ],
};

const statusColors = {
  preparing:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  shipping:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 실제 구현 시 API에서 주문 정보를 가져옴
  const order = mockOrderDetail;

  console.log("📦 [order-detail] 주문 상세 조회:", { orderId: id });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 뒤로가기 버튼 */}
      <Link
        href="/retailer/orders"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>주문 내역으로 돌아가기</span>
      </Link>

      {/* 주문 헤더 */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              주문 상세
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              주문번호: {order.order_number}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors]}`}
          >
            {order.status_label}
          </span>
        </div>
      </div>

      {/* 배송 타임라인 (R.MY.02) */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          배송 현황
        </h2>
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>예정 배송 시간: {order.delivery_scheduled_time}</span>
        </div>

        {/* 타임라인 */}
        <div className="relative">
          {order.timeline.map((step, index) => (
            <div key={step.status} className="flex items-start gap-4 pb-6 last:pb-0">
              {/* 아이콘 및 연결선 */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  }`}
                >
                  {step.status === "ordered" && <Package className="w-5 h-5" />}
                  {step.status === "confirmed" && <CheckCircle className="w-5 h-5" />}
                  {step.status === "preparing" && <Package className="w-5 h-5" />}
                  {step.status === "shipping" && <Truck className="w-5 h-5" />}
                  {step.status === "delivered" && <CheckCircle className="w-5 h-5" />}
                </div>
                {index < order.timeline.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 mt-2 ${
                      step.completed
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    style={{ minHeight: "24px" }}
                  />
                )}
              </div>

              {/* 단계 정보 */}
              <div className="flex-1 pt-2">
                <p
                  className={`font-medium ${
                    step.completed
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {step.timestamp && step.completed && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주문 상품 */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          주문 상품
        </h2>
        <div className="space-y-4">
          {order.products.map((product) => (
            <div
              key={product.id}
              className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              {/* 상품 이미지 */}
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 상품 정보 */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.anonymous_seller_id} · {product.seller_region}
                </p>
                <p className="font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {product.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.unit_price.toLocaleString()}원 × {product.quantity}개
                  </p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {product.subtotal.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 배송 정보 */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          배송 정보
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {order.delivery_info.recipient_name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {order.delivery_info.address}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {order.delivery_info.address_detail}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {order.delivery_info.phone}
            </p>
          </div>
          {order.delivery_info.request && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  배송 요청사항:
                </span>{" "}
                {order.delivery_info.request}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 결제 정보 */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          결제 정보
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {order.payment_info.method} ({order.payment_info.card_name})
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                {order.payment_info.card_number}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">상품 금액</span>
              <span className="text-gray-900 dark:text-gray-100">
                {order.price_info.product_total.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">배송비</span>
              <span className="text-gray-900 dark:text-gray-100">
                {order.price_info.shipping_fee.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-gray-100">총 결제 금액</span>
              <span className="text-green-600 dark:text-green-400">
                {order.price_info.total.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 (R.MY.03) */}
      <div className="flex flex-col sm:flex-row gap-3">
        {order.status === "delivered" && (
          <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
            구매 확정
          </button>
        )}
        <button className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors">
          재주문
        </button>
        <Link
          href="/retailer/orders"
          className="flex-1 py-3 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
}

