/**
 * @file components/wholesaler/Layout/WholesalerLayoutClient.tsx
 * @description 도매 페이지 레이아웃 클라이언트 컴포넌트
 *
 * 디자인 핸드오프 기준으로 새롭게 작성된 레이아웃입니다.
 * 기존 비즈니스 로직(인증, 사용자 정보, 알림 등)을 모두 유지하면서 UI만 디자인 핸드오프 스타일로 교체했습니다.
 *
 * 주요 기능:
 * 1. 사이드바 네비게이션 (데스크톱)
 * 2. 헤더 (검색, 알림, 설정, 고객센터)
 * 3. 모바일 메뉴
 * 4. 사용자 프로필 및 로그아웃
 * 5. TermsModal, PrivacyModal 연동
 *
 * @dependencies
 * - @clerk/nextjs (useUser, useClerk)
 * - hooks/useWholesaler
 * - hooks/use-wholesaler-notifications
 * - components/TermsModal
 * - components/PrivacyModal
 * - components/Footer
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
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
  LogOut,
  HelpCircle,
  Plus,
} from "lucide-react";
import { useWholesaler } from "@/hooks/useWholesaler";
import { useWholesalerNotifications } from "@/hooks/use-wholesaler-notifications";
import Footer from "@/components/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import type { UserRole } from "@/types/database";

interface WholesalerLayoutClientProps {
  children: React.ReactNode;
  role?: UserRole;
}

export default function WholesalerLayoutClient({
  children,
  role,
}: WholesalerLayoutClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"></div>}>
      <WholesalerLayoutContent role={role}>{children}</WholesalerLayoutContent>
    </Suspense>
  );
}

function WholesalerLayoutContent({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { data: wholesaler, isLoading: isLoadingWholesaler } = useWholesaler();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 알림 훅 사용
  const {
    unreadOrdersCount,
    recentOrders,
    unreadInquiriesCount,
    recentInquiries,
    hasNewNotifications,
    totalUnreadCount,
    isLoading: isLoadingNotifications,
    markAsRead,
    isMarkingAsRead,
  } = useWholesalerNotifications();

  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 드롭다운이 열릴 때 읽음 처리
  useEffect(() => {
    if (isDropdownOpen && hasNewNotifications && !isMarkingAsRead) {
      console.log("🔔 [layout] 드롭다운 열림 - 읽음 처리 시작");
      markAsRead();
    }
  }, [isDropdownOpen, hasNewNotifications, isMarkingAsRead, markAsRead]);

  // 모바일 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log("🚪 [layout] 로그아웃 시작");
      setIsLoggingOut(true);
      await signOut();
      router.push("/sign-in/wholesaler");
      console.log("✅ [layout] 로그아웃 완료");
    } catch (error) {
      console.error("❌ [layout] 로그아웃 오류:", error);
      setIsLoggingOut(false);
      router.push("/sign-in/wholesaler");
    }
  };

  // 사용자 이름의 첫 글자 추출 (아바타 폴백용)
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const userName = user?.fullName || user?.firstName || "사용자";
  const userInitials = getInitials(userName);
  const businessName = wholesaler?.business_name || "도매 회원사";

  // 네비게이션 메뉴
  const navigation = [
    { name: "홈", href: "/wholesaler/dashboard", icon: LayoutDashboard },
    { name: "상품 관리", href: "/wholesaler/products", icon: Package },
    { name: "시세 조회", href: "/wholesaler/market-prices", icon: BarChart2 },
    { name: "주문 관리", href: "/wholesaler/orders", icon: ShoppingCart },
    { name: "정산 관리", href: "/wholesaler/settlements", icon: CreditCard },
    {
      name: "상품 문의",
      href: "/wholesaler/inquiries",
      icon: MessageSquare,
    },
  ];

  // 주문 상세 페이지로 이동
  const handleOrderClick = (orderId: string) => {
    router.push(`/wholesaler/orders/${orderId}`);
    setIsDropdownOpen(false);
  };

  // 문의 상세 페이지로 이동
  const handleInquiryClick = (inquiryId: string) => {
    router.push(`/wholesaler/inquiries/${inquiryId}`);
    setIsDropdownOpen(false);
  };

  // 검색어 타입 판별 함수
  const detectSearchType = (query: string): 'order' | 'product' | 'customer' => {
    const trimmed = query.trim();
    
    // 주문번호 패턴: ORD-로 시작하거나 숫자-숫자-숫자-숫자 패턴
    if (/^ORD-/.test(trimmed) || /^\d{4}-\d{2}-\d{2}-\d+/.test(trimmed)) {
      return 'order';
    }
    
    // 기본적으로 상품명으로 간주
    // (고객명은 주문 페이지에서만 검색 가능하므로, 여기서는 상품명으로 처리)
    return 'product';
  };

  // 검색 실행 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    const searchType = detectSearchType(searchQuery);
    const trimmedQuery = searchQuery.trim();
    
    console.log("🔍 [layout-search] 검색 실행", {
      query: trimmedQuery,
      type: searchType,
      currentPath: pathname,
    });
    
    if (searchType === 'order') {
      // 주문번호 검색 → 주문 페이지로 이동
      router.push(`/wholesaler/orders?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      // 상품명 검색 → 상품 페이지로 이동
      router.push(`/wholesaler/products?search=${encodeURIComponent(trimmedQuery)}`);
    }
    
    // 검색 후 입력 필드 초기화 (선택사항)
    // setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-6 border-b border-gray-100">
          <Link href="/wholesaler/dashboard" className="block w-full">
            <Image
              src="/farmtobiz_logo.png"
              alt="FarmToBiz"
              width={208}
              height={80}
              className="w-full h-auto object-contain"
              priority
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const cleanHref = item.href.split("?")[0];

            let isActive = false;
            if (item.href.includes("?")) {
              const targetTab = new URLSearchParams(item.href.split("?")[1]).get(
                "tab",
              );
              const currentTab = searchParams.get("tab");
              isActive = pathname === cleanHref && targetTab === currentTab;
            } else {
              isActive =
                pathname === cleanHref ||
                (cleanHref !== "/wholesaler/dashboard" &&
                  pathname.startsWith(cleanHref + "/"));
            }

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative overflow-hidden ${
                  isActive
                    ? "text-[#10B981] bg-[#10B981]/10"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-[#10B981]"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
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
            className="w-full bg-[#10B981] text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-[#059669] transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 group"
          >
            <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span>상품 등록하기</span>
          </Link>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-100">
            {mounted && isUserLoaded && user && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={userName}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold border border-emerald-100">
                      {userInitials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {isLoadingWholesaler ? "로딩 중..." : businessName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {role === "admin" ? "관리자 계정" : "도매 계정"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg py-2 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-3 h-3" />
                  {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen transition-all duration-300">
        {/* Desktop Header (Search & Utility) */}
        <header className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
              <input
                type="text"
                placeholder="상품, 주문번호, 고객명을 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#10B981] transition-colors" />
            </form>

            <div className="flex items-center gap-4">
              {/* 알림 드롭다운 메뉴 */}
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-colors"
                    aria-label="알림"
                    disabled={isLoadingNotifications}
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5" />
                      {hasNewNotifications && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4"></span>
                      )}
                    </div>
                    <span className="text-sm font-medium">알림</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>알림</span>
                    {totalUnreadCount > 0 && (
                      <span className="text-xs font-normal text-red-500">
                        읽지 않음 {totalUnreadCount}개
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isLoadingNotifications ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      알림을 불러오는 중...
                    </div>
                  ) : recentOrders.length === 0 &&
                    recentInquiries.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      알림이 없습니다
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {/* 주문 알림 섹션 */}
                      {recentOrders.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                            주문 알림
                            {unreadOrdersCount > 0 && (
                              <span className="ml-2 text-red-500">
                                ({unreadOrdersCount})
                              </span>
                            )}
                          </div>
                          {recentOrders.map((order) => (
                            <DropdownMenuItem
                              key={`order-${order.id}`}
                              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                              onClick={() => handleOrderClick(order.id)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-sm">
                                    {order.product.name}
                                  </span>
                                  {!order.is_read && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(order.created_at, "time-only")}
                                </span>
                              </div>
                              <div className="flex items-center justify-between w-full text-xs text-gray-600">
                                <span>주문번호: {order.order_number}</span>
                                <span className="font-medium">
                                  {formatPrice(order.total_amount)}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                          {recentInquiries.length > 0 && (
                            <DropdownMenuSeparator />
                          )}
                        </>
                      )}

                      {/* 문의 알림 섹션 */}
                      {recentInquiries.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                            문의 알림
                            {unreadInquiriesCount > 0 && (
                              <span className="ml-2 text-red-500">
                                ({unreadInquiriesCount})
                              </span>
                            )}
                          </div>
                          {recentInquiries.map((inquiry) => (
                            <DropdownMenuItem
                              key={`inquiry-${inquiry.id}`}
                              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                              onClick={() => handleInquiryClick(inquiry.id)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-sm">
                                    {inquiry.title}
                                  </span>
                                  {inquiry.status === "open" && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(inquiry.created_at, "time-only")}
                                </span>
                              </div>
                              <div className="flex items-center justify-between w-full text-xs text-gray-600">
                                {inquiry.user_anonymous_code && (
                                  <span>문의자: {inquiry.user_anonymous_code}</span>
                                )}
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    inquiry.status === "open"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {inquiry.status === "open" ? "미답변" : "답변완료"}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {(recentOrders.length > 0 || recentInquiries.length > 0) && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="flex gap-2">
                        {recentOrders.length > 0 && (
                          <DropdownMenuItem
                            className="text-center justify-center cursor-pointer flex-1"
                            onClick={() => {
                              router.push("/wholesaler/orders");
                              setIsDropdownOpen(false);
                            }}
                          >
                            모든 주문 보기
                          </DropdownMenuItem>
                        )}
                        {recentInquiries.length > 0 && (
                          <DropdownMenuItem
                            className="text-center justify-center cursor-pointer flex-1"
                            onClick={() => {
                              router.push("/wholesaler/inquiries");
                              setIsDropdownOpen(false);
                            }}
                          >
                            모든 문의 보기
                          </DropdownMenuItem>
                        )}
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2">
                <Link
                  href="/wholesaler/settings"
                  className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">설정</span>
                </Link>
                <Link
                  href="/wholesaler/inquiries"
                  className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">고객센터</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden bg-gradient-to-b from-emerald-50/50 via-white/90 to-white/95 shadow-sm sticky top-0 z-50 backdrop-blur-xl border-b border-gray-100/50 supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Logo */}
              <Link
                href="/wholesaler/dashboard"
                className="flex items-center"
              >
                <Image
                  src="/farmtobiz_logo.png"
                  alt="FarmToBiz"
                  width={120}
                  height={46}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>

              {/* Mobile Search & Menu */}
              <div className="flex items-center gap-1">
                <form onSubmit={handleSearch} className="flex-1 max-w-xs relative mr-2">
                  <input
                    type="text"
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border-0 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:bg-white transition-all"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </form>
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
                    {isLoadingWholesaler ? "로딩 중..." : businessName} (
                    {role === "admin" ? "관리자" : "도매"})
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 w-full text-left rounded-lg text-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
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

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
