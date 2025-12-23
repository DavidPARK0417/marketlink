/**
 * @file contexts/WholesalerRoleContext.tsx
 * @description 도매 페이지 역할 Context
 *
 * 레이아웃에서 전달받은 role을 페이지 컴포넌트에서 사용할 수 있도록 제공합니다.
 */

"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/types/database";

interface WholesalerRoleContextValue {
  role?: UserRole;
}

const WholesalerRoleContext = createContext<WholesalerRoleContextValue | undefined>(undefined);

export function WholesalerRoleProvider({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) {
  return (
    <WholesalerRoleContext.Provider value={{ role }}>
      {children}
    </WholesalerRoleContext.Provider>
  );
}

export function useWholesalerRole() {
  const context = useContext(WholesalerRoleContext);
  return context?.role;
}

