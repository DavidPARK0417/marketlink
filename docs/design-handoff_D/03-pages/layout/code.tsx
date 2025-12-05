'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode, useState, Suspense } from 'react';
import TermsModal from '@/components/TermsModal';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Settings,
  Menu,
  X,
  User,
  Bell,
  Search,
  BarChart2,
  ChevronDown,
  LogOut,
  HelpCircle,
  Plus,
} from 'lucide-react';

export default function WholesalerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"></div>}>
      <WholesalerLayoutContent>{children}</WholesalerLayoutContent>
    </Suspense>
  );
}

function WholesalerLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  const navigation = [
    { name: '홈', href: '/wholesaler/dashboard', icon: LayoutDashboard },
    { name: '상품 관리', href: '/wholesaler/products', icon: Package },
    { name: '시세 조회', href: '/wholesaler/market-prices', icon: BarChart2 },
    { name: '주문 관리', href: '/wholesaler/orders', icon: ShoppingCart },
    { name: '정산 관리', href: '/wholesaler/settlements', icon: CreditCard },
    { name: '상품 문의', href: '/wholesaler/cs?tab=product', icon: MessageSquare },
    { name: '마이페이지', href: '/wholesaler/settings', icon: User },
  ];

  // 마이페이지 메뉴 제외 (헤더로 이동)
  const mainNavigation = navigation.filter(item => item.name !== '마이페이지');

  const termsContent = (
    <div className="space-y-6">
      {/* ... Terms Content (Same as source) ... */}
      <p>이용약관 내용은 생략 (Source file 참조)</p>
    </div>
  );

  const privacyContent = (
    <div className="space-y-6">
      {/* ... Privacy Content (Same as source) ... */}
       <p>개인정보처리방침 내용은 생략 (Source file 참조)</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-6 border-b border-gray-100">
          <Link href="/wholesaler/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex flex-col -space-y-0.5">
              <h1 className="text-xl font-black tracking-tight">
                <span className="text-[#111827]">Farm</span>
                <span className="text-[#10B981]">to</span>
                <span className="text-[#111827]">Biz</span>
              </h1>
              <span className="text-[10px] text-[#6B7280] font-medium">신선한 농산물 직거래</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {mainNavigation.map((item) => {
            const cleanHref = item.href.split('?')[0];
            
            let isActive = false;
            if (item.href.includes('?')) {
              const targetTab = new URLSearchParams(item.href.split('?')[1]).get('tab');
              const currentTab = searchParams.get('tab');
              isActive = pathname === cleanHref && targetTab === currentTab;
            } else {
              isActive = pathname === cleanHref || (cleanHref !== '/wholesaler/dashboard' && pathname.startsWith(cleanHref + '/'));
            }

            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'text-[#10B981] bg-[#10B981]/10' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#10B981]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-6">
          <Link
            href="/wholesaler/products/new"
            className="w-full bg-blue-600 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 group"
          >
            <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span>상품 등록하기</span>
          </Link>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold border border-emerald-100">
                K
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">김농부님</p>
                <p className="text-xs text-gray-500">Master 계정</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg py-2 hover:bg-gray-50 hover:text-red-600 transition-colors">
              <LogOut className="w-3 h-3" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen transition-all duration-300">
        {/* Desktop Header (Search & Utility) */}
        <header className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl relative group">
              <input
                type="text"
                placeholder="상품, 주문번호, 고객명을 검색해보세요"
                className="w-full bg-gray-50 border-0 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#10B981] transition-colors" />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-colors">
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4"></span>
                </div>
                <span className="text-sm font-medium">알림</span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2">
                <Link href="/wholesaler/settings" className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">설정</span>
                </Link>
                <Link href="/wholesaler/cs?tab=inquiry" className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-colors">
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">고객센터</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

      {/* Mobile Header (Styled like Desktop) */}
      <header className="lg:hidden bg-gradient-to-b from-emerald-50/50 via-white/90 to-white/95 shadow-sm sticky top-0 z-50 backdrop-blur-xl border-b border-gray-100/50 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Logo */}
            <Link href="/wholesaler/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="flex flex-col -space-y-0.5">
                 <h1 className="text-lg font-black tracking-tight">
                  <span className="text-[#111827]">Farm</span>
                  <span className="text-[#10B981]">to</span>
                  <span className="text-[#111827]">Biz</span>
                </h1>
                <span className="text-[10px] text-[#6B7280] font-medium">신선한 농산물 직거래</span>
              </div>
            </Link>

            {/* Mobile Search & Menu */}
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-600 hover:text-[#10B981] transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-[#10B981] transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-[#10B981] border-t border-white/10">
            <nav className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <div className="border-t border-white/20 my-2 pt-2">
                <div className="px-4 py-2 text-xs text-white/80">
                  김농부님 (Master)
                </div>
                <button className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 w-full text-left rounded-lg text-white/90">
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 - 반응형 패딩 */}
      <main className="w-full px-4 lg:px-8 py-6 lg:py-8 flex-1 max-w-[1920px] mx-auto overflow-x-hidden bg-white">
        {children}
      </main>

      {/* 푸터 - Blended with Page */}
      <footer className="bg-gradient-to-b from-[#F8F9FA] to-gray-100 mt-12 pt-12 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* 구분선 효과 (Gradient Line) */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-[#10B981] mb-4">Farm to Biz</h3>
              <div className="text-sm text-gray-500 space-y-1">
                <p><span className="font-semibold">상호명:</span> 신선농산 도매</p>
                <p><span className="font-semibold">대표자:</span> 김농부</p>
                <p><span className="font-semibold">사업자등록번호:</span> 123-45-67890</p>
                <p><span className="font-semibold">주소:</span> 서울특별시 강남구 테헤란로 123, 4층</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">고객센터</h4>
              <div className="text-sm text-gray-500 space-y-1">
                <p className="text-lg font-bold text-[#10B981]">1588-0000</p>
                <p>평일 09:00 - 18:00</p>
                <p>점심 12:00 - 13:00</p>
                <p>(주말 및 공휴일 휴무)</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4">바로가기</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <button onClick={() => setActiveModal('terms')} className="text-left hover:text-[#10B981] transition-colors">이용약관</button>
                <button onClick={() => setActiveModal('privacy')} className="text-left hover:text-[#10B981] transition-colors">개인정보처리방침</button>
                <Link href="#" className="hover:text-[#10B981] transition-colors">입점문의</Link>
                <Link href="#" className="hover:text-[#10B981] transition-colors">공지사항</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
            <p>© 2024 Farm to Biz. All rights reserved.</p>
            <div className="mt-2 md:mt-0">
              Designed by FarmToBiz Team
            </div>
          </div>
        </div>
      </footer>

      <TermsModal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="이용약관"
        content={termsContent}
      />
      
      <TermsModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="개인정보처리방침"
        content={privacyContent}
      />
      </div>
    </div>
  );
}


