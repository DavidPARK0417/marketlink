'use client';

import { dummyOrders, dummyProducts, dummySettlements } from '@/lib/dummy-data';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle, ChevronRight, Truck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // 통계 계산
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = dummyOrders.filter((order) =>
    order.created_at.startsWith(today)
  ).length;

  const confirmedOrders = dummyOrders.filter(
    (order) => order.status === 'confirmed'
  ).length;

  // 이번 주 정산 예정 금액
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklySettlement = dummySettlements
    .filter((s) => new Date(s.created_at) >= weekStart)
    .reduce((sum, s) => sum + s.settled_amount, 0);

  const totalProducts = dummyProducts.length;

  // 최근 주문 5건
  const recentOrders = dummyOrders.slice(0, 5);

  // 재고 부족 상품 (100개 미만)
  const lowStockProducts = dummyProducts.filter((p) => p.stock < 100);

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '신규',
      confirmed: '확인완료',
      shipped: '출고완료',
      completed: '배송완료',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-[#fbbf24] text-white',
      confirmed: 'bg-[#10B981] text-white',
      shipped: 'bg-[#3b82f6] text-white',
      completed: 'bg-gray-400 text-white',
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-200';
  };

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* 알림 배너 - 신규 주문 with 3D */}
      {todayOrders > 0 && (
        <div className="relative bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] text-white rounded-3xl p-4 lg:p-5 shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1 border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 rounded-3xl"></div>
          <div className="relative flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl shadow-lg">
              <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base lg:text-lg drop-shadow-md">
                신규 주문 {todayOrders}건의 발주 확인이 필요합니다.
              </h3>
              <p className="text-xs lg:text-sm mt-0.5 opacity-90">
                빠른 처리로 고객 만족도를 높이세요.
              </p>
            </div>
            <ChevronRight className="w-6 h-6 flex-shrink-0 drop-shadow-lg" />
          </div>
        </div>
      )}

      {/* 간편 통계 카드 - 3D Effect */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">📦</div>
            <p className="text-xs lg:text-sm text-[#6B7280] font-semibold mb-2">오늘 신규 주문</p>
            <p className="text-2xl lg:text-3xl font-bold text-[#111827] mb-2">{todayOrders}건</p>
            <div className="flex items-center gap-1 text-xs text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-1 rounded-full w-fit">
              <TrendingUp className="w-3 h-3" />
              <span>+12%</span>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(251,191,36,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">⏰</div>
            <p className="text-xs lg:text-sm text-[#6B7280] font-semibold mb-2">출고 예정</p>
            <p className="text-2xl lg:text-3xl font-bold text-[#111827] mb-2">{confirmedOrders}건</p>
            <div className="text-xs text-[#fbbf24] font-semibold bg-[#fbbf24]/10 px-2 py-1 rounded-full w-fit">
              처리 필요
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">💰</div>
            <p className="text-xs lg:text-sm text-[#6B7280] font-semibold mb-2">이번 주 정산</p>
            <p className="text-xl lg:text-2xl font-bold text-[#111827] mb-2">{(weeklySettlement / 10000).toFixed(0)}만원</p>
            <div className="flex items-center gap-1 text-xs text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-1 rounded-full w-fit">
              <TrendingUp className="w-3 h-3" />
              <span>+8%</span>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">🏪</div>
            <p className="text-xs lg:text-sm text-[#6B7280] font-semibold mb-2">등록 상품</p>
            <p className="text-2xl lg:text-3xl font-bold text-[#111827] mb-2">{totalProducts}개</p>
            <div className="text-xs text-[#6B7280] font-semibold bg-gray-100 px-2 py-1 rounded-full w-fit">
              관리 중
            </div>
          </div>
        </div>
      </div>


      {/* 최근 주문 내역 - 3D Effect */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50">
        <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-[#111827] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#10B981]" />
              최근 주문 배송 조회
            </h2>
            <p className="text-xs lg:text-sm text-[#6B7280] mt-1">
              신규 주문 {todayOrders}건이 처리 대기 중입니다
            </p>
          </div>
          <Link href="/wholesaler/orders" className="text-[#10B981] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            더보기 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 데스크톱 테이블 */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">주문번호</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">상품명</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">고객명</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">수량</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">금액</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#111827]">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{order.product_name}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{order.quantity}박스</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{order.total_amount.toLocaleString()}원</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 */}
        <div className="lg:hidden divide-y divide-gray-200">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-[#F8F9FA] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#111827] mb-1">{order.product_name}</p>
                  <p className="text-xs text-[#6B7280]">{order.order_number}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#6B7280]">고객: </span>
                  <span className="text-[#111827] font-medium">{order.customer_name}</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">수량: </span>
                  <span className="text-[#111827] font-medium">{order.quantity}박스</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#6B7280]">금액: </span>
                  <span className="text-[#111827] font-bold">{order.total_amount.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 재고 부족 알림 섹션 */}
      <div className="bg-[#FFF7ED] rounded-3xl p-6 border border-orange-200 shadow-[0_8px_30px_rgba(249,115,22,0.1)]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-3">
            <div className="bg-white p-2.5 rounded-full shadow-sm border border-orange-100 h-fit">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                재고 부족 알림
              </h2>
              <p className="text-sm text-orange-600 font-medium mt-1">
                {lowStockProducts.length > 0 ? `${lowStockProducts.length}개 상품 재고 부족` : '재고 부족 상품이 없습니다.'}
              </p>
            </div>
          </div>
          <Link
            href="/wholesaler/products"
            className="flex items-center gap-1 bg-white px-4 py-2 rounded-xl border border-orange-200 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm"
          >
            전체 보기 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                  <p className="text-orange-600 font-bold">재고: {product.stock}개</p>
                </div>
                <Link
                  href={`/wholesaler/products`}
                  className="px-4 py-2 rounded-xl border border-orange-200 text-orange-600 font-medium text-sm hover:bg-orange-50 transition-colors"
                >
                  재고 추가
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-2xl border border-orange-100 border-dashed">
              현재 재고가 부족한 상품이 없습니다. 👍
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


