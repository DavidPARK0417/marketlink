/**
 * @file components/admin/AdminSidebar.tsx
 * @description 관리자 페이지 사이드바 네비게이션
 *
 * 관리자 전용 사이드바 네비게이션 컴포넌트입니다.
 * 현재 경로를 하이라이트하고, 관리자 메뉴를 제공합니다.
 *
 * 주요 기능:
 * 1. 관리자 메뉴 항목 표시
 * 2. 현재 경로 하이라이트
 * 3. 아이콘과 함께 메뉴 표시
 *
 * @dependencies
 * - next/navigation (usePathname)
 * - lucide-react (아이콘)
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Home,
  HelpCircle,
  Megaphone,
  MessageCircle,
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

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* 로고/제목 영역 */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">관리자 페이지</h1>
      </div>

      {/* 메뉴 네비게이션 */}
      <nav className="flex-1 p-4">
        <div className="flex flex-col gap-2">
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
