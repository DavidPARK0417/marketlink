/**
 * @file components/wholesaler/Layout/Header.tsx
 * @description 도매 페이지 헤더
 *
 * 도매 전용 헤더 컴포넌트입니다.
 * 사용자 정보와 알림 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 페이지 제목 영역 (경로별 동적 표시)
 * 2. 알림 아이콘 (새 주문 알림 표시 및 드롭다운 메뉴)
 * 3. 사용자 드롭다운 메뉴 (Clerk UserButton 사용)
 * 4. 반응형 디자인 (모바일에서 제목 숨김)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton)
 * - next/navigation (usePathname, useRouter)
 * - lucide-react (아이콘)
 * - hooks/use-wholesaler-notifications.ts
 * - lib/utils/format.ts
 */

"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Shield, Package, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserRole } from "@/types/database";
import { useWholesalerNotifications } from "@/hooks/use-wholesaler-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { formatPrice, formatDateTime } from "@/lib/utils/format";

// 경로별 페이지 제목 매핑 (Sidebar의 menuItems와 일관성 유지)
const pageTitleMap: Record<string, string> = {
  "/wholesaler/dashboard": "대시보드",
  "/wholesaler/products": "상품 관리",
  "/wholesaler/market-prices": "시세 조회",
  "/wholesaler/orders": "주문 관리",
  "/wholesaler/settlements": "정산 관리",
  "/wholesaler/inquiries": "문의 관리",
  "/wholesaler/support": "고객 지원",
  "/wholesaler/settings": "설정",
};

interface WholesalerHeaderProps {
  role?: UserRole;
}

export default function WholesalerHeader({ role }: WholesalerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 알림 훅 사용
  const {
    unreadCount,
    recentOrders,
    hasNewNotifications,
    isLoading: isLoadingNotifications,
    markAsRead,
    isMarkingAsRead,
  } = useWholesalerNotifications();

  // 클라이언트 사이드 마운트 확인 (Hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 드롭다운이 열릴 때 읽음 처리
  useEffect(() => {
    if (isDropdownOpen && hasNewNotifications && !isMarkingAsRead) {
      console.log("🔔 [header] 드롭다운 열림 - 읽음 처리 시작");
      markAsRead();
    }
  }, [isDropdownOpen, hasNewNotifications, isMarkingAsRead, markAsRead]);

  // 현재 경로에 따른 페이지 제목 결정
  const getPageTitle = (): string => {
    // 마운트되지 않았으면 기본값 반환 (서버 사이드 렌더링 시 Hydration 오류 방지)
    if (!mounted) {
      return "도매 관리";
    }

    // 대시보드는 정확히 일치해야 함
    if (pathname === "/wholesaler/dashboard") {
      return pageTitleMap["/wholesaler/dashboard"] || "도매 관리";
    }

    // 나머지는 경로가 시작하는지 확인 (하위 경로 포함)
    for (const [path, title] of Object.entries(pageTitleMap)) {
      if (path !== "/wholesaler/dashboard" && pathname.startsWith(path)) {
        return title;
      }
    }

    // 매핑되지 않은 경우 기본값
    return "도매 관리";
  };

  const pageTitle = getPageTitle();

  // 주문 상세 페이지로 이동
  const handleOrderClick = (orderId: string) => {
    router.push(`/wholesaler/orders/${orderId}`);
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      {/* 페이지 제목 영역 */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900 hidden md:block">
          {pageTitle}
        </h2>
        {/* 관리자 배지 - 클릭 가능 */}
        {role === "admin" && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
            title="관리자 페이지로 돌아가기"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>관리자 모드</span>
          </Link>
        )}
      </div>

      {/* 오른쪽 영역: 알림 + 사용자 메뉴 */}
      <div className="flex items-center gap-4">
        {/* 알림 드롭다운 메뉴 */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="알림"
              disabled={isLoadingNotifications}
            >
              <Bell className="w-5 h-5" />
              {/* 알림 배지 (새 알림이 있을 때만 표시) */}
              {hasNewNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>주문 알림</span>
              {unreadCount > 0 && (
                <span className="text-xs font-normal text-red-500">
                  읽지 않음 {unreadCount}개
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingNotifications ? (
              <div className="p-4 text-center text-sm text-gray-500">
                알림을 불러오는 중...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                알림이 없습니다
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {recentOrders.map((order) => (
                  <DropdownMenuItem
                    key={order.id}
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
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDateTime(order.created_at, "default")}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            {recentOrders.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-center justify-center cursor-pointer"
                  onClick={() => {
                    router.push("/wholesaler/orders");
                    setIsDropdownOpen(false);
                  }}
                >
                  모든 주문 보기
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 사용자 드롭다운 메뉴 - 클라이언트 사이드에서만 렌더링 */}
        {mounted && isLoaded && (
          <UserButton
            afterSignOutUrl="/sign-in/wholesaler"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        )}
      </div>
    </header>
  );
}
