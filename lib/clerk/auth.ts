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

import { currentUser, auth } from "@clerk/nextjs/server";
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
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error("❌ [auth] getCurrentUser 오류:", error);
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
    const user = await getCurrentUser();

    if (!user) {
      console.log("⚠️ [auth] getUserProfile: 사용자 인증되지 않음");
      return null;
    }

    const supabase = createClerkSupabaseClient();

    // clerk_user_id로 프로필 조회 (retailers, wholesalers 포함)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*, retailers(*), wholesalers(*)")
      .eq("clerk_user_id", user.id)
      .single();

    if (error) {
      console.error("❌ [auth] getUserProfile 오류:", error);
      return null;
    }

    if (!profile) {
      console.log("⚠️ [auth] getUserProfile: 프로필 없음");
      return null;
    }

    return profile as ProfileWithDetails;
  } catch (error) {
    console.error("❌ [auth] getUserProfile 예외:", error);
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
export function redirectByRole(role: UserRole): never {
  switch (role) {
    case "retailer":
      redirect("/retailer/dashboard");
      break;
    case "wholesaler":
      redirect("/wholesaler/dashboard");
      break;
    case "admin":
      redirect("/admin/dashboard");
      break;
    default:
      redirect("/");
  }
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
