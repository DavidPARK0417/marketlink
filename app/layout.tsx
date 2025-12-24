import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
// Geist 폰트는 Pretendard Variable로 교체됨
// import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import "./globals.css";

// FarmToBiz 브랜딩을 위한 커스텀 localization
const customKoKR = {
  ...koKR,
  socialButtonsBlockButton: "FarmToBiz로 계속",
};

// Geist 폰트는 Pretendard Variable로 교체됨 (globals.css에서 CDN으로 로드)
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "FarmToBiz - 도매 사업자 전용 플랫폼",
  description:
    "전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요. 상품 등록, 주문 관리, 정산까지 한 번에 관리할 수 있는 도매 전문 플랫폼",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://wholesale.farmtobiz.com",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10B981" },
    { media: "(prefers-color-scheme: dark)", color: "#10B981" },
  ],
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "FarmToBiz - 도매 사업자 전용 플랫폼",
    description:
      "전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요. 상품 등록, 주문 관리, 정산까지 한 번에!",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "FarmToBiz 로고",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmToBiz - 도매 사업자 전용 플랫폼",
    description: "전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={customKoKR}>
      <html lang="ko" suppressHydrationWarning>
        <body className="antialiased">
          <ThemeProvider>
            <QueryProvider>
              <SyncUserProvider>
                <Navbar />
                {children}
                <PWAInstallPrompt />
              </SyncUserProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
