/**
 * @file components/wholesaler/Dashboard/RecentOrdersSkeleton.tsx
 * @description 최근 주문 컴포넌트 로딩 스켈레톤
 *
 * 최근 주문 컴포넌트가 로딩 중일 때 표시되는 스켈레톤 UI입니다.
 *
 * @dependencies
 * - components/ui/card.tsx
 * - components/ui/table.tsx
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>주문일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
