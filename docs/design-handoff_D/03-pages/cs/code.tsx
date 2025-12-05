'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { dummyCSThreads } from '@/lib/dummy-data';
import { CSStatus } from '@/types';
import { MessageSquare, CheckCircle, Clock, Plus, Search, ChevronDown, ChevronUp, Mic, Megaphone, Building, HelpCircle } from 'lucide-react';

interface Inquiry {
  id: number;
  title: string;
  content: string;
  type: 'settlement' | 'system' | 'other';
  status: 'pending' | 'completed';
  created_at: string;
  reply?: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function CSPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'inquiry' | 'faq' | 'voc' | 'notice' | 'partnership' | 'product'>('inquiry');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'product') {
      setActiveTab('product');
    } else if (tab === 'inquiry') {
      setActiveTab('inquiry');
    }
  }, [searchParams]);

  // --- 기존 상품문의 관련 State & Logic ---
  const [filter, setFilter] = useState<'all' | CSStatus>('all');
  const filteredThreads =
    filter === 'all'
      ? dummyCSThreads
      : dummyCSThreads.filter((t) => t.status === filter);

  const getStatusText = (status: CSStatus) => {
    return status === 'pending' ? '답변 대기' : '답변 완료';
  };

  const getStatusColor = (status: CSStatus) => {
    return status === 'pending'
      ? 'bg-[#fbbf24] text-white'
      : 'bg-[#10B981] text-white';
  };

  const getStatusIcon = (status: CSStatus) => {
    return status === 'pending' ? (
      <Clock className="w-4 h-4" />
    ) : (
      <CheckCircle className="w-4 h-4" />
    );
  };

  // --- 1:1 문의하기 (구 고객센터 문의) ---
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: 1,
      title: '3월 정산 금액 확인 요청',
      content: '3월 1주차 정산 금액이 예상과 다릅니다. 확인 부탁드립니다.',
      type: 'settlement',
      status: 'pending',
      created_at: '2024-03-10T09:00:00',
    },
    {
      id: 2,
      title: '상품 등록 시 이미지 업로드 오류',
      content: '상품 등록 화면에서 이미지가 올라가지 않습니다.',
      type: 'system',
      status: 'completed',
      created_at: '2024-03-01T14:30:00',
      reply: '안녕하세요, 시스템 점검 중 발생한 일시적 오류였습니다. 현재는 정상 작동합니다.',
    },
  ]);

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newInquiry, setNewInquiry] = useState({
    title: '',
    content: '',
    type: 'settlement' as const,
  });

  // --- VOC & Partnership Modals State ---
  const [isVocModalOpen, setIsVocModalOpen] = useState(false);
  const [vocData, setVocData] = useState({ content: '', password: '' });

  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);
  const [partnershipData, setPartnershipData] = useState({ branchName: '', address: '', contact: '' });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inquiries.length + 1;
    const inquiry: Inquiry = {
      id,
      title: newInquiry.title,
      content: newInquiry.content,
      type: newInquiry.type,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setInquiries([inquiry, ...inquiries]);
    setIsWriteModalOpen(false);
    setNewInquiry({ title: '', content: '', type: 'settlement' });
    alert('문의가 등록되었습니다.');
  };

  // --- 자주 묻는 질문 (FAQ) ---
  const faqs: FAQ[] = [
    { id: 1, category: '정산', question: '정산 주기는 어떻게 되나요?', answer: '정산은 매주 수요일에 지난 주(월~일) 구매 확정 건에 대해 일괄 진행됩니다.' },
    { id: 2, category: '상품', question: '상품 등록 후 승인까지 얼마나 걸리나요?', answer: '상품 등록 후 영업일 기준 24시간 이내에 담당자 검토 후 승인 처리됩니다.' },
    { id: 3, category: '배송', question: '배송 지연 패널티가 있나요?', answer: '네, 발송 기한을 3일 이상 초과할 경우 판매자 점수에 영향을 미칠 수 있습니다.' },
    { id: 4, category: '계정', question: '사업자 정보를 변경하고 싶어요.', answer: '마이페이지 > 설정 메뉴에서 상호명, 주소, 연락처 등을 직접 수정하실 수 있습니다.' },
    { id: 5, category: '시스템', question: '송장 번호를 잘못 입력했어요.', answer: '배송 중 상태에서는 송장 번호 수정이 가능합니다. 주문 관리 상세 페이지에서 수정해주세요.' },
    { id: 6, category: '기타', question: '탈퇴는 어떻게 하나요?', answer: '탈퇴는 고객센터 1:1 문의를 통해 접수해주시면 진행 중인 거래 확인 후 처리해드립니다.' },
  ];
  
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // --- 공지사항 ---
  const notices = [
    { id: 1, title: '[점검] 4월 15일 시스템 정기 점검 안내 (02:00 ~ 06:00)', date: '2024-04-10', isNew: true },
    { id: 2, title: '[안내] 정산 시스템 업데이트 예정 (5월 중)', date: '2024-04-05', isNew: false },
    { id: 3, title: '[정책] 배송비 정책 일부 변경 안내', date: '2024-03-28', isNew: false },
  ];

  return (
    <div className="space-y-8 pb-12">
      {activeTab === 'product' ? (
        <>
          {/* 페이지 헤더 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">상품문의</h1>
            <p className="mt-2 text-gray-600">신속한 응대로 고객 신뢰도를 높이세요.</p>
          </div>

          {/* 문의 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => setFilter('all')}
              className={`bg-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
                filter === 'all' ? 'ring-2 ring-[#10B981]' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">전체 문의</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dummyCSThreads.length}건
                  </p>
                </div>
                <div className="p-2">
                  <MessageSquare className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
                </div>
              </div>
            </button>

            <button 
              onClick={() => setFilter('pending')}
              className={`bg-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
                filter === 'pending' ? 'ring-2 ring-[#fbbf24]' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">답변 대기</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dummyCSThreads.filter((t) => t.status === 'pending').length}건
                  </p>
                </div>
                <div className="p-2">
                  <Clock className="w-12 h-12 text-green-500" strokeWidth={1.5} />
                </div>
              </div>
            </button>

            <button 
              onClick={() => setFilter('completed')}
              className={`bg-white rounded-xl shadow-md p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
                filter === 'completed' ? 'ring-2 ring-[#10B981]' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">답변 완료</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dummyCSThreads.filter((t) => t.status === 'completed').length}
                    건
                  </p>
                </div>
                <div className="p-2">
                  <CheckCircle className="w-12 h-12 text-purple-500" strokeWidth={1.5} />
                </div>
              </div>
            </button>
          </div>

          {/* 문의 목록 */}
          <div className="space-y-4">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {thread.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            thread.status
                          )}`}
                        >
                          {getStatusIcon(thread.status)}
                          {getStatusText(thread.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>고객: {thread.customer_name}</span>
                        <span>•</span>
                        <span>
                          문의일:{' '}
                          {new Date(thread.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {thread.replied_at && (
                          <>
                            <span>•</span>
                            <span className="text-[#10B981]">
                              답변완료:{' '}
                              {new Date(thread.replied_at).toLocaleDateString(
                                'ko-KR',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 문의 내용 */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">{thread.content}</p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-3">
                    {thread.status === 'pending' ? (
                      <button className="px-6 py-2 bg-[#10B981] text-white rounded-xl font-semibold hover:bg-[#059669] transition-colors shadow-md">
                        답변하기
                      </button>
                    ) : (
                      <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                        답변 확인
                      </button>
                    )}
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredThreads.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                해당 조건의 문의가 없습니다.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 상단 배너 & 검색창 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">고객센터</h1>
                <p className="text-blue-100">
                  무엇을 도와드릴까요? <br className="block md:hidden" />
                  궁금한 점을 검색해보세요.
                </p>
              </div>
              <div className="w-full md:w-1/2 relative">
                <input
                  type="text"
                  placeholder="자주 묻는 질문 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-400/30 shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl transition-colors font-semibold whitespace-nowrap">
                <MessageSquare className="w-5 h-5" />
                채팅 상담하기
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { id: 'inquiry', label: '문의내역' },
                { id: 'faq', label: '자주묻는질문' },
                { id: 'voc', label: '고객의 소리' },
                { id: 'notice', label: '공지사항' },
                { id: 'partnership', label: '입점문의' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* 탭 컨텐츠 */}
          <div className="min-h-[400px] mt-8">
            {/* 1. 문의내역 (1:1 문의하기) */}
            {activeTab === 'inquiry' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">1:1 문의 내역</h2>
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md text-sm"
              >
                <Plus className="w-4 h-4" />
                문의하기
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 데스크톱 테이블 */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="p-4 font-bold border-b w-24 text-center">상태</th>
                      <th className="p-4 font-bold border-b w-24 text-center">유형</th>
                      <th className="p-4 font-bold border-b">제목</th>
                      <th className="p-4 font-bold border-b w-32 text-center">작성일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              inquiry.status === 'pending'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {inquiry.status === 'pending' ? '접수완료' : '답변완료'}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-500">
                          {inquiry.type === 'settlement' ? '정산' : 
                           inquiry.type === 'system' ? '시스템' : '기타'}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {inquiry.title}
                          </div>
                          {inquiry.reply && (
                            <div className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-600 text-xs">
                              <span className="font-bold text-blue-600 mr-1">[답변]</span>
                              {inquiry.reply}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-400">
                          {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 모바일 카드 리스트 */}
              <div className="lg:hidden divide-y divide-gray-100">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                     <div className="flex justify-between items-start mb-2">
                       <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              inquiry.status === 'pending'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {inquiry.status === 'pending' ? '접수완료' : '답변완료'}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(inquiry.created_at).toLocaleDateString('ko-KR')}</span>
                     </div>
                     
                     <h3 className="text-base font-bold text-gray-900 mb-1">{inquiry.title}</h3>
                     <span className="text-xs text-gray-500 mb-3 block">
                        {inquiry.type === 'settlement' ? '정산 문의' : 
                         inquiry.type === 'system' ? '시스템 문의' : '기타 문의'}
                     </span>
                     
                     {inquiry.reply && (
                        <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-xs mt-2">
                          <span className="font-bold text-blue-600 mr-1">[답변]</span>
                          {inquiry.reply}
                        </div>
                     )}
                  </div>
                ))}
                {inquiries.length === 0 && (
                   <div className="p-12 text-center text-gray-500">문의 내역이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. 자주묻는질문 (FAQ) */}
        {activeTab === 'faq' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">자주 묻는 질문</h2>
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-blue-600 font-bold w-8">Q.</span>
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </div>
                  {openFaqId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFaqId === faq.id && (
                  <div className="px-5 pb-5 pt-0 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-4 mt-4">
                      <span className="text-gray-400 font-bold w-8">A.</span>
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3. 고객의 소리 */}
        {activeTab === 'voc' && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">고객의 소리(VOC)</h2>
            <p className="text-gray-600 mb-8">
              서비스 이용 중 불편하셨던 점이나 개선할 점을 들려주세요.<br />
              고객님의 소중한 의견을 귀담아듣고 더 나은 서비스를 만들겠습니다.
            </p>
            <button 
              onClick={() => setIsVocModalOpen(true)}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">
              의견 보내기
            </button>
          </div>
        )}

        {/* 4. 공지사항 */}
        {activeTab === 'notice' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">공지사항</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {notices.map((notice) => (
                <div key={notice.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    {notice.isNew && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
                    )}
                    <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                      {notice.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">{notice.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. 입점문의 (추가 사업장) */}
        {activeTab === 'partnership' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center mb-8 shadow-xl">
              <Building className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2">추가 사업장 입점 문의</h2>
              <p className="text-gray-300 mb-6">
                새로운 사업장을 추가하거나 파트너십을 확장하고 싶으신가요?<br />
                입점 문의를 남겨주시면 담당자가 빠른 시일 내에 연락드리겠습니다.
              </p>
              <button 
                onClick={() => setIsPartnershipModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
                입점 신청하기
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">1</div>
                <h3 className="font-bold text-gray-900 mb-2">신청서 접수</h3>
                <p className="text-xs text-gray-500">사업자 정보 및 입점 제안서를 제출합니다.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">2</div>
                <h3 className="font-bold text-gray-900 mb-2">심사 및 승인</h3>
                <p className="text-xs text-gray-500">담당자 검토 후 승인 여부를 안내해드립니다.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">3</div>
                <h3 className="font-bold text-gray-900 mb-2">입점 완료</h3>
                <p className="text-xs text-gray-500">계약 체결 후 판매를 시작할 수 있습니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )}

      {/* 새 문의 작성 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsWriteModalOpen(false)}
          />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">새 문의 작성</h2>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  문의 유형
                </label>
                <select
                  value={newInquiry.type}
                  onChange={(e) => setNewInquiry({...newInquiry, type: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="settlement">정산 문의</option>
                  <option value="system">시스템 오류</option>
                  <option value="other">기타 문의</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  required
                  value={newInquiry.title}
                  onChange={(e) => setNewInquiry({...newInquiry, title: e.target.value})}
                  placeholder="문의 제목을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내용
                </label>
                <textarea
                  required
                  rows={5}
                  value={newInquiry.content}
                  onChange={(e) => setNewInquiry({...newInquiry, content: e.target.value})}
                  placeholder="문의 내용을 상세히 적어주세요."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 고객의 소리 (VOC) 모달 */}
      {isVocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsVocModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">소중한 의견 보내기</h2>
            <p className="text-sm text-gray-500 mb-4 -mt-4">보내주신 의견은 서비스 개선을 위해 소중하게 활용됩니다.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('소중한 의견 감사합니다.'); setIsVocModalOpen(false); setVocData({ content: '', password: '' }); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">의견 내용</label>
                  <textarea
                    required
                    rows={5}
                    value={vocData.content}
                    onChange={(e) => setVocData({ ...vocData, content: e.target.value })}
                    placeholder="서비스 이용 중 불편하셨던 점이나 개선할 점을 자유롭게 적어주세요."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 설정</label>
                  <input
                    type="password"
                    required
                    value={vocData.password}
                    onChange={(e) => setVocData({ ...vocData, password: e.target.value })}
                    placeholder="의견 확인을 위한 비밀번호 4자리"
                    maxLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">* 작성하신 의견을 확인하거나 수정할 때 사용됩니다.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsVocModalOpen(false)} className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">취소</button>
                <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">보내기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 입점 신청 모달 */}
      {isPartnershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsPartnershipModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">추가 사업장 입점 신청</h2>
            <p className="text-sm text-gray-500 mb-6">기존 회원님의 새로운 지점을 등록하고 통합 관리하세요.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('입점 신청이 접수되었습니다. 담당자가 검토 후 연락드리겠습니다.'); setIsPartnershipModalOpen(false); setPartnershipData({ branchName: '', address: '', contact: '' }); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">새로운 지점명 (상호명)</label>
                  <input
                    type="text"
                    required
                    value={partnershipData.branchName}
                    onChange={(e) => setPartnershipData({ ...partnershipData, branchName: e.target.value })}
                    placeholder="예: 서울 강남 2호점"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">사업장 주소</label>
                  <input
                    type="text"
                    required
                    value={partnershipData.address}
                    onChange={(e) => setPartnershipData({ ...partnershipData, address: e.target.value })}
                    placeholder="사업장 상세 주소를 입력해주세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">담당자 연락처</label>
                  <input
                    type="tel"
                    required
                    value={partnershipData.contact}
                    onChange={(e) => setPartnershipData({ ...partnershipData, contact: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsPartnershipModalOpen(false)} className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">취소</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">신청하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


