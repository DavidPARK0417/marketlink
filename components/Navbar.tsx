"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

const Navbar = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useClerkSupabaseClient();
  const [isApprovedWholesaler, setIsApprovedWholesaler] = useState(false);
  const [wholesalerStatus, setWholesalerStatus] = useState<string | null>(null);

  // 승인된 도매사업자 여부 및 상태 확인
  useEffect(() => {
    const checkWholesalerStatus = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setIsApprovedWholesaler(false);
        setWholesalerStatus(null);
        return;
      }

      try {
        console.log("🔍 [navbar] 도매사업자 승인 상태 확인 시작");

        // 프로필 조회 (wholesalers 관계 포함)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, wholesalers(status)")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError || !profile) {
          console.log("⚠️ [navbar] 프로필 없음 또는 오류:", profileError);
          setIsApprovedWholesaler(false);
          setWholesalerStatus(null);
          return;
        }

        // wholesalers 관계에서 승인 상태 확인
        const wholesalers = profile.wholesalers as Array<{
          status: string;
        }> | null;

        if (wholesalers && wholesalers.length > 0) {
          const wholesaler = wholesalers[0];
          const status = wholesaler.status;
          const isApproved = status === "approved";

          console.log("✅ [navbar] 도매사업자 상태:", {
            status,
            isApproved,
          });

          setIsApprovedWholesaler(isApproved);
          setWholesalerStatus(status);
        } else {
          setIsApprovedWholesaler(false);
          setWholesalerStatus(null);
        }
      } catch (error) {
        console.error("❌ [navbar] 도매사업자 상태 확인 오류:", error);
        setIsApprovedWholesaler(false);
        setWholesalerStatus(null);
      }
    };

    checkWholesalerStatus();
  }, [isLoaded, isSignedIn, user, supabase]);

  // 로고 클릭 핸들러
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // 승인된 도매사업자인 경우 대시보드로 이동
    if (isApprovedWholesaler) {
      console.log("✅ [navbar] 승인된 도매사업자, 대시보드로 이동");
      router.push("/wholesaler/dashboard");
    } else {
      console.log("ℹ️ [navbar] 일반 사용자, 도매 로그인 페이지로 이동");
      router.push("/sign-in/wholesaler");
    }
  };

  // 소매점 페이지에서는 Navbar를 표시하지 않음
  if (pathname?.startsWith("/retailer")) {
    return null;
  }

  // 도매 페이지에서도 Navbar를 표시하지 않음
  if (pathname?.startsWith("/wholesaler")) {
    return null;
  }

  // 관리자 페이지에서도 Navbar를 표시하지 않음
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link
        href={isApprovedWholesaler ? "/wholesaler" : "/"}
        onClick={handleLogoClick}
        className="flex items-center"
      >
        <Image
          src="/farmtobiz_logo.png"
          alt="FarmToBiz"
          width={180}
          height={69}
          className="object-contain"
        />
      </Link>

      {/* 우측 상단: 사용자 아바타 */}
      <div className="flex items-center justify-end">
        {isLoaded && isSignedIn && (
          <>
            <UserButton
              afterSignOutUrl="/sign-in/wholesaler"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
