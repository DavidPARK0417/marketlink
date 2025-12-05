'use client';

import { X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDummyPriceHistory } from '@/lib/dummy-data';

interface PriceChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function PriceChartModal({
  isOpen,
  onClose,
  productName,
}: PriceChartModalProps) {
  if (!isOpen) return null;

  const priceData = getDummyPriceHistory(productName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">시세 조회</h2>
            <p className="text-sm text-gray-600 mt-1">
              최근 7일간의 가격 추이를 확인하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 차트 */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-900">
              {productName || '상품명을 입력해주세요'}
            </p>
            <p className="text-sm text-gray-600">단위: 20kg 기준 (원)</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()}원`,
                    '가격',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 통계 정보 */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">평균 가격</p>
              <p className="text-xl font-bold text-[#10B981] mt-1">
                {(
                  priceData.reduce((sum, d) => sum + d.price, 0) /
                  priceData.length
                ).toLocaleString()}
                원
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">최고 가격</p>
              <p className="text-xl font-bold text-[#10B981] mt-1">
                {Math.max(...priceData.map((d) => d.price)).toLocaleString()}원
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">최저 가격</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {Math.min(...priceData.map((d) => d.price)).toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-[#10B981] text-white py-3 rounded-xl font-semibold hover:bg-[#4a8059] transition-colors shadow-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
