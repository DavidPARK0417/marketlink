'use client';

import { useState } from 'react';
import { dummySettlements } from '@/lib/dummy-data';
import { SettlementStatus } from '@/types';
import { Calendar } from 'lucide-react';

export default function SettlementsPage() {
  const [filter, setFilter] = useState<'all' | SettlementStatus>('all');

  // 필터링된 정산 목록
  const filteredSettlements =
    filter === 'all'
      ? dummySettlements
      : dummySettlements.filter((s) => s.status === filter);

  // 총 정산 금액 계산
  const totalAmount = filteredSettlements.reduce(
    (sum, s) => sum + s.settled_amount,
    0
  );

  const getStatusText = (status: SettlementStatus) => {
    return status === 'pending' ? '정산 대기' : '정산 완료';
  };

  const getStatusColor = (status: SettlementStatus) => {
    return status === 'pending'
      ? 'bg-[#fbbf24] text-white'
      : 'bg-[#10B981] text-white';
  };

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">정산 관리</h1>
        <p className="mt-2 text-gray-600">
          투명한 정산 내역을 확인하고 관리하세요.
        </p>
      </div>

      {/* 정산 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">총 정산 금액</p>
          <p className="text-3xl font-bold text-[#10B981] mt-2">
            {totalAmount.toLocaleString()}원
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">정산 대기</p>
          <p className="text-3xl font-bold text-[#fbbf24] mt-2">
            {dummySettlements.filter((s) => s.status === 'pending').length}건
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">정산 완료</p>
          <p className="text-3xl font-bold text-[#10B981] mt-2">
            {dummySettlements.filter((s) => s.status === 'completed').length}건
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            filter === 'all'
              ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-md hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          전체 ({dummySettlements.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            filter === 'pending'
              ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-md hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          정산 대기 (
          {dummySettlements.filter((s) => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            filter === 'completed'
              ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-md hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          정산 완료 (
          {dummySettlements.filter((s) => s.status === 'completed').length})
        </button>
      </div>

      {/* 정산 내역 테이블 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        {/* 데스크톱 테이블 */}
        <div className="hidden lg:block overflow-x-auto rounded-xl">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  주문번호
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  판매금액
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  플랫폼 수수료 (5%)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  최종 지급액
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  정산일
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSettlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {settlement.order_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {settlement.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    -{settlement.fee.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#10B981]">
                    {settlement.settled_amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {settlement.settled_at
                      ? new Date(settlement.settled_at).toLocaleDateString(
                          'ko-KR'
                        )
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        settlement.status
                      )}`}
                    >
                      {getStatusText(settlement.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 리스트 */}
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredSettlements.map((settlement) => (
            <div key={settlement.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    {settlement.settled_at
                      ? new Date(settlement.settled_at).toLocaleDateString('ko-KR')
                      : '정산 예정'}
                  </span>
                  <span className="text-xs font-mono text-gray-500">{settlement.order_number}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    settlement.status
                  )}`}
                >
                  {getStatusText(settlement.status)}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">판매금액</span>
                  <span className="text-gray-900">{settlement.amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>수수료 (5%)</span>
                  <span>-{settlement.fee.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-[#10B981]">
                  <span>최종 지급액</span>
                  <span>{settlement.settled_amount.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSettlements.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            해당 조건의 정산 내역이 없습니다.
          </div>
        )}
      </div>

      {/* 정산 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#10B981] mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">정산 안내</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 정산은 주문 완료 후 익일 자동으로 처리됩니다.</li>
              <li>
                • 플랫폼 수수료는 판매금액의 5%이며, 투명하게 공개됩니다.
              </li>
              <li>• 정산 내역은 언제든지 확인 가능합니다.</li>
              <li>
                • 정산 관련 문의사항은 고객센터를 통해 접수해주시기 바랍니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


