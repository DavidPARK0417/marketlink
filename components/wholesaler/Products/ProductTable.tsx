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

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { Edit2, Eye, ImageIcon, Trash2, Search, ChevronDown, Package, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import type { GetProductsResult } from "@/lib/supabase/queries/products";
import { toggleProductActive } from "@/actions/wholesaler/toggle-product-active";
import { deleteProduct } from "@/actions/wholesaler/delete-product";
import { Button } from "@/components/ui/button";
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
import EmptyState from "@/components/common/EmptyState";

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

  // URL 파라미터 변경 시 sorting 상태 동기화
  useEffect(() => {
    if (initialFilters.sortBy) {
      setSorting([{ id: initialFilters.sortBy, desc: initialFilters.sortOrder === "desc" }]);
    } else {
      setSorting([]);
    }
  }, [initialFilters.sortBy, initialFilters.sortOrder]);

  // 필터 상태
  const [category, setCategory] = useState(initialFilters.category ?? "all");
  const [status, setStatus] = useState(initialFilters.status ?? "all");
  const [search, setSearch] = useState(initialFilters.search ?? "");

  // 드롭다운 상태
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 상품 목록 로컬 상태 (Optimistic Update를 위한)
  const [products, setProducts] = useState<Product[]>(initialData.products);

  // initialData가 변경되면 로컬 상태 동기화
  useEffect(() => {
    setProducts(initialData.products);
  }, [initialData.products]);

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

  // 활성화/비활성화 토글 (Optimistic Update 적용)
  const toggleActive = useCallback(async (product: Product) => {
    const previousProducts = [...products];
    const newStatus = !product.is_active;

    // 즉시 UI 업데이트 (Optimistic Update)
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: newStatus } : p
      )
    );

    try {
      console.log("🔄 [product-table] 상품 상태 변경 시작", {
        productId: product.id,
        currentStatus: product.is_active,
        newStatus,
      });

      const result = await toggleProductActive(product.id);

      if (result.success) {
        toast.success(
          result.isActive ? "상품이 활성화되었습니다." : "상품이 비활성화되었습니다."
        );
        // 서버 데이터와 동기화 (백그라운드)
        router.refresh();
      } else {
        // 실패 시 이전 상태로 복원
        setProducts(previousProducts);
        toast.error(result.error || "상품 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      // 에러 발생 시 이전 상태로 복원
      setProducts(previousProducts);
      console.error("❌ [product-table] 상품 상태 변경 실패:", error);
      toast.error("상품 상태 변경 중 오류가 발생했습니다.");
    }
  }, [router, products]);

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
        id: "number",
        header: "번호",
        cell: ({ row }) => {
          // 페이지네이션을 고려한 번호 계산
          const rowIndex = row.index;
          const pageNumber = (initialData.page - 1) * initialData.pageSize + rowIndex + 1;
          return (
            <div className="text-center">
              <span className="font-semibold text-gray-700 text-sm">
                {pageNumber}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "image_url",
        header: "이미지",
        cell: ({ row }) => {
          const imageUrl = row.original.image_url;
          return (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center group-hover:from-[#10B981]/10 group-hover:to-[#059669]/10 transition-all shadow-sm">
              {imageUrl ? (
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <Image
                    src={imageUrl}
                    alt={row.original.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <Package className="w-8 h-8 text-gray-400 group-hover:text-[#10B981] group-hover:scale-110 transition-all" />
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                const newSortOrder = isSorted === "asc" ? "desc" : "asc";
                params.set("sortBy", "name");
                params.set("sortOrder", newSortOrder);
                params.set("page", "1");
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
              className="flex items-center gap-1.5 hover:text-[#10B981] transition-colors group w-full text-left"
            >
              <span className={cn(isSorted && "text-[#10B981] font-bold")}>상품명</span>
              {isSorted === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#10B981]" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#10B981] opacity-60" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const product = row.original;
          // specification 파싱 (예: "1박스 (10kg)" -> "1박스 · 10kg")
          const specDisplay = product.specification 
            ? product.specification.replace(/[()]/g, '').replace(/\s+/g, ' · ')
            : null;
          
          return (
            <div>
              <div className="font-bold text-gray-900 text-sm">{product.name}</div>
              {specDisplay && (
                <div className="text-xs text-gray-500 mt-1">{specDisplay}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                const newSortOrder = isSorted === "asc" ? "desc" : "asc";
                params.set("sortBy", "category");
                params.set("sortOrder", newSortOrder);
                params.set("page", "1");
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
              className="flex items-center gap-1.5 hover:text-[#10B981] transition-colors group w-full text-left"
            >
              <span className={cn(isSorted && "text-[#10B981] font-bold")}>카테고리</span>
              {isSorted === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#10B981]" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#10B981] opacity-60" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 text-[#059669] border border-[#10B981]/20">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                const newSortOrder = isSorted === "asc" ? "desc" : "asc";
                params.set("sortBy", "price");
                params.set("sortOrder", newSortOrder);
                params.set("page", "1");
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
              className="flex items-center gap-1.5 hover:text-[#10B981] transition-colors group ml-auto"
            >
              <span className={cn(isSorted && "text-[#10B981] font-bold")}>가격</span>
              {isSorted === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#10B981]" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#10B981] opacity-60" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <div className="text-right">
            <span className="font-bold text-[#10B981] text-sm">
              {formatPrice(row.original.price)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "stock_quantity",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                const newSortOrder = isSorted === "asc" ? "desc" : "asc";
                params.set("sortBy", "stock_quantity");
                params.set("sortOrder", newSortOrder);
                params.set("page", "1");
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
              className="flex items-center gap-1.5 hover:text-[#10B981] transition-colors group mx-auto"
            >
              <span className={cn(isSorted && "text-[#10B981] font-bold")}>재고</span>
              {isSorted === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#10B981]" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#10B981] opacity-60" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const stock = row.original.stock_quantity;
          return (
            <div className="text-center">
              <span className="font-semibold text-gray-900 text-sm">
                {stock.toLocaleString()}
              </span>
              <span className="text-gray-500 text-xs ml-1">박스</span>
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "상태",
        cell: ({ row }) => {
          const isActive = row.original.is_active;
          return (
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {isActive ? '활성' : '비활성'}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "액션",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => toggleActive(product)}
                className={`p-2 rounded-lg transition-all duration-200 group/btn ${
                  product.is_active
                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
                title={product.is_active ? '활성 (클릭하여 비활성화)' : '비활성 (클릭하여 활성화)'}
              >
                <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
              <Link
                href={`/wholesaler/products/${product.id}/edit`}
                className="p-2 rounded-lg bg-emerald-50 text-[#10B981] hover:bg-emerald-100 transition-all duration-200 group/btn"
                title="수정"
              >
                <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </Link>
              <button
                onClick={() => handleDeleteClick(product)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 group/btn"
                title="삭제"
              >
                <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
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
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualSorting: true, // 서버 사이드 정렬
  });

  // 카테고리 옵션 (전체 포함)
  const categoryOptions = ["전체", ...CATEGORIES];
  const statusOptions = ["전체", "활성", "비활성"];

  // 카테고리 변경 핸들러
  const handleCategoryChange = (value: string) => {
    const categoryValue = value === "전체" ? "all" : value;
    setCategory(categoryValue);
    setIsCategoryDropdownOpen(false);
    
    const params = new URLSearchParams(searchParams.toString());
    if (categoryValue !== "all") {
      params.set("category", categoryValue);
    } else {
      params.delete("category");
    }
    if (status !== "all") {
      params.set("status", status);
    }
    if (search) {
      params.set("search", search);
    }
    if (sorting.length > 0) {
      params.set("sortBy", sorting[0].id);
      params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }
    params.set("page", "1");
    router.push(`/wholesaler/products?${params.toString()}`);
  };

  // 상태 변경 핸들러
  const handleStatusChange = (value: string) => {
    const statusValue = value === "전체" ? "all" : value === "활성" ? "active" : "inactive";
    setStatus(statusValue);
    setIsStatusDropdownOpen(false);
    
    const params = new URLSearchParams(searchParams.toString());
    if (statusValue !== "all") {
      params.set("status", statusValue);
    } else {
      params.delete("status");
    }
    if (category !== "all") {
      params.set("category", category);
    }
    if (search) {
      params.set("search", search);
    }
    if (sorting.length > 0) {
      params.set("sortBy", sorting[0].id);
      params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }
    params.set("page", "1");
    router.push(`/wholesaler/products?${params.toString()}`);
  };

  // 현재 선택된 카테고리 표시 텍스트
  const categoryDisplayText = category === "all" ? "전체 카테고리" : category;
  const statusDisplayText = status === "all" ? "상태 전체" : status === "active" ? "활성" : "비활성";

  return (
    <div className="space-y-4">
      {/* 필터 UI - 디자인 핸드오프 스타일 */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {/* 검색창 */}
        <div className="relative w-full md:w-96">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="상품명을 검색하세요"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </form>
        </div>

        {/* 필터 그룹 */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* 카테고리 드롭다운 */}
          <div className="relative w-full md:w-40" ref={categoryDropdownRef}>
            <button
              onClick={() => {
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                setIsStatusDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
            >
              <span className="truncate">{categoryDisplayText}</span>
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F8F9FA] ${
                      (cat === "전체" && category === "all") || (cat === category)
                        ? 'text-[#10B981] font-bold bg-[#F8F9FA]'
                        : 'text-gray-600 font-medium'
                    }`}
                  >
                    {cat === "전체" ? "전체 카테고리" : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상태 드롭다운 */}
          <div className="relative w-full md:w-32" ref={statusDropdownRef}>
            <button
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsCategoryDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
            >
              <span>{statusDisplayText}</span>
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {statusOptions.map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => handleStatusChange(statusOption)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F8F9FA] ${
                      (statusOption === "전체" && status === "all") ||
                      (statusOption === "활성" && status === "active") ||
                      (statusOption === "비활성" && status === "inactive")
                        ? 'text-[#10B981] font-bold bg-[#F8F9FA]'
                        : 'text-gray-600 font-medium'
                    }`}
                  >
                    {statusOption === "전체" ? "상태 전체" : statusOption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 테이블 / 카드 - 디자인 핸드오프 스타일 */}
      <div className="space-y-3">
        {table.getRowModel().rows?.length ? (
          <>
            {/* 모바일 카드 리스트 */}
            <div className="sm:hidden space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold",
                            product.is_active
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          )}
                        >
                          {product.is_active ? "활성" : "비활성"}
                        </span>
                      </div>
                      {product.specification && (
                        <p className="text-xs text-gray-500">
                          {product.specification.replace(/[()]/g, "").replace(/\s+/g, " · ")}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {product.category}
                        </span>
                        <span className="ml-auto font-semibold text-[#10B981]">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>재고: {product.stock_quantity.toLocaleString()} 박스</span>
                        <span>MOQ: {product.moq}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => toggleActive(product)}
                        className={cn(
                          "flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                          product.is_active
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        )}
                        title={product.is_active ? "활성 → 비활성" : "비활성 → 활성"}
                      >
                        <Eye className="w-4 h-4" />
                        {product.is_active ? "비활성화" : "활성화"}
                      </button>
                      <Link
                        href={`/wholesaler/products/${product.id}/edit`}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-[#10B981] hover:bg-emerald-100 transition-all"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                        수정
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 데스크톱 테이블 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
                      >
                        {headerGroup.headers.map((header) => {
                          const isSortable = header.column.getCanSort();
                          return (
                            <th
                              key={header.id}
                              className={cn(
                                "px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider",
                                header.id === "price"
                                  ? "text-right"
                                  : header.id === "stock_quantity" ||
                                    header.id === "is_active" ||
                                    header.id === "actions"
                                  ? "text-center"
                                  : "text-left",
                                isSortable && "cursor-pointer hover:bg-gray-100/50 transition-colors"
                              )}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gradient-to-r hover:from-[#10B981]/5 hover:to-transparent transition-all duration-200 group"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <EmptyState
              message="검색 결과가 없습니다"
              description="다른 검색어나 필터를 사용해보세요"
              icon={Package}
            />
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {initialData.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 font-medium">
            총 <span className="text-[#10B981] font-bold">{initialData.total}</span>개 중{" "}
            <span className="text-[#10B981] font-bold">
              {(initialData.page - 1) * initialData.pageSize + 1}
            </span>
            -
            <span className="text-[#10B981] font-bold">
              {Math.min(initialData.page * initialData.pageSize, initialData.total)}
            </span>
            개 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.page === 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(initialData.page - 1));
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
              className="border-gray-200 hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, initialData.totalPages) }, (_, i) => {
                let pageNum: number;
                if (initialData.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (initialData.page <= 3) {
                  pageNum = i + 1;
                } else if (initialData.page >= initialData.totalPages - 2) {
                  pageNum = initialData.totalPages - 4 + i;
                } else {
                  pageNum = initialData.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={initialData.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", String(pageNum));
                      router.push(`/wholesaler/products?${params.toString()}`);
                    }}
                    className={cn(
                      "min-w-[2.5rem]",
                      initialData.page === pageNum
                        ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                        : "border-gray-200 hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.page >= initialData.totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(initialData.page + 1));
                router.push(`/wholesaler/products?${params.toString()}`);
              }}
              className="border-gray-200 hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
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
              정말로 &quot;{productToDelete?.name}&quot; 상품을 삭제하시겠습니까?
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

