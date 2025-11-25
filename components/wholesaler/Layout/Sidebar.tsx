/**
 * @file components/wholesaler/Layout/Sidebar.tsx
 * @description 도매 페이지 사이드바 네비게이션
 *
 * 도매 전용 사이드바 네비게이션 컴포넌트입니다.
 * 현재 경로를 하이라이트하고, 도매 메뉴를 제공합니다.
 *
 * 주요 기능:
 * 1. 사용자 프로필 영역 표시 (아바타, 도매 회원사, 이메일)
 * 2. 도매 메뉴 항목 표시
 * 3. 현재 경로 하이라이트
 * 4. 아이콘과 함께 메뉴 표시
 * 5. 하단 새 상품 등록하기 버튼
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
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

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
  {
    href: "/wholesaler/settings",
    label: "설정",
    icon: Settings,
  },
];

export default function WholesalerSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const supabase = useClerkSupabaseClient();
  const [businessName, setBusinessName] = useState<string | null>(null);

  // 도매회원사 상호명 조회
  useEffect(() => {
    const fetchBusinessName = async () => {
      if (!user || !isLoaded) return;

      try {
        console.log("🔍 [wholesaler-sidebar] 상호명 조회 시작");

        // 프로필 조회
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError || !profile) {
          console.error(
            "❌ [wholesaler-sidebar] 프로필 조회 오류:",
            profileError,
          );
          return;
        }

        // wholesaler 정보 조회
        const { data: wholesaler, error: wholesalerError } = await supabase
          .from("wholesalers")
          .select("business_name")
          .eq("profile_id", profile.id)
          .single();

        if (wholesalerError || !wholesaler) {
          console.error(
            "❌ [wholesaler-sidebar] 도매점 정보 조회 오류:",
            wholesalerError,
          );
          return;
        }

        console.log(
          "✅ [wholesaler-sidebar] 상호명 조회 완료:",
          wholesaler.business_name,
        );
        setBusinessName(wholesaler.business_name);
      } catch (error) {
        console.error("❌ [wholesaler-sidebar] 상호명 조회 예외:", error);
      }
    };

    fetchBusinessName();
  }, [user, isLoaded, supabase]);

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
  const userEmail = user?.primaryEmailAddress?.emailAddress || null;

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* 로고/제목 영역 */}
      <div className="p-4 border-b border-gray-200">
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

      {/* 사용자 프로필 영역 */}
      {isLoaded && user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* 아바타 */}
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName || "사용자"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                  {getInitials(userName)}
                </div>
              )}
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {businessName || "도매 회원사"}
              </p>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 네비게이션 */}
      <nav className="flex-1 p-4 overflow-y-auto">
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

      {/* 하단 새 상품 등록하기 버튼 */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/wholesaler/products/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>새 상품 등록하기</span>
        </Link>
      </div>
    </aside>
  );
}
