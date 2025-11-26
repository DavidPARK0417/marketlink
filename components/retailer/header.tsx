/**
 * @file components/retailer/header.tsx
 * @description 소매점 헤더 컴포넌트
 *
 * 소매점 페이지의 상단 헤더를 제공합니다.
 * 로고, 네비게이션 링크, 사용자 메뉴를 포함합니다.
 *
 * 주요 기능:
 * 1. 로고 표시 (FarmToBiz)
 * 2. 주요 페이지 네비게이션 링크
 * 3. 사용자 메뉴 (Clerk UserButton)
 * 4. 로그아웃 기능 (UserButton 내장)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton)
 * - next/link (Link)
 * - next/image (Image)
 * - next/navigation (usePathname)
 * - lucide-react (아이콘)
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, Search, ShoppingCart, ClipboardList } from "lucide-react";
import { CommandPalette } from "./command-palette";

// 네비게이션 링크 정의
const navLinks = [
  {
    href: "/retailer/dashboard",
    label: "대시보드",
    icon: Home,
  },
  {
    href: "/retailer/orders",
    label: "주문내역",
    icon: ClipboardList,
  },
  {
    href: "/retailer/products",
    label: "상품",
    icon: Search,
  },
  {
    href: "/retailer/cart",
    label: "장바구니",
    icon: ShoppingCart,
  },
];

export default function RetailerHeader() {
  const pathname = usePathname();

  // 현재 경로가 네비게이션 링크와 일치하는지 확인
  const isActive = (href: string) => {
    if (href === "/retailer/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      <CommandPalette />
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link href="/retailer/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="FarmToBiz"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xl font-bold text-green-600 hidden sm:inline">
                FarmToBiz
              </span>
            </Link>

          {/* 네비게이션 링크 + 사용자 메뉴 - 데스크톱 */}
          <div className="hidden md:flex items-center gap-4">
            {/* 네비게이션 링크 */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 사용자 메뉴 */}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>

          {/* 사용자 메뉴만 - 모바일 (네비게이션은 하단에) */}
          <div className="md:hidden flex items-center">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        </div>

        {/* 네비게이션 링크 - 모바일 */}
        <nav className="md:hidden flex items-center justify-around py-2 border-t border-gray-200 dark:border-gray-700 -mx-4 px-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
    </>
  );
}
