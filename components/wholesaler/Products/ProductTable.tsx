/**
 * @file components/wholesaler/Products/ProductTable.tsx
 * @description 상품 테이블 컴포넌트
 *
 * TanStack Table을 사용한 상품 목록 테이블입니다.
 *
 * 주요 기능:
 * 1. 상품 목록 표시
 * 2. 정렬 기능
 * 3. 페이지네이션
 * 4. 활성화/비활성화 토글
 * 5. 필터링 UI
 * 6. 상품 삭제
 *
 * @dependencies
 * - @tanstack/react-table
 * - components/ui/table.tsx
 * - components/ui/select.tsx
 * - components/ui/tabs.tsx
 * - components/ui/input.tsx
 * - components/ui/badge.tsx
 * - components/ui/button.tsx
 * - components/ui/dialog.tsx
 * - actions/wholesaler/toggle-product-active.ts
 * - actions/wholesaler/delete-product.ts
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Edit, Eye, EyeOff, ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import type { GetProductsResult } from "@/lib/supabase/queries/products";
import { toggleProductActive } from "@/actions/wholesaler/toggle-product-active";
import { deleteProduct } from "@/actions/wholesaler/delete-product";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  initialData: GetProductsResult;
  initialFilters: {
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

/**
 * 상품 테이블 컴포넌트
 */
export function ProductTable({ initialData, initialFilters }: ProductTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>(
    initialFilters.sortBy
      ? [{ id: initialFilters.sortBy, desc: initialFilters.sortOrder === "desc" }]
      : []
  );

  // 필터 상태
  const [category, setCategory] = useState(initialFilters.category ?? "all");
  const [status, setStatus] = useState(initialFilters.status ?? "all");
  const [search, setSearch] = useState(initialFilters.search ?? "");

  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 필터 적용 함수
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category !== "all") {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    if (status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    // 정렬 파라미터
    if (sorting.length > 0) {
      params.set("sortBy", sorting[0].id);
      params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }

    params.set("page", "1"); // 필터 변경 시 첫 페이지로

    router.push(`/wholesaler/products?${params.toString()}`);
  };

  // 검색 입력 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // 활성화/비활성화 토글
  const toggleActive = useCallback(async (product: Product) => {
    try {
      console.log("🔄 [product-table] 상품 상태 변경 시작", {
        productId: product.id,
        currentStatus: product.is_active,
      });

      const result = await toggleProductActive(product.id);

      if (result.success) {
        toast.success(
          result.isActive ? "상품이 활성화되었습니다." : "상품이 비활성화되었습니다."
        );
        router.refresh(); // 서버 데이터 새로고침
      } else {
        toast.error(result.error || "상품 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ [product-table] 상품 상태 변경 실패:", error);
      toast.error("상품 상태 변경 중 오류가 발생했습니다.");
    }
  }, [router]);

  // 삭제 확인 다이얼로그 열기
  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }, []);

  // 상품 삭제 실행
  const handleDeleteConfirm = useCallback(async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      console.log("🗑️ [product-table] 상품 삭제 시작", {
        productId: productToDelete.id,
        productName: productToDelete.name,
      });

      const result = await deleteProduct(productToDelete.id);

      if (result.success) {
        toast.success("상품이 삭제되었습니다.");
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        router.refresh(); // 서버 데이터 새로고침
      } else {
        toast.error(result.error || "상품 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ [product-table] 상품 삭제 실패:", error);
      toast.error("상품 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }, [productToDelete, router]);

  // 테이블 컬럼 정의
  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: "image_url",
        header: "이미지",
        cell: ({ row }) => {
          const imageUrl = row.original.image_url;
          return (
            <div className="relative h-12 w-12 overflow-hidden rounded-md border">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={row.original.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "상품명",
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <div className="font-medium">{row.original.name}</div>
            {row.original.standardized_name && (
              <div className="text-xs text-gray-500">
                {row.original.standardized_name}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "카테고리",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.category}</Badge>
        ),
      },
      {
        accessorKey: "price",
        header: "가격",
        cell: ({ row }) => (
          <div className="font-medium">{formatPrice(row.original.price)}</div>
        ),
      },
      {
        accessorKey: "stock_quantity",
        header: "재고",
        cell: ({ row }) => {
          const stock = row.original.stock_quantity;
          return (
            <div
              className={cn(
                "font-medium",
                stock === 0 && "text-red-600",
                stock > 0 && stock < 10 && "text-yellow-600"
              )}
            >
              {stock.toLocaleString()}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "상태",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "활성" : "비활성"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "액션",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActive(product)}
                title={product.is_active ? "비활성화" : "활성화"}
              >
                {product.is_active ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href={`/wholesaler/products/${product.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(product)}
                title="삭제"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [toggleActive, handleDeleteClick]
  );

  // 테이블 인스턴스 생성
  const table = useReactTable({
    data: initialData.products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualSorting: true, // 서버 사이드 정렬
  });

  return (
    <div className="space-y-4">
      {/* 필터 UI */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            placeholder="상품명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">검색</Button>
        </form>

        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={status} onValueChange={setStatus}>
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="active">활성</TabsTrigger>
              <TabsTrigger value="inactive">비활성</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={applyFilters}>적용</Button>
        </div>
      </div>

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
                          header.getContext()
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
                        cell.getContext()
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
                  등록된 상품이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            총 {initialData.total}개 중{" "}
            {(initialData.page - 1) * initialData.pageSize + 1}-
            {Math.min(initialData.page * initialData.pageSize, initialData.total)}
            개 표시
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.page === 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(initialData.page - 1));
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.page >= initialData.totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(initialData.page + 1));
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 "{productToDelete?.name}" 상품을 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없으며, 상품 이미지도 함께 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

