import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/types";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

// FarmToBiz 브랜딩을 위한 커스텀 localization
const customKoKR: LocalizationResource = {
  ...koKR,
  socialButtonsBlockButton: "FarmToBiz로 계속",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarmToBiz - 도매와 소매를 연결하는 B2B 중개 플랫폼",
  description:
    "도매의 민감 정보를 노출하지 않으면서 소매가 여러 도매의 상품을 비교하고 주문할 수 있는 B2B 플랫폼",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "FarmToBiz - 도매와 소매를 연결하는 B2B 중개 플랫폼",
    description:
      "도매의 민감 정보를 노출하지 않으면서 소매가 여러 도매의 상품을 비교하고 주문할 수 있는 B2B 플랫폼",
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
    title: "FarmToBiz - 도매와 소매를 연결하는 B2B 중개 플랫폼",
    description:
      "도매의 민감 정보를 노출하지 않으면서 소매가 여러 도매의 상품을 비교하고 주문할 수 있는 B2B 플랫폼",
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
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <QueryProvider>
            <SyncUserProvider>
              <Navbar />
              {children}
            </SyncUserProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
