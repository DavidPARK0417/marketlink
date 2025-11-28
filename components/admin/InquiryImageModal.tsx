/**
 * @file components/admin/InquiryImageModal.tsx
 * @description 문의 첨부 이미지 확대 보기 모달 컴포넌트
 *
 * 관리자가 문의 첨부 이미지를 클릭했을 때 원본 크기로 보여주는 모달입니다.
 * 여러 이미지 간 네비게이션과 다운로드 기능을 제공합니다.
 *
 * @dependencies
 * - components/ui/dialog.tsx
 * - next/image
 * - lucide-react
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InquiryImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export default function InquiryImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: InquiryImageModalProps) {
  const [currentIdx, setCurrentIdx] = React.useState(currentIndex);

  React.useEffect(() => {
    setCurrentIdx(currentIndex);
  }, [currentIndex]);

  const handlePrevious = () => {
    const newIndex = currentIdx > 0 ? currentIdx - 1 : images.length - 1;
    setCurrentIdx(newIndex);
    if (onNavigate) {
      onNavigate(newIndex);
    }
  };

  const handleNext = () => {
    const newIndex = currentIdx < images.length - 1 ? currentIdx + 1 : 0;
    setCurrentIdx(newIndex);
    if (onNavigate) {
      onNavigate(newIndex);
    }
  };

  const handleDownload = () => {
    const imageUrl = images[currentIdx];
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `inquiry-image-${currentIdx + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentImage = images[currentIdx];

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogHeader className="sr-only">
          <h2>첨부 이미지 확대 보기</h2>
        </DialogHeader>
        <div className="relative w-full h-[80vh] bg-black">
          {/* 닫기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* 이미지 */}
          <div className="relative w-full h-full">
            <Image
              src={currentImage}
              alt={`첨부 이미지 ${currentIdx + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* 네비게이션 버튼 (이미지가 2개 이상일 때만) */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* 하단 정보 및 다운로드 버튼 */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 flex items-center justify-between">
            <div className="text-sm">
              {currentIdx + 1} / {images.length}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              다운로드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
