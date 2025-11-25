/**
 * @file components/wholesaler/Products/ProductTableSkeleton.tsx
 * @description 상품 테이블 로딩 스켈레톤
 *
 * 상품 목록을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ProductTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이미지</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>가격</TableHead>
            <TableHead>재고</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

