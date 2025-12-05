"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { LuShield, LuCheck, LuX, LuTriangleAlert } from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";

interface ProfileData {
  id: string;
  clerk_user_id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface UserData {
  id: string;
  profile_id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function AuthTestPage() {
  const { user, isLoaded } = useUser();
  const supabase = useClerkSupabaseClient();

  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Supabase 연결 테스트
  const testConnection = useCallback(async () => {
    try {
      setConnectionStatus("testing");
      setError(null);

      console.log("🔍 [테스트] Supabase 연결 테스트 시작...");

      // 간단한 쿼리로 연결 테스트
      const { error } = await supabase.from("profiles").select("count");

      if (error) throw error;

      console.log("✅ [테스트] Supabase 연결 성공");
      setConnectionStatus("success");
    } catch (err) {
      console.error("❌ [테스트] Supabase 연결 실패:", err);
      setConnectionStatus("error");
      setError(err instanceof Error ? err.message : "연결 테스트 실패");
    }
  }, [supabase]);

  // 사용자 데이터 가져오기 (sync-user API가 생성한 데이터 조회)
  const fetchOrCreateUser = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 [조회] 사용자 데이터 조회 시작...");
      console.log("  - Clerk User ID:", user.id);

      // 1단계: profiles 테이블에서 조회
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) {
        console.error("❌ [조회] profiles 조회 실패:", profileError);

        // 사용자가 없는 경우 (PGRST116)
        if (profileError.code === "PGRST116") {
          throw new Error(
            "프로필을 찾을 수 없습니다. /api/sync-user가 호출되었는지 확인하세요.",
          );
        }
        throw profileError;
      }

      console.log("✅ [조회] profiles 조회 성공:", profile.id);
      setProfileData(profile);

      // 2단계: users 테이블에서 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (userError) {
        console.error("❌ [조회] users 조회 실패:", userError);

        if (userError.code === "PGRST116") {
          throw new Error(
            "사용자 상세 정보를 찾을 수 없습니다. /api/sync-user가 호출되었는지 확인하세요.",
          );
        }
        throw userError;
      }

      console.log("✅ [조회] users 조회 성공:", userData.id);
      setUserData(userData);

      console.log("🎉 [조회] 사용자 데이터 조회 완료!");
    } catch (err) {
      console.error("❌ [조회] 사용자 데이터 조회 실패:", err);
      setError(err instanceof Error ? err.message : "사용자 데이터 조회 실패");

      // 힌트 추가
      if (err instanceof Error && err.message.includes("찾을 수 없습니다")) {
        setError(
          err.message +
            "\n\n💡 해결 방법:\n" +
            "1. SyncUserProvider가 RootLayout에 추가되었는지 확인\n" +
            "2. 로그인 후 자동으로 /api/sync-user가 호출되는지 확인\n" +
            "3. 브라우저 콘솔에서 sync-user 관련 로그 확인",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // 이름 업데이트
  const updateName = async () => {
    if (!profileData || !userData || !newName.trim()) return;

    try {
      setError(null);

      console.log("📝 [업데이트] 이름 업데이트 시작...");

      const { data, error: updateError } = await supabase
        .from("users")
        .update({ name: newName.trim() })
        .eq("profile_id", profileData.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ [업데이트] 이름 업데이트 실패:", updateError);
        throw updateError;
      }

      console.log("✅ [업데이트] 이름 업데이트 성공:", data.name);

      setUserData(data);
      setEditingName(false);
      setNewName("");
    } catch (err) {
      console.error("❌ [업데이트] 이름 업데이트 오류:", err);
      setError(err instanceof Error ? err.message : "이름 업데이트 실패");
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      testConnection();
      fetchOrCreateUser();
    }
  }, [user, isLoaded, testConnection, fetchOrCreateUser]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LuTriangleAlert className="w-16 h-16 text-yellow-500" />
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="text-gray-600">
          인증 연동 테스트를 하려면 먼저 로그인해주세요.
        </p>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-[#10B981] hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">
          Clerk + Supabase 인증 연동 테스트
        </h1>
        <p className="text-gray-600">
          Clerk 인증과 Supabase RLS 정책이 올바르게 작동하는지 테스트합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <LuTriangleAlert className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">에러</h3>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-2 whitespace-pre-line">
              💡 <strong>해결 방법:</strong>
              <br />
              1. Supabase Dashboard에서 <code>profiles</code>와{" "}
              <code>users</code> 테이블이 생성되었는지 확인
              <br />
              2. RLS가 개발 환경에서 비활성화되어 있는지 확인 (ALTER TABLE
              profiles/users DISABLE ROW LEVEL SECURITY)
              <br />
              3. SyncUserProvider가 RootLayout에 추가되었는지 확인
              <br />
              4. 로그인 후 /api/sync-user가 자동으로 호출되는지 브라우저 콘솔
              확인
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="text-red-600"
          >
            닫기
          </Button>
        </div>
      )}

      {/* 연결 상태 */}
      <div className="mb-8 p-6 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Supabase 연결 상태</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={connectionStatus === "testing"}
          >
            {connectionStatus === "testing" ? "테스트 중..." : "다시 테스트"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {connectionStatus === "idle" && (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-600">대기 중</span>
            </>
          )}
          {connectionStatus === "testing" && (
            <>
              <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#10B981]">연결 테스트 중...</span>
            </>
          )}
          {connectionStatus === "success" && (
            <>
              <LuCheck className="w-6 h-6 text-green-600" />
              <span className="text-green-600 font-semibold">연결 성공!</span>
            </>
          )}
          {connectionStatus === "error" && (
            <>
              <LuX className="w-6 h-6 text-red-600" />
              <span className="text-red-600 font-semibold">연결 실패</span>
            </>
          )}
        </div>
      </div>

      {/* Clerk 사용자 정보 */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <LuShield className="w-6 h-6" />
          Clerk 사용자 정보
        </h2>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-semibold min-w-[100px]">User ID:</span>
            <code className="bg-white px-2 py-1 rounded text-sm">
              {user.id}
            </code>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold min-w-[100px]">Email:</span>
            <span>{user.emailAddresses[0]?.emailAddress}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold min-w-[100px]">이름:</span>
            <span>
              {user.fullName ||
                [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                "이름 없음"}
            </span>
          </div>
        </div>
      </div>

      {/* Supabase 사용자 데이터 */}
      <div className="border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-2">
            Supabase 사용자 데이터 (2-Tier 구조)
          </h2>
          <p className="text-sm text-gray-600">
            profiles 테이블: Clerk 인증 정보 + 역할 관리
            <br />
            users 테이블: 상세 프로필 정보 (이름, 전화번호, 아바타 등)
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center text-gray-500">로딩 중...</div>
          ) : profileData && userData ? (
            <div className="space-y-6">
              {/* Profiles 테이블 데이터 */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-emerald-900">
                  📋 Profiles 테이블 (인증 + 역할)
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">
                      Profile ID:
                    </span>
                    <code className="text-sm bg-white px-2 py-1 rounded">
                      {profileData.id}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">
                      Clerk User ID:
                    </span>
                    <code className="text-sm bg-white px-2 py-1 rounded">
                      {profileData.clerk_user_id}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">Email:</span>
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">Role:</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm font-medium">
                      {profileData.role}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        profileData.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {profileData.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">
                      생성 시간:
                    </span>
                    <span className="text-sm">
                      {new Date(profileData.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Users 테이블 데이터 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-green-900">
                  👤 Users 테이블 (상세 프로필)
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">
                      User ID:
                    </span>
                    <code className="text-sm bg-white px-2 py-1 rounded">
                      {userData.id}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">
                      Profile ID (FK):
                    </span>
                    <code className="text-sm bg-white px-2 py-1 rounded">
                      {userData.profile_id}
                    </code>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold min-w-[150px]">이름:</span>
                    {editingName ? (
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="새 이름 입력"
                          className="flex-1 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button size="sm" onClick={updateName}>
                          저장
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingName(false);
                            setNewName("");
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{userData.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingName(true);
                            setNewName(userData.name);
                          }}
                        >
                          수정
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">
                      전화번호:
                    </span>
                    <span>{userData.phone || "미등록"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">아바타:</span>
                    {userData.avatar_url ? (
                      <Image
                        src={userData.avatar_url}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-gray-400">미등록</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[150px]">
                      생성 시간:
                    </span>
                    <span className="text-sm">
                      {new Date(userData.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>사용자 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 설명 */}
      <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h3 className="font-bold mb-2">💡 이 페이지의 작동 원리</h3>
        <ul className="text-sm text-emerald-900 space-y-1 list-disc list-inside">
          <li>Clerk로 인증된 사용자 정보를 가져옵니다</li>
          <li>
            Clerk의 JWT 토큰을 Supabase에 전달합니다 (2025 네이티브 통합 방식)
          </li>
          <li>
            처음 로그인 시 Supabase users 테이블에 사용자 레코드가 자동으로
            생성됩니다
          </li>
          <li>각 사용자는 자신의 데이터만 조회/수정할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
