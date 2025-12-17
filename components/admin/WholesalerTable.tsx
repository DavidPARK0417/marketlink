/**
 * @file components/admin/WholesalerTable.tsx
 * @description 도매사업자 테이블 클라이언트 컴포넌트
 *
 * 도매 승인 대기 목록을 표시하는 클라이언트 컴포넌트입니다.
 * 로딩 상태일 때 스켈레톤을 표시합니다.
 */

"use client";

import WholesalerTableRow from "@/components/admin/WholesalerTableRow";
import WholesalerTableSkeleton from "@/components/admin/WholesalerTableSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";

interface PendingWholesaler {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  created_at: string;
  profiles: {
    email: string;
  }[];
}

interface WholesalerTableProps {
  wholesalers: PendingWholesaler[];
  isLoading?: boolean;
}

export default function WholesalerTable({
  wholesalers,
  isLoading = false,
}: WholesalerTableProps) {
  if (isLoading) {
    return <WholesalerTableSkeleton />;
  }

  if (!wholesalers || wholesalers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <EmptyState
            message="승인 대기 중인 도매사업자가 없습니다"
            description="현재 승인 대기 상태인 도매사업자가 없습니다. 새로운 신청이 들어오면 여기에 표시됩니다."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-200">
      {/* 데스크톱 테이블 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                상호명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                사업자번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                대표자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                신청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {wholesalers.map((wholesaler) => {
              // 타입 안전성을 위해 타입 단언
              const wholesalerData = wholesaler as unknown as PendingWholesaler;
              const profileData =
                Array.isArray(wholesalerData.profiles) &&
                wholesalerData.profiles.length > 0
                  ? wholesalerData.profiles[0]
                  : null;

              return (
                <WholesalerTableRow
                  key={wholesalerData.id}
                  id={wholesalerData.id}
                  business_name={wholesalerData.business_name}
                  business_number={wholesalerData.business_number}
                  representative={wholesalerData.representative}
                  email={profileData?.email || null}
                  created_at={wholesalerData.created_at}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {wholesalers.map((wholesaler) => {
          const wholesalerData = wholesaler as unknown as PendingWholesaler;
          const profileData =
            Array.isArray(wholesalerData.profiles) &&
            wholesalerData.profiles.length > 0
              ? wholesalerData.profiles[0]
              : null;

          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(date);
          };

          return (
            <div
              key={wholesalerData.id}
              onClick={() => {
                window.location.href = `/admin/wholesalers/${wholesalerData.id}`;
              }}
              className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground dark:text-foreground">
                  {wholesalerData.business_name}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground dark:text-muted-foreground mb-1">
                      사업자번호
                    </div>
                    <div className="text-foreground dark:text-foreground">
                      {wholesalerData.business_number}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground dark:text-muted-foreground mb-1">
                      대표자
                    </div>
                    <div className="text-foreground dark:text-foreground">
                      {wholesalerData.representative}
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground dark:text-muted-foreground mb-1">
                    이메일
                  </div>
                  <div className="text-foreground dark:text-foreground">
                    {profileData?.email || "-"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {formatDate(wholesalerData.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

