/**
 * @file components/providers/theme-provider.tsx
 * @description Theme Provider
 *
 * next-themes를 사용하기 위한 ThemeProvider입니다.
 * RootLayout에 추가하여 전역에서 다크모드를 사용할 수 있도록 합니다.
 *
 * @dependencies
 * - next-themes
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      suppressHydrationWarning
    >
      {children}
    </NextThemesProvider>
  );
}

