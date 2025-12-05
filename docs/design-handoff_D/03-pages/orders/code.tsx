'use client';

import { useState } from 'react';
import { dummyOrders } from '@/lib/dummy-data';
import { OrderStatus } from '@/types';
import { ChevronDown } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState(dummyOrders);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  // 필터링된 주문 목록
  const filteredOrders =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  // 상태 변경 핸들러
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      pending: '신규',
      confirmed: '확인완료',
      shipped: '출고완료',
      completed: '배송완료',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: OrderStatus) => {
    const colorMap = {
      pending: 'bg-[#fbbf24] text-white',
      confirmed: 'bg-[#10B981] text-white',
      shipped: 'bg-[#3b82f6] text-white',
      completed: 'bg-gray-400 text-white',
    };
    return colorMap[status];
  };

  const filterButtons = [
    { label: '전체', value: 'all' as const, count: orders.length },
    {
      label: '신규',
      value: 'pending' as const,
      count: orders.filter((o) => o.status === 'pending').length,
    },
    {
      label: '처리중',
      value: 'confirmed' as const,
      count: orders.filter((o) => o.status === 'confirmed').length,
    },
    {
      label: '완료',
      value: 'completed' as const,
      count: orders.filter((o) => o.status === 'completed').length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
        <p className="mt-2 text-gray-600">
          총 {orders.length}건의 주문을 관리하세요.
        </p>
      </div>

      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 whitespace-nowrap ${
              filter === btn.value
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-md hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {/* 주문 목록 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* 데스크톱 테이블 */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  주문번호
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  상품명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  고객명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  수량
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  금액
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  배송지
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  주문일시
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {order.product_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {order.quantity}박스
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {order.total_amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {order.delivery_address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as OrderStatus
                          )
                        }
                        className={`appearance-none pl-4 pr-10 py-2 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <option value="pending" className="text-gray-900 bg-white">신규</option>
                        <option value="confirmed" className="text-gray-900 bg-white">확인완료</option>
                        <option value="shipped" className="text-gray-900 bg-white">출고완료</option>
                        <option value="completed" className="text-gray-900 bg-white">배송완료</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-80" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 리스트 */}
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    {new Date(order.created_at).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{order.product_name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{order.order_number}</p>
                </div>
                <div className="relative inline-block">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as OrderStatus
                      )
                    }
                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <option value="pending" className="text-gray-900 bg-white">신규</option>
                    <option value="confirmed" className="text-gray-900 bg-white">확인완료</option>
                    <option value="shipped" className="text-gray-900 bg-white">출고완료</option>
                    <option value="completed" className="text-gray-900 bg-white">배송완료</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-80" />
                </div>
              </div>

              <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">주문자</span>
                  <span className="font-medium text-gray-900">{order.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">주문 수량</span>
                  <span className="font-medium text-gray-900">{order.quantity}박스</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-500">결제 금액</span>
                  <span className="font-bold text-[#10B981]">{order.total_amount.toLocaleString()}원</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                <span className="font-semibold whitespace-nowrap">배송지:</span>
                <span>{order.delivery_address}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            해당 조건의 주문이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}


