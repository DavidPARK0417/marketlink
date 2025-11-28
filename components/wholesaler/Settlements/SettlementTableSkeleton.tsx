/**
 * @file components/wholesaler/Settlements/SettlementTableSkeleton.tsx
 * @description 정산 테이블 로딩 스켈레톤
 *
 * 정산 목록을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 *
 * @dependencies
 * - components/ui/table.tsx
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SettlementTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>주문번호</TableHead>
            <TableHead>주문일</TableHead>
            <TableHead>정산 예정일</TableHead>
            <TableHead className="text-right">주문 금액</TableHead>
            <TableHead className="text-right">수수료</TableHead>
            <TableHead className="text-right">정산 금액</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>액션</TableHead>
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
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell className="text-right">
                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell className="text-right">
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell className="text-right">
                <div className="ml-auto h-4 w-24 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
