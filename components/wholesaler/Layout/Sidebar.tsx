/**
 * @file components/wholesaler/Layout/Sidebar.tsx
 * @description 도매 페이지 사이드바 네비게이션
 *
 * 도매 전용 사이드바 네비게이션 컴포넌트입니다.
 * 현재 경로를 하이라이트하고, 도매 메뉴를 제공합니다.
 *
 * 주요 기능:
 * 1. 도매 메뉴 항목 표시
 * 2. 현재 경로 하이라이트
 * 3. 아이콘과 함께 메뉴 표시
 *
 * @dependencies
 * - next/navigation (usePathname, Link)
 * - lucide-react (아이콘)
 * - lib/utils (cn 함수)
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/wholesaler/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/wholesaler/products",
    label: "상품 관리",
    icon: Package,
  },
  {
    href: "/wholesaler/market-prices",
    label: "시세 조회",
    icon: TrendingUp,
  },
  {
    href: "/wholesaler/orders",
    label: "주문 관리",
    icon: ShoppingCart,
  },
  {
    href: "/wholesaler/settlements",
    label: "정산 관리",
    icon: DollarSign,
  },
  {
    href: "/wholesaler/inquiries",
    label: "문의 관리",
    icon: MessageSquare,
  },
];

export default function WholesalerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* 로고/제목 영역 */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">도매 관리</h1>
      </div>

      {/* 메뉴 네비게이션 */}
      <nav className="flex-1 p-4">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // 대시보드는 정확히 일치만 체크, 다른 메뉴는 경로가 시작하는지 체크
            const isActive =
              item.href === "/wholesaler/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 하단 홈 링크 */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>홈으로</span>
        </Link>
      </div>
    </aside>
  );
}
