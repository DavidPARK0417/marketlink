/**
 * @file components/admin/CSFilter.tsx
 * @description CS 필터 컴포넌트
 *
 * CS 목록을 상태별, 역할별로 필터링하는 클라이언트 컴포넌트입니다.
 * URL 쿼리 파라미터를 사용하여 필터 상태를 관리합니다.
 *
 * @dependencies
 * - next/navigation (useRouter, useSearchParams)
 * - components/ui/select.tsx
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CsThreadStatus } from "@/types/database";

interface CSFilterProps {
  currentStatus?: CsThreadStatus;
  currentRole?: "wholesaler" | "retailer";
}

export default function CSFilter({
  currentStatus,
  currentRole,
}: CSFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    // 역할 필터는 유지
    if (currentRole) {
      params.set("role", currentRole);
    }

    router.push(`/admin/cs?${params.toString()}`);
  };

  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("role");
    } else {
      params.set("role", value);
    }

    // 상태 필터는 유지
    if (currentStatus) {
      params.set("status", currentStatus);
    }

    router.push(`/admin/cs?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 items-center">
      {/* 상태 필터 */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">상태:</label>
        <Select
          value={currentStatus || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="open">대기중</SelectItem>
            <SelectItem value="bot_handled">봇 처리</SelectItem>
            <SelectItem value="escalated">에스컬레이션</SelectItem>
            <SelectItem value="closed">종료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 역할 필터 */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">역할:</label>
        <Select value={currentRole || "all"} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="wholesaler">도매</SelectItem>
            <SelectItem value="retailer">소매</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

