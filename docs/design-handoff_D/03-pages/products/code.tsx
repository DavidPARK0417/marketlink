'use client';

import Link from 'next/link';
import { Plus, Package, Search, ChevronDown, Eye, Edit2, Trash2 } from 'lucide-react';
import { dummyProducts } from '@/lib/dummy-data';
import { useState } from 'react';
import EditProductModal from '@/components/EditProductModal';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Status Filter State
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusOptions = ['전체', '활성', '비활성'];

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState(dummyProducts);

  // 고정 카테고리 목록
  const categories = ['전체', '과일', '채소', '수산물', '곡물/견과', '기타'];

  // 필터링 로직
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || product.category === selectedCategory;
    // Note: dummyProducts currently doesn't have a status field, so we'll assume all are active for now
    // or add a status field to the dummy data if needed. For UI demo, we might ignore it or mock it.
    // If we assume all are '활성' (Active) for now:
    const matchesStatus = selectedStatus === '전체' || (selectedStatus === '활성'); 
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditClick = (product: any) => {
    setEditingProduct({ ...product, status: 'active' }); // Add status since dummy data might miss it
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct: any) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleToggleStatus = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId
        ? { ...p, isActive: p.isActive === undefined ? false : !p.isActive }
        : p
    ));
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#111827]">상품 관리</h1>
          <p className="mt-2 text-sm lg:text-base text-[#6B7280]">
            등록된 상품 {dummyProducts.length}개를 관리하세요.
          </p>
        </div>
        <Link
          href="/wholesaler/products/new"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-5 lg:px-6 py-3 rounded-xl font-semibold hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          <span>상품 등록</span>
        </Link>
      </div>

      {/* 검색 및 카테고리 필터 */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {/* 검색창 */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="상품명을 검색하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* 필터 그룹 */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* 카테고리 드롭다운 */}
          <div className="relative w-full md:w-40">
            <button
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsStatusDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
            >
              <span className="truncate">{selectedCategory === '전체' ? '전체 카테고리' : selectedCategory}</span>
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F8F9FA] ${
                      selectedCategory === category
                        ? 'text-[#10B981] font-bold bg-[#F8F9FA]'
                        : 'text-gray-600 font-medium'
                    }`}
                  >
                    {category === '전체' ? '전체 카테고리' : category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상태 드롭다운 (활성/비활성) */}
          <div className="relative w-full md:w-32">
            <button
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
            >
              <span>{selectedStatus === '전체' ? '상태 전체' : selectedStatus}</span>
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F8F9FA] ${
                      selectedStatus === status
                        ? 'text-[#10B981] font-bold bg-[#F8F9FA]'
                        : 'text-gray-600 font-medium'
                    }`}
                  >
                    {status === '전체' ? '상태 전체' : status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상품 목록 - 이미지와 액션 버튼 포함 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    이미지
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    재고
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gradient-to-r hover:from-[#10B981]/5 hover:to-transparent transition-all duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center group-hover:from-[#10B981]/10 group-hover:to-[#059669]/10 transition-all shadow-sm">
                        <Package className="w-8 h-8 text-gray-400 group-hover:text-[#10B981] group-hover:scale-110 transition-all" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{product.unit} · {product.origin}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 text-[#059669] border border-[#10B981]/20">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-[#10B981] text-sm">
                        {product.price.toLocaleString()}원
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-900 text-sm">
                        {product.stock}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">박스</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive !== false
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {product.isActive !== false ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          className={`p-2 rounded-lg transition-all duration-200 group/btn ${
                            product.isActive !== false
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                          title={product.isActive !== false ? '활성 (클릭하여 비활성화)' : '비활성 (클릭하여 활성화)'}
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 group/btn"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 group/btn"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}


