'use client';

/**
 * @file components/PWAInstallPrompt.tsx
 * @description PWA 설치 안내 팝업 컴포넌트
 *
 * 모바일 브라우저에서 PWA 설치가 가능할 때 사용자에게 설치 안내 팝업을 표시합니다.
 *
 * 주요 기능:
 * - beforeinstallprompt 이벤트 감지
 * - 모바일 디바이스에서만 표시
 * - 사용자가 거부한 경우 로컬 스토리지에 저장하여 재표시 방지
 * - 설치 버튼 클릭 시 네이티브 설치 프롬프트 표시
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - components/ui/button: 버튼 컴포넌트
 */

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'pwa-install-dismissed';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    console.group('[PWA] 설치 프롬프트 초기화');
    
    // 모바일 디바이스 확인
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      setIsMobile(isMobileDevice);
      console.log('[PWA] 모바일 디바이스 여부:', isMobileDevice);
    };

    checkMobile();

    // 이미 거부한 경우 표시하지 않음
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const expiryDate = new Date(dismissed);
      const now = new Date();
      
      if (now < expiryDate) {
        console.log('[PWA] 사용자가 거부한 기록이 있어 표시하지 않음 (만료일:', expiryDate.toLocaleString('ko-KR'), ')');
        console.groupEnd();
        return;
      } else {
        console.log('[PWA] 거부 기록이 만료되어 다시 표시 가능');
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // beforeinstallprompt 이벤트 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt 이벤트 감지됨');
      
      // 기본 프롬프트 방지
      e.preventDefault();
      
      // 이벤트 저장
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 모바일에서만 표시
      if (isMobile) {
        console.log('[PWA] 모바일 디바이스에서 설치 프롬프트 표시');
        setIsVisible(true);
      } else {
        console.log('[PWA] 데스크톱 디바이스이므로 표시하지 않음');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 앱이 이미 설치되어 있는지 확인
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA] 이미 설치된 앱으로 실행 중');
        setIsVisible(false);
      }
    };

    checkInstalled();

    console.groupEnd();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] 설치 프롬프트가 없습니다');
      return;
    }

    try {
      console.log('[PWA] 사용자가 설치 버튼 클릭');
      
      // 네이티브 설치 프롬프트 표시
      await deferredPrompt.prompt();
      
      // 사용자 선택 결과 확인
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] 사용자 설치 선택:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA] 앱 설치 승인됨');
      } else {
        console.log('[PWA] 앱 설치 거부됨');
      }
      
      // 프롬프트 사용 후 제거
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('[PWA] 설치 프롬프트 오류:', error);
    }
  };

  const handleDismiss = () => {
    console.log('[PWA] 사용자가 설치 안내 거부');
    
    // 로컬 스토리지에 거부 기록 저장 (7일간 유지)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem(STORAGE_KEY, expiryDate.toISOString());
    
    console.log('[PWA] 거부 기록 저장됨 (7일간 표시 안 함, 만료일:', expiryDate.toLocaleString('ko-KR'), ')');
    
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  // 표시 조건 확인
  if (!isVisible || !deferredPrompt || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto flex items-start gap-4">
        {/* 아이콘 */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            FarmToBiz 앱 설치하기
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            홈 화면에 추가하여 더 빠르고 편리하게 이용하세요
          </p>
          
          {/* 버튼 그룹 */}
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              설치하기
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="px-3"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

