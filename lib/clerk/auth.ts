"server-only";

/**
 * @file auth.ts
 * @description Clerk 인증 관련 유틸리티 함수들
 *
 * 이 파일은 서버 사이드에서 Clerk 인증을 사용하는 유틸리티 함수들을 제공합니다.
 * 사용자 프로필 조회, 역할 확인, 인증 검증 등을 포함합니다.
 *
 * @example
 * ```tsx
 * // Server Component에서 사용
 * import { getUserProfile, requireAuth } from '@/lib/clerk/auth';
 *
 * export default async function DashboardPage() {
 *   const profile = await requireAuth();
 *   // 또는
 *   const profile = await getUserProfile();
 *   if (!profile) redirect('/sign-in');
 *
 *   return <div>대시보드</div>;
 * }
 * ```
 *
 * @dependencies
 * - @clerk/nextjs/server
 * - lib/supabase/server.ts
 * - types/database.ts
 *
 * @see {@link ../supabase/server.ts} - Supabase 클라이언트
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import type { Profile } from "@/types/database";
import type { Retailer } from "@/types/database";
import type { Wholesaler } from "@/types/wholesaler";

/**
 * 프로필 정보 타입 (retailers/wholesalers 포함)
 */
export interface ProfileWithDetails extends Profile {
  retailers?: Retailer[];
  wholesalers?: Wholesaler[];
}

/**
 * 현재 Clerk 사용자 정보 조회
 *
 * 서버 사이드에서 현재 로그인한 Clerk 사용자 정보를 가져옵니다.
 * 인증되지 않은 경우 null을 반환합니다.
 *
 * @returns {Promise<User | null>} Clerk 사용자 정보 또는 null
 *
 * @example
 * ```tsx
 * const user = await getCurrentUser();
 * if (!user) {
 *   redirect('/sign-in');
 * }
 * ```
 */
export async function getCurrentUser() {
  try {
    // Clerk 환경 변수 확인
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    if (!clerkPublishableKey || !clerkSecretKey) {
      console.error("❌ [auth] getCurrentUser: Clerk 환경 변수가 설정되지 않았습니다", {
        hasPublishableKey: !!clerkPublishableKey,
        hasSecretKey: !!clerkSecretKey,
      });
      return null;
    }

    console.log("🔍 [auth] getCurrentUser: Clerk 사용자 조회 시작");
    const user = await currentUser();
    
    if (!user) {
      console.log("⚠️ [auth] getCurrentUser: 사용자 인증되지 않음");
      return null;
    }

    console.log("✅ [auth] getCurrentUser: 사용자 조회 성공", {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    });
    
    return user;
  } catch (error) {
    // 에러 타입별 상세 로깅
    if (error instanceof Error) {
      console.error("❌ [auth] getCurrentUser 오류:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
    } else {
      console.error("❌ [auth] getCurrentUser 알 수 없는 오류:", {
        error,
        errorType: typeof error,
        errorString: String(error),
      });
    }
    
    // Clerk API 에러인 경우 추가 정보 로깅
    if (error && typeof error === 'object' && 'status' in error) {
      console.error("❌ [auth] getCurrentUser: Clerk API 에러 상세:", {
        status: (error as any).status,
        statusText: (error as any).statusText,
        data: (error as any).data,
        clerkTraceId: (error as any).clerkTraceId,
      });
    }
    
    return null;
  }
}

/**
 * 사용자 프로필 조회 (Supabase)
 *
 * 현재 로그인한 사용자의 Supabase 프로필 정보를 조회합니다.
 * profiles 테이블과 관련된 retailers/wholesalers 정보도 함께 가져옵니다.
 *
 * @returns {Promise<ProfileWithDetails | null>} 프로필 정보 또는 null
 *
 * @example
 * ```tsx
 * const profile = await getUserProfile();
 * if (!profile) {
 *   redirect('/sign-in');
 * }
 *
 * // 역할 확인
 * if (profile.role === 'wholesaler') {
 *   const wholesaler = profile.wholesalers?.[0];
 * }
 * ```
 */
export async function getUserProfile(): Promise<ProfileWithDetails | null> {
  try {
    console.log("🔍 [auth] getUserProfile 시작");
    const user = await getCurrentUser();

    if (!user) {
      console.log("⚠️ [auth] getUserProfile: 사용자 인증되지 않음");
      return null;
    }

    console.log("✅ [auth] getUserProfile: Clerk 사용자 확인됨", {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    });

    const supabase = createClerkSupabaseClient();

    // clerk_user_id로 프로필 조회 (retailers, wholesalers 포함)
    console.log("🔍 [auth] getUserProfile: Supabase 프로필 조회 시작", {
      clerkUserId: user.id,
    });
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*, retailers(*), wholesalers(*)")
      .eq("clerk_user_id", user.id)
      .single();

    if (error) {
      // PGRST116은 "no rows returned" 에러 (프로필이 없는 경우, 정상)
      if (error.code === "PGRST116") {
        console.log(
          "⚠️ [auth] getUserProfile: 프로필 없음 (정상 - 신규 사용자)",
          { clerkUserId: user.id },
        );
        return null;
      }

      // 다른 에러는 상세 로깅
      console.error("❌ [auth] getUserProfile 오류:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        clerkUserId: user.id,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      });
      return null;
    }

    if (!profile) {
      console.log("⚠️ [auth] getUserProfile: 프로필 없음", {
        clerkUserId: user.id,
      });
      return null;
    }

    console.log("✅ [auth] getUserProfile: 프로필 조회 완료", {
      profileId: profile.id,
      role: profile.role,
      hasWholesalers: !!profile.wholesalers,
      wholesalersCount: profile.wholesalers?.length ?? 0,
      hasRetailers: !!profile.retailers,
      retailersCount: profile.retailers?.length ?? 0,
    });

    return profile as ProfileWithDetails;
  } catch (error) {
    console.error("❌ [auth] getUserProfile 예외:", {
      message: error instanceof Error ? error.message : "알 수 없는 오류",
      stack: error instanceof Error ? error.stack : undefined,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      } : error,
    });
    return null;
  }
}

/**
 * 인증 필수 검증
 *
 * 인증이 필요한 페이지에서 사용합니다.
 * 인증되지 않은 경우 `/sign-in`으로 리다이렉트합니다.
 *
 * @returns {Promise<ProfileWithDetails>} 프로필 정보 (항상 반환됨, 인증 실패 시 리다이렉트)
 *
 * @throws {never} 인증 실패 시 리다이렉트하므로 예외를 던지지 않음
 *
 * @example
 * ```tsx
 * export default async function ProtectedPage() {
 *   const profile = await requireAuth();
 *   // 여기서는 항상 인증된 사용자
 *   return <div>보호된 페이지</div>;
 * }
 * ```
 */
export async function requireAuth(): Promise<ProfileWithDetails> {
  const profile = await getUserProfile();

  if (!profile) {
    console.log("🚫 [auth] requireAuth: 인증 실패, 리다이렉트");
    redirect("/sign-in");
  }

  return profile;
}

/**
 * 사용자 역할 조회
 *
 * 현재 로그인한 사용자의 역할을 조회합니다.
 *
 * @returns {Promise<UserRole | null>} 사용자 역할 또는 null
 *
 * @example
 * ```tsx
 * const role = await getUserRole();
 * if (role === 'wholesaler') {
 *   // 도매 전용 로직
 * }
 * ```
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  return profile?.role ?? null;
}

/**
 * 역할별 리다이렉트
 *
 * 사용자의 역할에 따라 적절한 대시보드로 리다이렉트합니다.
 *
 * @param {UserRole} role - 사용자 역할
 *
 * @example
 * ```tsx
 * const profile = await getUserProfile();
 * if (profile) {
 *   redirectByRole(profile.role);
 * }
 * ```
 */
export function redirectByRole(role: UserRole | null | undefined): never {
  // 역할이 없으면 도매 로그인 페이지로 리다이렉트
  if (!role) {
    console.log(
      "⚠️ [auth] redirectByRole: 역할 없음, 도매 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in/wholesaler");
  }

  switch (role) {
    case "wholesaler":
      redirect("/wholesaler/dashboard");
      break;
    case "admin":
      redirect("/admin/dashboard");
      break;
    case "retailer":
      // 도매 전용 프로젝트이므로 소매 역할은 지원하지 않음
      console.error(
        "❌ [auth] redirectByRole: 소매 역할은 이 프로젝트에서 지원하지 않습니다",
      );
      redirect("/sign-in/wholesaler");
      break;
    default:
      redirect("/sign-in/wholesaler");
  }
}

/**
 * 관리자 권한 필수 검증
 *
 * 관리자 페이지에서 사용합니다.
 * 인증되지 않은 경우 `/sign-in`으로 리다이렉트합니다.
 * 관리자가 아닌 경우 홈(`/`)으로 리다이렉트합니다.
 *
 * @returns {Promise<ProfileWithDetails>} 관리자 프로필 정보 (항상 반환됨, 권한 실패 시 리다이렉트)
 *
 * @throws {never} 권한 실패 시 리다이렉트하므로 예외를 던지지 않음
 *
 * @example
 * ```tsx
 * export default async function AdminPage() {
 *   const profile = await requireAdmin();
 *   // 여기서는 항상 관리자 권한이 있는 사용자
 *   return <div>관리자 페이지</div>;
 * }
 * ```
 */
export async function requireAdmin(): Promise<ProfileWithDetails> {
  // 먼저 인증 확인
  const profile = await requireAuth();

  // 🔍 디버깅: 실제 조회되는 값 확인
  console.log("🔍 [auth] requireAdmin 디버깅:", {
    profileId: profile.id,
    email: profile.email,
    role: profile.role,
    roleType: typeof profile.role,
    roleStringified: JSON.stringify(profile.role),
    isAdmin: profile.role === "admin",
    clerkUserId: profile.clerk_user_id,
  });

  // 관리자 권한 확인
  if (profile.role !== "admin") {
    console.log("🚫 [auth] requireAdmin: 관리자 권한 없음, 홈으로 리다이렉트", {
      actualRole: profile.role,
      expectedRole: "admin",
    });
    redirect("/");
  }

  console.log("✅ [auth] requireAdmin: 관리자 권한 확인됨");
  return profile;
}

/**
 * 소매점 권한 필수 검증
 *
 * 소매점 페이지에서 사용합니다.
 * 인증되지 않은 경우 `/sign-in`으로 리다이렉트합니다.
 * 소매점 또는 관리자가 아닌 경우 홈(`/`)으로 리다이렉트합니다.
 *
 * @returns {Promise<ProfileWithDetails>} 소매점 또는 관리자 프로필 정보 (항상 반환됨, 권한 실패 시 리다이렉트)
 *
 * @throws {never} 권한 실패 시 리다이렉트하므로 예외를 던지지 않음
 *
 * @example
 * ```tsx
 * export default async function RetailerPage() {
 *   const profile = await requireRetailer();
 *   // 여기서는 항상 소매점 또는 관리자 권한이 있는 사용자
 *   return <div>소매점 페이지</div>;
 * }
 * ```
 */
export async function requireRetailer(): Promise<ProfileWithDetails> {
  // 먼저 인증 확인
  const profile = await requireAuth();

  // 소매점 또는 관리자 권한 확인
  if (profile.role !== "retailer" && profile.role !== "admin") {
    console.log(
      "🚫 [auth] requireRetailer: 소매점 또는 관리자 권한 없음, 홈으로 리다이렉트",
    );
    redirect("/");
  }

  console.log(`✅ [auth] requireRetailer: 권한 확인됨 (role: ${profile.role})`);
  return profile;
}

/**
 * 도매점 권한 필수 검증
 *
 * 도매점 페이지에서 사용합니다.
 * 인증되지 않은 경우 `/sign-in`으로 리다이렉트합니다.
 * 도매점 또는 관리자가 아닌 경우 홈(`/`)으로 리다이렉트합니다.
 *
 * @returns {Promise<ProfileWithDetails>} 도매점 또는 관리자 프로필 정보 (항상 반환됨, 권한 실패 시 리다이렉트)
 *
 * @throws {never} 권한 실패 시 리다이렉트하므로 예외를 던지지 않음
 *
 * @example
 * ```tsx
 * export default async function WholesalerPage() {
 *   const profile = await requireWholesaler();
 *   // 여기서는 항상 도매점 또는 관리자 권한이 있는 사용자
 *   return <div>도매점 페이지</div>;
 * }
 * ```
 */
export async function requireWholesaler(): Promise<ProfileWithDetails> {
  // 먼저 인증 확인
  const profile = await requireAuth();

  // 도매점 또는 관리자 권한 확인
  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.log(
      "🚫 [auth] requireWholesaler: 도매점 또는 관리자 권한 없음, 홈으로 리다이렉트",
    );
    redirect("/");
  }

  console.log(
    `✅ [auth] requireWholesaler: 권한 확인됨 (role: ${profile.role})`,
  );
  return profile;
}

/**
 * 역할 확인 및 리다이렉트
 *
 * 현재 사용자의 역할을 확인하고 적절한 대시보드로 리다이렉트합니다.
 * 인증되지 않은 경우 `/sign-in`으로 리다이렉트합니다.
 *
 * @returns {Promise<never>} 항상 리다이렉트하므로 반환하지 않음
 *
 * @example
 * ```tsx
 * // 홈페이지에서 사용
 * export default async function HomePage() {
 *   await checkRoleAndRedirect();
 * }
 * ```
 */
export async function checkRoleAndRedirect(): Promise<never> {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  redirectByRole(profile.role);
}
