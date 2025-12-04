/**
 * @file components/wholesaler/Layout/Sidebar.tsx
 * @description 도매 페이지 사이드바 네비게이션
 *
 * 도매 전용 사이드바 네비게이션 컴포넌트입니다.
 * 현재 경로를 하이라이트하고, 도매 메뉴를 제공합니다.
 *
 * 주요 기능:
 * 1. 도매 메뉴 항목 표시 (대시보드, 상품 관리, 시세 조회, 주문 관리, 정산 관리, 상품 문의)
 * 2. 현재 경로 하이라이트
 * 3. 아이콘과 함께 메뉴 표시
 * 4. 하단 새 상품 등록하기 버튼
 * 5. 하단 사용자 프로필 영역 (아바타, 도매 회원사, 이메일)
 * 6. 하단 로그아웃 버튼
 *
 * @dependencies
 * - @clerk/nextjs (useUser)
 * - next/navigation (usePathname, Link)
 * - lucide-react (아이콘)
 * - lib/utils (cn 함수)
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBusinessNumber } from "@/lib/utils/format";
import { useWholesaler } from "@/hooks/useWholesaler";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  {
    href: "/wholesaler/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
    breakPoint: 2, // "대시"와 "보드" 사이
  },
  {
    href: "/wholesaler/products",
    label: "상품 관리",
    icon: Package,
    breakPoint: 2, // "상품"과 "관리" 사이
  },
  {
    href: "/wholesaler/market-prices",
    label: "시세 조회",
    icon: TrendingUp,
    breakPoint: 2, // "시세"와 "조회" 사이
  },
  {
    href: "/wholesaler/orders",
    label: "주문 관리",
    icon: ShoppingCart,
    breakPoint: 2, // "주문"과 "관리" 사이
  },
  {
    href: "/wholesaler/settlements",
    label: "정산 관리",
    icon: DollarSign,
    breakPoint: 2, // "정산"과 "관리" 사이
  },
  {
    href: "/wholesaler/inquiries",
    label: "상품 문의",
    icon: MessageSquare,
    breakPoint: 2, // "상품"과 "문의" 사이
  },
];

export default function WholesalerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { data: wholesaler, isLoading, error } = useWholesaler();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 클라이언트 사이드 마운트 확인 (Hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 에러 로깅
  useEffect(() => {
    if (error) {
      console.error(
        "❌ [wholesaler-sidebar] 도매점 정보 조회 오류:",
        error instanceof Error ? error.message : JSON.stringify(error, null, 2),
      );
    }
  }, [error]);

  // 사용자 이름의 첫 글자 추출 (아바타 폴백용)
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // 아바타 이미지 URL 또는 null
  const avatarUrl = user?.imageUrl || null;
  const userName = user?.fullName || user?.firstName || null;

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log("🚪 [wholesaler-sidebar] 로그아웃 시작");
      setIsLoggingOut(true);
      await signOut();
      router.push("/sign-in/wholesaler");
      console.log("✅ [wholesaler-sidebar] 로그아웃 완료");
    } catch (error) {
      console.error("❌ [wholesaler-sidebar] 로그아웃 오류:", error);
      setIsLoggingOut(false);
      // 에러가 발생해도 강제로 로그인 페이지로 이동
      router.push("/sign-in/wholesaler");
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="w-16 md:w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300">
        {/* 로고/제목 영역 */}
        <div className="p-2 md:p-4 border-b border-gray-200">
          <Link href="/wholesaler/dashboard" className="block w-full">
            <Image
              src="/farmtobiz_logo.png"
              alt="FarmToBiz"
              width={208}
              height={80}
              className="hidden md:block w-full h-auto object-contain"
              priority
            />
            {/* 모바일용 작은 로고 */}
            <div className="md:hidden flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">F</span>
              </div>
            </div>
          </Link>
        </div>

        {/* 메뉴 네비게이션 */}
        <nav className="flex-1 p-2 md:p-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // 마운트되지 않았으면 모두 비활성화 (서버 사이드 렌더링 시 Hydration 오류 방지)
              // 대시보드는 정확히 일치만 체크, 다른 메뉴는 경로가 시작하는지 체크
              const isActive = mounted
                ? item.href === "/wholesaler/dashboard"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                : false;

              // 줄바꿈 위치 설정 (한글 단어 단위로 줄바꿈)
              // Hydration 오류 방지: mounted 상태 확인 후에만 <wbr /> 사용
              const renderLabel = () => {
                // 마운트되지 않았으면 단순 텍스트만 반환 (서버와 클라이언트 일치)
                if (!mounted) {
                  return item.label;
                }
                
                if (item.breakPoint) {
                  const before = item.label.slice(0, item.breakPoint);
                  const after = item.label.slice(item.breakPoint);
                  return (
                    <>
                      {before}
                      <wbr />
                      {after}
                    </>
                  );
                }
                return item.label;
              };

              const menuLinkContent = (
                <>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden md:inline break-keep">
                    {renderLabel()}
                  </span>
                </>
              );

              const menuLinkClassName = cn(
                "flex items-center justify-center md:justify-start gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50",
              );

              // 모바일에서는 Tooltip 적용, 데스크톱에서는 일반 링크
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={menuLinkClassName}>
                      {menuLinkContent}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="md:hidden">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </nav>

        {/* 하단 영역: 새 상품 등록 + 프로필 + 로그아웃 */}
        <div className="border-t border-gray-200 space-y-2 p-2 md:p-4">
          {/* 새 상품 등록하기 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/wholesaler/products/new"
                className="flex items-center justify-center gap-2 w-full px-2 md:px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                <span className="hidden md:inline break-keep">
                  새 상품
                  <wbr />
                  등록하기
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="md:hidden">
              <p>새 상품 등록하기</p>
            </TooltipContent>
          </Tooltip>

          {/* 프로필 영역 - 하단으로 이동 */}
          {mounted && isLoaded && user && (
            <div className="pt-2 border-t border-gray-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 md:gap-3">
                    {/* 아바타 */}
                    <div className="relative flex-shrink-0">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={userName || "사용자"}
                          width={48}
                          height={48}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm md:text-lg">
                          {getInitials(userName)}
                        </div>
                      )}
                    </div>

                    {/* 사용자 정보 - 데스크톱에서만 표시 */}
                    <div className="hidden md:block flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {isLoading
                          ? "로딩 중..."
                          : wholesaler?.business_name || "도매 회원사"}
                      </p>
                      {wholesaler?.business_number && (
                        <p className="text-xs text-gray-500 truncate">
                          {formatBusinessNumber(wholesaler.business_number)}
                        </p>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="md:hidden">
                  <p className="font-medium">
                    {isLoading
                      ? "로딩 중..."
                      : wholesaler?.business_name || "도매 회원사"}
                  </p>
                  {wholesaler?.business_number && (
                    <p className="text-xs opacity-80">
                      {formatBusinessNumber(wholesaler.business_number)}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full mt-2 px-2 md:px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center md:justify-start gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">
                  {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                </span>
                <span className="md:hidden">
                  {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
