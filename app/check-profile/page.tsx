/**
 * @file app/check-profile/page.tsx
 * @description 프로필 확인 페이지 (디버깅용)
 * 
 * 현재 로그인한 사용자의 프로필 정보를 확인하는 페이지입니다.
 */

import Link from "next/link";
import { getUserProfile } from "@/lib/clerk/auth";

// 인증 확인이 필요한 페이지이므로 동적 렌더링 강제
export const dynamic = "force-dynamic";

export default async function CheckProfilePage() {
  const profile = await getUserProfile();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ❌ 프로필 없음
          </h1>
          <p className="text-gray-600">로그인된 사용자를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🔍 프로필 정보 확인
        </h1>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              기본 정보
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">ID:</span>{" "}
                <span className="text-gray-900">{profile.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>{" "}
                <span className="text-gray-900">{profile.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Clerk ID:</span>{" "}
                <span className="text-gray-900">{profile.clerk_user_id}</span>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              역할 정보
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Role:</span>{" "}
                <span
                  className={`text-lg font-bold ${
                    profile.role === "admin"
                      ? "text-green-600"
                      : profile.role === "wholesaler"
                      ? "text-[#10B981]"
                      : profile.role === "retailer"
                      ? "text-purple-600"
                      : "text-red-600"
                  }`}
                >
                  {profile.role || "NULL"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>{" "}
                <span className="text-gray-900">{profile.status}</span>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              타입 정보
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">
                  Role Type:
                </span>{" "}
                <span className="text-gray-900">{typeof profile.role}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Role JSON:
                </span>{" "}
                <span className="text-gray-900">
                  {JSON.stringify(profile.role)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Is Admin:
                </span>{" "}
                <span
                  className={`font-bold ${
                    profile.role === "admin"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {String(profile.role === "admin")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              날짜 정보
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Created:</span>{" "}
                <span className="text-gray-900">{profile.created_at}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Updated:</span>{" "}
                <span className="text-gray-900">{profile.updated_at}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {profile.role === "admin" ? (
            <>
              <a
                href="/admin"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
              >
                ✅ 관리자 대시보드로 이동
              </a>
              <p className="text-sm text-green-600 text-center">
                관리자 권한이 확인되었습니다!
              </p>
            </>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">
                  ⚠️ 관리자 권한이 없습니다
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  현재 role: <strong>{profile.role || "NULL"}</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  관리자 권한이 필요하면 Supabase에서 role을 &apos;admin&apos;으로
                  변경해주세요.
                </p>
              </div>
            </>
          )}

          <Link
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

