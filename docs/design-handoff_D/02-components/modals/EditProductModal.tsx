'use client';

import { X, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  origin: string;
  unit: string;
  status: 'active' | 'inactive';
  image: string;
  description?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onSave,
}: EditProductModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<Product | null>(null);
  const [isStandardizing, setIsStandardizing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setIsVisible(true);
      setFormData({ ...product });
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => prev ? ({ ...prev, image: reader.result as string }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStandardize = async () => {
    if (!formData?.name) {
      alert('상품명을 입력해주세요.');
      return;
    }

    setIsStandardizing(true);

    // Simulate AI Standardization
    setTimeout(() => {
      const standardized = {
        name: formData.name.includes('감자')
          ? '감자(수미)'
          : formData.name.includes('양파')
          ? '양파(황)'
          : formData.name,
        category: formData.name.includes('감자') || formData.name.includes('양파')
          ? '채소'
          : '과일',
      };

      setFormData((prev) => prev ? ({
        ...prev,
        name: standardized.name,
        category: standardized.category,
      }) : null);

      setIsStandardizing(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!formData.name || !formData.price || !formData.stock) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isVisible && !isOpen) return null;
  if (!formData) return null;

  const categories = ['채소', '과일', '곡물', '수산물', '축산물', '기타'];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">상품 정보 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상품 이미지
              </label>
              <div className="flex gap-4">
                {/* 이미지 미리보기 */}
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {imagePreview || formData.image ? (
                    <img
                      src={imagePreview || formData.image}
                      alt="상품 이미지"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* 업로드 버튼 */}
                <div className="flex-1 flex flex-col justify-center gap-2">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border border-blue-200 shadow-sm">
                      <Upload className="w-5 h-5" />
                      <span>이미지 업로드</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    JPG, PNG 파일 (최대 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* 상품명 + AI 표준화 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상품명 <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleStandardize}
                  disabled={isStandardizing}
                  className="flex items-center gap-2 px-4 py-3 bg-[#10B981] text-white font-semibold rounded-xl hover:bg-[#4a8059] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md text-sm whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  {isStandardizing ? '분석 중...' : 'AI 표준화'}
                </button>
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                카테고리 <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 가격 + 재고 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  가격 (원) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  재고 (박스) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
              </div>
            </div>

            {/* 단위 + 원산지 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  단위
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                >
                  <option value="20kg">20kg</option>
                  <option value="10kg">10kg</option>
                  <option value="5kg">5kg</option>
                  <option value="1박스">1박스</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  원산지
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
              </div>
            </div>

             {/* 상태 */}
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                판매 상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                <option value="active">판매중 (활성)</option>
                <option value="inactive">판매중지 (비활성)</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            form="edit-product-form"
            className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            수정 완료
          </button>
        </div>
      </div>
    </div>
  );
}


