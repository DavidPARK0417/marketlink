/**
 * @file components/wholesaler/Inquiries/InquiryTable.tsx
 * @description 문의 테이블 컴포넌트
 *
 * TanStack Table을 사용한 문의 목록 테이블입니다.
 * 문의 상세 정보는 클릭 시 상세 페이지로 이동합니다.
 *
 * @dependencies
 * - @tanstack/react-table
 * - components/ui/table.tsx
 * - components/wholesaler/Inquiries/InquiryStatusBadge.tsx
 * - lib/utils/format.ts
 */

"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import InquiryStatusBadge from "./InquiryStatusBadge";
import type { InquiryDetail } from "@/types/inquiry";

interface InquiryTableProps {
  inquiries: InquiryDetail[];
  isLoading?: boolean;
  basePath?: string; // 상세 페이지 기본 경로
}

export default function InquiryTable({
  inquiries,
  isLoading = false,
  basePath = "/wholesaler/inquiries", // 기본값은 도매사업자 경로
}: InquiryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  // 컬럼 정의
  const columns: ColumnDef<InquiryDetail>[] = React.useMemo(
    () => [
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-8 px-2 lg:px-3"
            >
              문의일
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.original.created_at;
          return (
            <div className="font-medium">
              {format(new Date(date), "yyyy-MM-dd HH:mm", { locale: ko })}
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "제목",
        cell: ({ row }) => {
          const title = row.original.title;
          const inquiryId = row.original.id;
          return (
            <Link
              href={`${basePath}/${inquiryId}`}
              className="max-w-[300px] truncate font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              {title}
            </Link>
          );
        },
      },
      {
        accessorKey: "user_anonymous_code",
        header: "문의자",
        cell: ({ row }) => {
          const code = row.original.user_anonymous_code;
          return <div className="font-medium">{code || "알 수 없음"}</div>;
        },
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => {
          const status = row.original.status;
          return <InquiryStatusBadge status={status} />;
        },
      },
      {
        id: "actions",
        header: "액션",
        cell: ({ row }) => {
          const inquiry = row.original;
          return (
            <Link href={`${basePath}/${inquiry.id}`}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
                <span className="sr-only">상세보기</span>
              </Button>
            </Link>
          );
        },
      },
    ],
    [basePath], // basePath를 의존성에 추가
  );

  const table = useReactTable({
    data: inquiries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>문의일</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>문의자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  문의가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            이전
          </Button>
          <div className="text-sm text-gray-600">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
