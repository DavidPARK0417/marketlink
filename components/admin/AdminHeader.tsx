/**
 * @file components/admin/AdminHeader.tsx
 * @description 관리자 페이지 헤더 (간소화 버전)
 *
 * 관리자 전용 헤더 컴포넌트입니다.
 * 프로필 정보만 표시하는 간소화된 버전입니다.
 *
 * 주요 기능:
 * 1. 사용자 드롭다운 메뉴 (Clerk UserButton 사용)
 * 2. 반응형 디자인 (모바일에서는 사이드바에 포함)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton, useUser)
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import {
  Menu,
  Search,
  X,
  Bell,
  Users,
  MessageSquare,
  MessageSquareDashed,
  Clock,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { formatDateTime } from "@/lib/utils/format";

const menuItems = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/wholesalers/pending", label: "도매 승인 대기" },
  { href: "/admin/inquiries", label: "도매 문의 관리" },
  { href: "/admin/faqs", label: "FAQ 관리" },
  { href: "/admin/announcements", label: "공지사항 관리" },
  { href: "/admin/audit-logs", label: "감사 로그" },
];

export default function AdminHeader() {
  const { isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  // 알림 훅 사용
  const {
    stats,
    recentPendingWholesalers,
    recentWholesalerInquiries,
    recentRetailInquiries,
    hasNewNotifications,
    isLoading: isLoadingNotifications,
    handleNotificationClick,
  } = useAdminNotifications();

  // 클라이언트 사이드 마운트 확인 (Hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색어 패턴 감지 (도매 헤더 패턴과 유사하게 구성)
  const detectSearchType = (query: string) => {
    const trimmed = query.trim();
    if (/^\d{3}-\d{2}-\d{5}$/.test(trimmed) || /^\d{10,12}$/.test(trimmed)) {
      return "wholesaler";
    }
    if (/공지|announcement|notice/i.test(trimmed)) return "announcement";
    if (/faq/i.test(trimmed)) return "faq";
    if (/로그|audit/i.test(trimmed)) return "audit";
    return "inquiry";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const type = detectSearchType(trimmed);
    const target =
      type === "wholesaler"
        ? `/admin/wholesalers/pending?search=${encodeURIComponent(trimmed)}`
        : type === "announcement"
          ? `/admin/announcements?search=${encodeURIComponent(trimmed)}`
          : type === "faq"
            ? `/admin/faqs?search=${encodeURIComponent(trimmed)}`
          : type === "audit"
                ? `/admin/audit-logs?search=${encodeURIComponent(trimmed)}`
                : `/admin/inquiries?search=${encodeURIComponent(trimmed)}`;

    console.log("🔍 [admin-header-search] 검색 실행", { query: trimmed, type, target });
    router.push(target);
  };

  const toggleMobileMenu = () => {
    console.log("📱 [admin-header] 모바일 메뉴 토글", { next: !isMobileMenuOpen });
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 [admin-header] 로그아웃 시작");
      await signOut();
      console.log("✅ [admin-header] 로그아웃 완료");
      router.push("/sign-in");
    } catch (error) {
      console.error("❌ [admin-header] 로그아웃 오류", error);
    }
  };

  return (
    <header className="flex w-full sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-16 items-center justify-between px-4 sm:px-5 md:px-6 lg:px-8 gap-3">
      {/* 좌측/중앙: 검색창 */}
      <form
        onSubmit={handleSearch}
        className="flex-1 relative group"
      >
        <input
          type="text"
          placeholder="사업자번호, 문의, 공지, FAQ 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:bg-white dark:focus:bg-gray-700 transition-all"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#10B981]" />
      </form>

      {/* 우측: 알림 + 메뉴 + 사용자 */}
      <div className="relative flex items-center justify-end gap-2">
        {/* 알림 드롭다운 메뉴 */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="알림"
              disabled={isLoadingNotifications}
            >
              <Bell className="w-5 h-5" />
              <span className="hidden md:inline text-sm">알림</span>
              {/* 알림 배지 (새 알림이 있을 때만 표시) */}
              {hasNewNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 overflow-x-hidden overflow-y-hidden">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>알림</span>
              {stats.totalCount > 0 && (
                <span className="text-xs font-normal text-red-500 dark:text-red-400">
                  읽지 않음 {stats.totalCount}개
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingNotifications ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                알림을 불러오는 중...
              </div>
            ) : stats.totalCount === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                알림이 없습니다
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto overflow-x-hidden">
                {/* 도매 승인 대기 섹션 */}
                {recentPendingWholesalers.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      도매 승인 대기
                      {stats.pendingWholesalersCount > 0 && (
                        <span className="ml-2 text-red-500 dark:text-red-400">
                          ({stats.pendingWholesalersCount})
                        </span>
                      )}
                    </div>
                    {recentPendingWholesalers.map((wholesaler) => (
                      <DropdownMenuItem
                        key={`pending-${wholesaler.id}`}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer min-w-0"
                        onClick={() => {
                          handleNotificationClick("pending-wholesaler", wholesaler.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full min-w-0 gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {wholesaler.business_name}
                            </span>
                            <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full shrink-0"></span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {formatDateTime(wholesaler.created_at, "time-only")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400 gap-2 min-w-0">
                          <span className="truncate">대표자: {wholesaler.representative}</span>
                          <span className="truncate shrink-0">사업자번호: {wholesaler.business_number}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDateTime(wholesaler.created_at, "default")}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {(recentWholesalerInquiries.length > 0 ||
                      recentRetailInquiries.length > 0) && (
                      <DropdownMenuSeparator />
                    )}
                  </>
                )}

                {/* 도매 문의 섹션 */}
                {recentWholesalerInquiries.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      도매 문의
                      {stats.wholesalerInquiriesCount > 0 && (
                        <span className="ml-2 text-red-500 dark:text-red-400">
                          ({stats.wholesalerInquiriesCount})
                        </span>
                      )}
                    </div>
                    {recentWholesalerInquiries.map((inquiry) => (
                      <DropdownMenuItem
                        key={`wholesaler-inquiry-${inquiry.id}`}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer min-w-0"
                        onClick={() => {
                          handleNotificationClick("wholesaler-inquiry", inquiry.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full min-w-0 gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                            <span className="font-medium text-sm truncate">{inquiry.title}</span>
                            <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full shrink-0"></span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {formatDateTime(inquiry.created_at, "time-only")}
                          </span>
                        </div>
                        {inquiry.business_name && (
                          <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400 min-w-0">
                            <span className="truncate">도매점: {inquiry.business_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDateTime(inquiry.created_at, "default")}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {recentRetailInquiries.length > 0 && <DropdownMenuSeparator />}
                  </>
                )}

                {/* 소매 문의 섹션 */}
                {recentRetailInquiries.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      소매 문의
                      {stats.retailInquiriesCount > 0 && (
                        <span className="ml-2 text-red-500 dark:text-red-400">
                          ({stats.retailInquiriesCount})
                        </span>
                      )}
                    </div>
                    {recentRetailInquiries.map((inquiry) => (
                      <DropdownMenuItem
                        key={`retail-inquiry-${inquiry.id}`}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer min-w-0"
                        onClick={() => {
                          handleNotificationClick("retail-inquiry", inquiry.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full min-w-0 gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquareDashed className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                            <span className="font-medium text-sm truncate">{inquiry.title}</span>
                            <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full shrink-0"></span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {formatDateTime(inquiry.created_at, "time-only")}
                          </span>
                        </div>
                        {inquiry.user_anonymous_code && (
                          <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400 min-w-0">
                            <span className="truncate">문의자: {inquiry.user_anonymous_code}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDateTime(inquiry.created_at, "default")}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 text-gray-600 hover:text-[#10B981] transition-colors"
          aria-label="메뉴"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="hidden sm:flex">
          {mounted && isLoaded && <UserButton afterSignOutUrl="/sign-in" />}
        </div>

        {isMobileMenuOpen && (
          <div className="absolute right-0 top-full translate-y-2 w-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
            <nav className="flex flex-col gap-1 p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                로그아웃
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

