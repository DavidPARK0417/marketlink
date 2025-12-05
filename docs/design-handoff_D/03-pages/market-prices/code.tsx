'use client';

import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MarketPricesPage() {
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data for market prices
  const marketPrices = [
    {
      id: 1,
      classification: '서울/가락',
      item: '사과(부사)',
      unit: '10kg 상자',
      todayPrice: 45000,
      yesterdayPrice: 44500,
      monthAgoPrice: 42000,
      yearAgoPrice: 38000,
      fluctuation: 1.1,
    },
    {
      id: 2,
      classification: '대구/북구',
      item: '배(신고)',
      unit: '15kg 상자',
      todayPrice: 52000,
      yesterdayPrice: 53000,
      monthAgoPrice: 55000,
      yearAgoPrice: 48000,
      fluctuation: -1.9,
    },
    {
      id: 3,
      classification: '광주/서부',
      item: '양파',
      unit: '20kg 망',
      todayPrice: 18000,
      yesterdayPrice: 18000,
      monthAgoPrice: 16000,
      yearAgoPrice: 22000,
      fluctuation: 0,
    },
    {
      id: 4,
      classification: '부산/엄궁',
      item: '대파',
      unit: '1kg 단',
      todayPrice: 2800,
      yesterdayPrice: 2500,
      monthAgoPrice: 2200,
      yearAgoPrice: 3000,
      fluctuation: 12.0,
    },
    {
      id: 5,
      classification: '대전/오정',
      item: '무',
      unit: '20kg 상자',
      todayPrice: 15000,
      yesterdayPrice: 15500,
      monthAgoPrice: 14000,
      yearAgoPrice: 12000,
      fluctuation: -3.2,
    },
  ];

  const filteredPrices = marketPrices.filter((price) => {
    const matchesRegion = selectedRegion === '전체' || price.classification.includes(selectedRegion);
    const matchesSearch = price.item.includes(searchQuery);
    return matchesRegion && matchesSearch;
  });

  const getFluctuationColor = (rate: number) => {
    if (rate > 0) return 'text-red-500';
    if (rate < 0) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getFluctuationIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4" />;
    if (rate < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#111827]">시세 조회</h1>
        <p className="mt-2 text-sm lg:text-base text-[#6B7280]">
          전국 주요 도매시장의 실시간 시세를 조회하세요.
        </p>
      </div>

      {/* 필터 및 검색 섹션 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* 지역 선택 */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all pr-8"
            >
              <option value="전체">전국 전체</option>
              <option value="서울">서울</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="인천">인천</option>
              <option value="광주">광주</option>
              <option value="대전">대전</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* 품목 검색 */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="품목명 검색 (예: 사과, 배)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <button className="w-full md:w-auto px-6 py-2.5 bg-[#10B981] text-white font-semibold rounded-xl hover:bg-[#059669] transition-colors shadow-md hover:shadow-lg">
          조회하기
        </button>
      </div>

      {/* 시세 테이블 */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">구분</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">품목</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">단위</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">당일 가격</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1일 전</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1개월 전</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#6B7280] whitespace-nowrap">1년 전</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#111827] whitespace-nowrap">증감률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#111827]">{price.classification}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#111827]">{price.item}</td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{price.unit}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-[#10B981]">{price.todayPrice.toLocaleString()}원</td>
                    <td className="px-6 py-4 text-sm text-right text-[#6B7280]">{price.yesterdayPrice.toLocaleString()}원</td>
                    <td className="px-6 py-4 text-sm text-right text-[#6B7280]">{price.monthAgoPrice.toLocaleString()}원</td>
                    <td className="px-6 py-4 text-sm text-right text-[#6B7280]">{price.yearAgoPrice.toLocaleString()}원</td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 text-sm font-bold ${getFluctuationColor(price.fluctuation)}`}>
                        {getFluctuationIcon(price.fluctuation)}
                        <span>{Math.abs(price.fluctuation)}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    조회된 시세 정보가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 참고 사항 */}
      <div className="text-xs text-gray-500 px-2">
        <p>* 제공되는 시세 정보는 도매시장 경매 낙찰가를 기준으로 하며, 실시간 변동될 수 있습니다.</p>
        <p>* 증감률은 전일 대비 등락폭을 의미합니다.</p>
      </div>
    </div>
  );
}


