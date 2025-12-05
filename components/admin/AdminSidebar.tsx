/**
 * @file components/admin/AdminSidebar.tsx
 * @description 관리자 페이지 사이드바 네비게이션
 *
 * 관리자 전용 사이드바 네비게이션 컴포넌트입니다.
 * 도매 레이아웃과 동일한 디자인 시스템을 적용했습니다.
 *
 * 주요 기능:
 * 1. 관리자 메뉴 항목 표시
 * 2. 현재 경로 하이라이트 (Green 테마)
 * 3. 로고 영역 (Farm to Biz)
 * 4. 하단 프로필 영역
 * 5. 모바일 메뉴 지원
 *
 * @dependencies
 * - next/navigation (usePathname, useRouter)
 * - lucide-react (아이콘)
 * - @clerk/nextjs (useUser, useClerk)
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  HelpCircle,
  Megaphone,
  MessageCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/wholesalers/pending",
    label: "도매 승인 대기",
    icon: Users,
  },
  {
    href: "/admin/inquiries",
    label: "도매 문의 관리",
    icon: MessageSquare,
  },
  {
    href: "/admin/faqs",
    label: "FAQ 관리",
    icon: HelpCircle,
  },
  {
    href: "/admin/announcements",
    label: "공지사항 관리",
    icon: Megaphone,
  },
  {
    href: "/admin/voc",
    label: "고객의 소리",
    icon: MessageCircle,
  },
  {
    href: "/admin/audit-logs",
    label: "감사 로그",
    icon: FileText,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

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
      console.log("🚪 [admin] 로그아웃 시작");
      setIsLoggingOut(true);
      await signOut();
      router.push("/sign-in");
      console.log("✅ [admin] 로그아웃 완료");
    } catch (error) {
      console.error("❌ [admin] 로그아웃 오류:", error);
      setIsLoggingOut(false);
      router.push("/sign-in");
    }
  };

  // 사용자 이름의 첫 글자 추출
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "A";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const userName = user?.fullName || user?.firstName || "관리자";
  const userInitials = getInitials(userName);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        {/* 로고 영역 */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin/dashboard" className="block w-full">
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

        {/* 메뉴 네비게이션 */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // 대시보드는 정확히 일치만 체크, 다른 메뉴는 경로가 시작하는지 체크
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative overflow-hidden",
                  isActive
                    ? "text-[#10B981] bg-[#10B981]/10"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-[#10B981]"
                      : "text-gray-400 group-hover:text-gray-600",
                  )}
                />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 하단 프로필 영역 */}
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
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      관리자 계정
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

      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm sticky top-0 z-50 backdrop-blur-xl border-b border-gray-100/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Logo */}
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <h1 className="text-lg font-black tracking-tight">
                  <span className="text-[#111827]">Farm</span>
                  <span className="text-[#10B981]">to</span>
                  <span className="text-[#111827]">Biz</span>
                </h1>
                <span className="text-[10px] text-[#6B7280] font-medium">
                  관리자
                </span>
              </div>
            </Link>

            {/* Mobile Menu Button */}
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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-[#10B981] border-t border-white/10">
            <nav className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin/dashboard"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white",
                      isActive ? "bg-white/20" : "hover:bg-white/10",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-white/20 my-2 pt-2">
                {mounted && isUserLoaded && user && (
                  <>
                    <div className="px-4 py-2 text-xs text-white/80">
                      {userName} (관리자)
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 w-full text-left rounded-lg text-white/90 disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
