'use client';

import { useState } from 'react';
import { Building, Phone, MapPin, CreditCard, Mail, Lock, Bell, Search, AlertTriangle, X } from 'lucide-react';

export default function SettingsPage() {
  // --- 1. 계정 정보 (읽기 전용) ---
  const accountInfo = {
    businessNumber: '1234567891',
    ceoName: '김소연',
    vendorCode: 'VENDOR-008',
    status: '승인됨',
    approvedAt: '2025년 12월 01일',
    joinedAt: '2025년 12월 01일',
  };

  // --- 2. 사업자 정보 수정 ---
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '김소연',
    contact: '010-2997-9910',
    address: '경기 수원시 영통구 센트럴타운',
    detailAddress: '2022동',
    bankName: '',
    accountNumber: '1234567890',
  });

  const handleBusinessInfoSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic here
    alert('사업자 정보가 저장되었습니다.');
  };

  // --- 3. 이메일 변경 ---
  const [email, setEmail] = useState('a29979910@gmail.com');
  const handleEmailChange = () => {
    alert('이메일 변경 인증 링크가 발송되었습니다.');
  };

  // --- 4. 비밀번호 변경 ---
  // (Assuming this might open a modal or redirect, for now just an alert as per UI)
  const handlePasswordChange = () => {
    alert('비밀번호 변경 페이지로 이동하거나 모달을 띄웁니다.');
  };

  // --- 5. 알림 설정 ---
  const [notifications, setNotifications] = useState({
    newOrder: { email: true, push: true },
    orderComplete: { email: true, push: false },
    inquiryReply: { email: true, push: true },
  });

  const handleNotificationSave = () => {
    alert('알림 설정이 저장되었습니다.');
  };

  // --- 6. 회원 탈퇴 ---
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalAgreed, setWithdrawalAgreed] = useState(false);

  const handleWithdrawal = () => {
    if (!withdrawalAgreed) {
      alert('유의사항에 동의해주세요.');
      return;
    }
    alert('회원 탈퇴 신청이 접수되었습니다. 이용해 주셔서 감사합니다.');
    setIsWithdrawalModalOpen(false);
    // 실제로는 로그아웃 처리 및 홈으로 리다이렉트
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 pb-12">
      
      {/* 1. 계정 정보 (Read-only) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">계정 정보</h2>
        <p className="text-sm text-gray-500 mb-6">사업자 등록 정보입니다. 수정할 수 없습니다.</p>
        
        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">사업자번호</p>
            <p className="text-base text-gray-900 font-medium">{accountInfo.businessNumber}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">대표자명</p>
            <p className="text-base text-gray-900 font-medium">{accountInfo.ceoName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">익명 코드</p>
            <p className="text-base text-gray-900 font-medium">{accountInfo.vendorCode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">승인 상태</p>
            <p className="text-base text-gray-900 font-medium">{accountInfo.status}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">승인일</p>
            <p className="text-base text-gray-900 font-medium">{accountInfo.approvedAt}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">가입일</p>
            <p className="text-base text-gray-900 font-medium">{accountInfo.joinedAt}</p>
          </div>
        </div>
      </div>

      {/* 2. 사업자 정보 수정 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">사업자 정보 수정</h2>
        <p className="text-sm text-gray-500 mb-6">상호명, 연락처, 주소, 계좌번호를 수정할 수 있습니다.</p>

        <form onSubmit={handleBusinessInfoSave} className="space-y-5">
          {/* 상호명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              상호명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={businessInfo.businessName}
              onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
            />
            <p className="text-xs text-gray-400 mt-1.5">사업자 등록증에 기재된 상호명을 입력해주세요.</p>
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={businessInfo.contact}
              onChange={(e) => setBusinessInfo({...businessInfo, contact: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
            />
            <p className="text-xs text-gray-400 mt-1.5">연락 가능한 전화번호를 입력해주세요.</p>
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={businessInfo.address}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              />
              <button type="button" className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                <Search className="w-4 h-4" />
                주소 검색
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">주소 검색 버튼을 클릭하여 주소를 검색해주세요.</p>
            
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">상세주소</label>
            <input
              type="text"
              value={businessInfo.detailAddress}
              onChange={(e) => setBusinessInfo({...businessInfo, detailAddress: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
            />
            <p className="text-xs text-gray-400 mt-1.5">상세주소를 입력해주세요 (선택사항)</p>
          </div>

          {/* 은행명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              은행명 <span className="text-red-500">*</span>
            </label>
            <select
              value={businessInfo.bankName}
              onChange={(e) => setBusinessInfo({...businessInfo, bankName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all appearance-none bg-white"
            >
              <option value="" disabled>은행을 선택해주세요</option>
              <option value="nh">농협은행</option>
              <option value="kb">국민은행</option>
              <option value="shinhan">신한은행</option>
              <option value="woori">우리은행</option>
            </select>
            <p className="text-xs text-gray-400 mt-1.5">정산을 받을 은행을 선택해주세요.</p>
          </div>

          {/* 계좌번호 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              계좌번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={businessInfo.accountNumber}
              onChange={(e) => setBusinessInfo({...businessInfo, accountNumber: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
            />
            <p className="text-xs text-gray-400 mt-1.5">선택한 은행의 계좌번호를 입력해주세요.</p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
            >
              저장
            </button>
          </div>
        </form>
      </div>

      {/* 3. 이메일 변경 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-gray-900" />
          <h2 className="text-lg font-bold text-gray-900">이메일 변경</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6 pl-7">이메일을 변경하면 새 이메일로 인증 링크가 발송됩니다.</p>

        <div className="space-y-4 pl-7">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">새 이메일 주소</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
            />
            <p className="text-xs text-gray-400 mt-1.5">새 이메일 주소를 입력하면 인증 이메일이 발송됩니다.</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleEmailChange}
              className="px-6 py-2.5 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
            >
              변경 요청
            </button>
          </div>
        </div>
      </div>

      {/* 4. 비밀번호 변경 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">비밀번호 변경</h2>
        <p className="text-sm text-gray-500 mb-6">비밀번호를 변경하려면 아래 버튼을 사용하세요.</p>

        <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
          <div className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full mt-0.5">소연</div>
          <p className="text-sm text-gray-600 pt-0.5">사용자 메뉴에서 비밀번호를 변경할 수 있습니다.</p>
        </div>
      </div>

      {/* 5. 알림 설정 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-gray-900" />
          <h2 className="text-lg font-bold text-gray-900">알림 설정</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6 pl-7">받고 싶은 알림을 선택하세요.</p>

        <div className="space-y-6 pl-7">
          {/* 새 주문 알림 */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">새 주문 알림</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.newOrder.email}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    newOrder: { ...notifications.newOrder, email: e.target.checked }
                  })}
                  className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                />
                <span className="text-sm text-gray-700">이메일 알림</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.newOrder.push}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    newOrder: { ...notifications.newOrder, push: e.target.checked }
                  })}
                  className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                />
                <span className="text-sm text-gray-700">푸시 알림</span>
              </label>
            </div>
          </div>

          {/* 정산 완료 알림 */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">정산 완료 알림</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.orderComplete.email}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    orderComplete: { ...notifications.orderComplete, email: e.target.checked }
                  })}
                  className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                />
                <span className="text-sm text-gray-700">이메일 알림</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.orderComplete.push}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    orderComplete: { ...notifications.orderComplete, push: e.target.checked }
                  })}
                  className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                />
                <span className="text-sm text-gray-700">푸시 알림</span>
              </label>
            </div>
          </div>

          {/* 문의 답변 알림 */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">문의 답변 알림</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.inquiryReply.email}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    inquiryReply: { ...notifications.inquiryReply, email: e.target.checked }
                  })}
                  className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                />
                <span className="text-sm text-gray-700">이메일 알림</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.inquiryReply.push}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    inquiryReply: { ...notifications.inquiryReply, push: e.target.checked }
                  })}
                  className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                />
                <span className="text-sm text-gray-700">푸시 알림</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNotificationSave}
              className="px-8 py-3 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
            >
              저장
            </button>
          </div>
        </div>
      </div>

      {/* 6. 회원 탈퇴 */}
      <div className="flex justify-center pt-8 pb-4">
        <button
          onClick={() => setIsWithdrawalModalOpen(true)}
          className="text-sm text-red-500 underline decoration-red-300 hover:text-red-600 hover:decoration-red-600 transition-colors font-medium"
        >
          회원 탈퇴
        </button>
      </div>

      {/* 회원 탈퇴 모달 */}
      {isWithdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsWithdrawalModalOpen(false)}
          />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 p-6 transform transition-all scale-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-bold">회원 탈퇴</h2>
              </div>
              <button 
                onClick={() => setIsWithdrawalModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-sm text-red-700 font-medium mb-2">
                  탈퇴 시 유의사항을 확인해주세요.
                </p>
                <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                  <li>탈퇴 시 계정 정보 및 모든 데이터는 복구할 수 없습니다.</li>
                  <li>진행 중인 주문이나 정산이 남아있는 경우 탈퇴가 불가능합니다.</li>
                  <li>보유하신 쿠폰 및 포인트는 모두 소멸됩니다.</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  탈퇴 사유
                </label>
                <select
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="" disabled>사유를 선택해주세요</option>
                  <option value="low_usage">이용 빈도가 낮음</option>
                  <option value="better_alternative">더 나은 서비스 발견</option>
                  <option value="inconvenience">서비스 이용이 불편함</option>
                  <option value="privacy">개인정보 보호 우려</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input 
                  type="checkbox" 
                  checked={withdrawalAgreed}
                  onChange={(e) => setWithdrawalAgreed(e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-600 font-medium">
                  위 유의사항을 모두 확인하였으며 탈퇴에 동의합니다.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsWithdrawalModalOpen(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={!withdrawalAgreed}
                  className={`flex-1 py-3 text-white font-semibold rounded-xl transition-colors shadow-sm ${
                    withdrawalAgreed 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


