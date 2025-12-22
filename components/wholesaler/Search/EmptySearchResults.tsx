/**
 * @file components/wholesaler/Search/EmptySearchResults.tsx
 * @description 빈 검색 결과 컴포넌트
 *
 * 검색 결과가 없을 때 표시하는 컴포넌트입니다.
 */

import { Search } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EmptySearchResultsProps {
  query: string;
  activeTab: string;
}

export default function EmptySearchResults({
  query,
  activeTab,
}: EmptySearchResultsProps) {
  const router = useRouter();

  const getMessage = () => {
    if (activeTab === "orders") {
      return "주문 검색 결과가 없습니다";
    } else if (activeTab === "products") {
      return "상품 검색 결과가 없습니다";
    } else {
      return "검색 결과가 없습니다";
    }
  };

  const getDescription = () => {
    if (activeTab === "orders") {
      return `"${query}"에 대한 주문을 찾을 수 없습니다. 다른 검색어를 시도해보세요.`;
    } else if (activeTab === "products") {
      return `"${query}"에 대한 상품을 찾을 수 없습니다. 다른 검색어를 시도해보세요.`;
    } else {
      return `"${query}"에 대한 검색 결과가 없습니다. 다른 검색어를 시도하거나 다른 탭을 확인해보세요.`;
    }
  };

  const getActions = () => {
    if (activeTab === "all") {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("tab", "orders");
              router.push(`/wholesaler/search?${params.toString()}`);
            }}
          >
            주문 탭 보기
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("tab", "products");
              router.push(`/wholesaler/search?${params.toString()}`);
            }}
          >
            상품 탭 보기
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <EmptyState
      message={getMessage()}
      description={getDescription()}
      icon={Search}
      action={getActions()}
    />
  );
}
