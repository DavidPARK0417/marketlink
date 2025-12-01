"server-only";

/**
 * @file server.ts
 * @description Clerk + Supabase 네이티브 통합 클라이언트 (Server Component용)
 *
 * 이 파일은 서버 사이드(Server Component, Server Action, API Route)에서 사용하는
 * Clerk 인증이 통합된 Supabase 클라이언트를 제공합니다.
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 * - RLS 정책이 `auth.jwt()->>'sub'`로 Clerk user ID 확인
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = createClerkSupabaseClient();
 *   const { data } = await supabase.from('profiles').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Server Action
 * 'use server';
 *
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export async function updateProfile(data: ProfileData) {
 *   const supabase = createClerkSupabaseClient();
 *   const { error } = await supabase
 *     .from('profiles')
 *     .update(data)
 *     .eq('clerk_user_id', userId);
 *   return { error };
 * }
 * ```
 *
 * @dependencies
 * - @supabase/supabase-js
 * - @clerk/nextjs/server
 *
 * @see {@link ./clerk-client.ts} - 클라이언트 컴포넌트용 인증 클라이언트
 * @see {@link ./client.ts} - 공개 데이터용 기본 클라이언트
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 생성 (Server Component용)
 *
 * 서버 사이드에서 Clerk 인증이 통합된 Supabase 클라이언트를 생성합니다.
 * 현재 로그인한 사용자의 Clerk 토큰을 자동으로 사용하여 RLS 정책을 통과합니다.
 *
 * @returns {SupabaseClient} Clerk 인증이 통합된 Supabase 클라이언트
 *
 * @throws {Error} 환경 변수가 설정되지 않은 경우
 *
 * @example
 * ```tsx
 * // Server Component에서 사용
 * export default async function DashboardPage() {
 *   const supabase = createClerkSupabaseClient();
 *   const { data: profile } = await supabase
 *     .from('profiles')
 *     .select('*')
 *     .single();
 *   return <div>{profile?.email}</div>;
 * }
 * ```
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      const { getToken } = await auth();
      return (await getToken()) ?? null;
    },
  });
}
