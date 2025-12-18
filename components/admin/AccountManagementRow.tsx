/**
 * @file components/admin/AccountManagementRow.tsx
 * @description 계정 관리 테이블 행 컴포넌트
 *
 * 계정 관리 테이블의 각 행을 표시하는 컴포넌트입니다.
 * 도매/소매 계정에 따라 다른 정보를 표시하고, 정지/해제 버튼을 제공합니다.
 *
 * 주요 기능:
 * 1. 계정 정보 표시 (도매/소매 구분)
 * 2. 상태 배지 표시
 * 3. 정지/해제 버튼 (인라인 모달)
 * 4. 모바일/데스크톱 레이아웃 지원
 *
 * @dependencies
 * - actions/admin/account-management.ts
 * - components/ui/button, dialog, form, textarea
 * - react-hook-form, zod
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  suspendWholesaler,
  unsuspendWholesaler,
  suspendRetailer,
  unsuspendRetailer,
} from "@/actions/admin/account-management";
import { Ban, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 정지 사유 검증 스키마
 */
const suspendSchema = z.object({
  suspensionReason: z
    .string()
    .min(10, "정지 사유는 최소 10자 이상 입력해주세요.")
    .max(500, "정지 사유는 최대 500자까지 입력 가능합니다."),
});

type SuspendFormData = z.infer<typeof suspendSchema>;

interface WholesalerAccount {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  phone: string;
  status: string;
  suspension_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
  }[];
  email?: string | null; // 서버에서 정규화된 email 필드
}

interface RetailerAccount {
  id: string;
  business_name: string;
  phone: string;
  address: string;
  status: string;
  suspension_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
  }[];
  email?: string | null; // 서버에서 정규화된 email 필드
}

interface AccountManagementRowProps {
  account: WholesalerAccount | RetailerAccount;
  accountType: "wholesaler" | "retailer";
  isMobile?: boolean;
  rowNumber?: number;
}

export default function AccountManagementRow({
  account,
  accountType,
  isMobile = false,
  rowNumber,
}: AccountManagementRowProps) {
  const router = useRouter();
  const [isSuspending, setIsSuspending] = useState(false);
  const [isUnsuspending, setIsUnsuspending] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  const form = useForm<SuspendFormData>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      suspensionReason: "",
    },
  });

  const isWholesaler = accountType === "wholesaler";
  const isSuspended =
    (isWholesaler && account.status === "suspended") ||
    (!isWholesaler && account.status === "suspended");
  const isActive =
    (isWholesaler && account.status === "approved") ||
    (!isWholesaler && account.status === "active");

  // 프로필 데이터 추출
  // 1. 서버에서 정규화된 email 필드 우선 사용
  // 2. 없으면 profiles 배열에서 추출
  const email = (() => {
    // 서버에서 정규화된 email 필드가 있으면 사용
    if ('email' in account && account.email) {
      return account.email;
    }
    
    // profiles 배열에서 추출
    if (account.profiles) {
      if (Array.isArray(account.profiles)) {
        return account.profiles.length > 0 ? account.profiles[0]?.email || null : null;
      }
      
      // 객체인 경우 (1:1 관계일 때 단일 객체로 반환될 수 있음)
      // 타입 단언을 사용하여 안전하게 처리
      const profilesObj = account.profiles as { email?: string };
      if (profilesObj && typeof profilesObj === 'object' && 'email' in profilesObj) {
        return profilesObj.email || null;
      }
    }
    
    return null;
  })();
  
  // 디버깅 로그 (이메일이 없을 때만)
  if (!email) {
    console.warn('⚠️ [AccountManagementRow] 이메일 데이터 없음:', {
      accountId: account.id,
      accountType,
      hasEmailField: 'email' in account,
      emailFieldValue: 'email' in account ? account.email : 'N/A',
      profilesType: typeof account.profiles,
      profilesIsArray: Array.isArray(account.profiles),
      profilesValue: account.profiles,
      accountKeys: Object.keys(account),
    });
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 정지 처리
  const handleSuspend = async (data: SuspendFormData) => {
    setIsSuspending(true);
    try {
      if (isWholesaler) {
        await suspendWholesaler(account.id, data.suspensionReason);
      } else {
        await suspendRetailer(account.id, data.suspensionReason);
      }
      router.refresh();
      setIsSuspendDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("❌ [admin] 정지 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "정지 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSuspending(false);
    }
  };

  // 해제 처리
  const handleUnsuspend = async () => {
    if (
      !confirm(
        `정말 이 ${isWholesaler ? "도매" : "소매"} 계정을 해제하시겠습니까?\n해제 후에는 정지 사유가 삭제됩니다.`,
      )
    ) {
      return;
    }

    setIsUnsuspending(true);
    try {
      if (isWholesaler) {
        await unsuspendWholesaler(account.id);
      } else {
        await unsuspendRetailer(account.id);
      }
      router.refresh();
    } catch (error) {
      console.error("❌ [admin] 해제 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "해제 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsUnsuspending(false);
    }
  };

  // 상태 배지
  const StatusBadge = ({ status }: { status: string }) => {
    const isSuspendedStatus = status === "suspended";
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          isSuspendedStatus
            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
        )}
      >
        {isSuspendedStatus ? "정지" : isWholesaler ? "승인" : "활성"}
      </span>
    );
  };

  // 정지/해제 버튼
  const ActionButtons = () => (
    <div className="flex items-center justify-end gap-2">
      {isSuspended ? (
        <Button
          onClick={handleUnsuspend}
          disabled={isUnsuspending}
          size="sm"
          className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
        >
          {isUnsuspending ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              해제 중...
            </>
          ) : (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              해제
            </>
          )}
        </Button>
      ) : (
        <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isSuspending}
            >
              <Ban className="mr-1 h-3 w-3" />
              정지
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isWholesaler ? "도매" : "소매"} 계정 정지
              </DialogTitle>
              <DialogDescription>
                정지 사유를 입력해주세요. (최소 10자 이상)
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSuspend)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="suspensionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정지 사유</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="정지 사유를 상세히 입력해주세요. (최소 10자 이상)"
                          rows={5}
                          disabled={isSuspending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsSuspendDialogOpen(false);
                      form.reset();
                    }}
                    disabled={isSuspending}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isSuspending}
                  >
                    {isSuspending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        정지 중...
                      </>
                    ) : (
                      "정지 처리"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  // 데스크톱/태블릿 테이블 행
  if (!isMobile) {
    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
          <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300 text-center">
            {rowNumber}
          </div>
        </td>
        {isWholesaler ? (
          <>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
              <div className="text-xs md:text-sm font-medium text-foreground dark:text-white">
                {(account as WholesalerAccount).business_name}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300">
                {(account as WholesalerAccount).business_number}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden xl:table-cell">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300">
                {(account as WholesalerAccount).representative}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300 truncate max-w-[150px]">
                {email || "-"}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
              <StatusBadge status={account.status} />
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden xl:table-cell">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300">
                {formatDate(account.created_at)}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
              <ActionButtons />
            </td>
          </>
        ) : (
          <>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
              <div className="text-xs md:text-sm font-medium text-foreground dark:text-white">
                {(account as RetailerAccount).business_name}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300">
                {(account as RetailerAccount).phone}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300 truncate max-w-[150px]">
                {email || "-"}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 hidden xl:table-cell">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300 max-w-xs truncate">
                {(account as RetailerAccount).address}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
              <StatusBadge status={account.status} />
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden xl:table-cell">
              <div className="text-xs md:text-sm text-muted-foreground dark:text-gray-300">
                {formatDate(account.created_at)}
              </div>
            </td>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
              <ActionButtons />
            </td>
          </>
        )}
      </tr>
    );
  }

  // 모바일 카드
  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground dark:text-gray-300 font-medium">
              {rowNumber}.
            </span>
            <h3 className="text-sm font-medium text-foreground dark:text-white">
              {isWholesaler
                ? (account as WholesalerAccount).business_name
                : (account as RetailerAccount).business_name}
            </h3>
          </div>
          {isWholesaler && (
            <p className="text-xs text-muted-foreground dark:text-gray-300 mt-1">
              {(account as WholesalerAccount).business_number}
            </p>
          )}
        </div>
        <StatusBadge status={account.status} />
      </div>

      <div className="space-y-2 text-sm text-muted-foreground dark:text-gray-300 mb-4">
        {isWholesaler ? (
          <>
            <div>
              <span className="font-medium">대표자:</span>{" "}
              {(account as WholesalerAccount).representative}
            </div>
            <div>
              <span className="font-medium">연락처:</span>{" "}
              {(account as WholesalerAccount).phone}
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="font-medium">연락처:</span>{" "}
              {(account as RetailerAccount).phone}
            </div>
            <div>
              <span className="font-medium">주소:</span>{" "}
              {(account as RetailerAccount).address}
            </div>
          </>
        )}
        <div>
          <span className="font-medium">이메일:</span> {email || "-"}
        </div>
        <div>
          <span className="font-medium">가입일:</span> {formatDate(account.created_at)}
        </div>
      </div>

      <ActionButtons />
    </div>
  );
}

