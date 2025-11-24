/**
 * @file app/page.tsx
 * @description FarmToBiz 메인 랜딩 페이지
 *
 * 역할 선택 및 프로젝트 소개를 제공하는 랜딩 페이지입니다.
 * - Hero 섹션: 역할 선택 카드 (소매점/도매점)
 * - 프로젝트 소개 섹션: 서비스 개요, 주요 취급 품목, MD 추천 상품, 경쟁력, 타깃 사용자, 기술 스택
 */

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserProfile, redirectByRole } from "@/lib/clerk/auth";
import {
  Search,
  ShoppingCart,
  Truck,
  Package,
  ClipboardList,
  BarChart3,
  Sparkles,
  TrendingUp,
  Shield,
  Apple,
  Carrot,
  Beef,
  Fish,
} from "lucide-react";

export default async function Home() {
  // 로그인한 사용자는 역할에 따라 대시보드로 리다이렉트
  const profile = await getUserProfile();

  // pending 상태인 도매업자인지 확인 (버튼 링크 동적 변경용)
  let isPendingWholesaler = false;
  if (
    profile &&
    profile.role === "wholesaler" &&
    profile.wholesalers &&
    profile.wholesalers.length > 0
  ) {
    const wholesaler = profile.wholesalers[0];
    if (wholesaler && wholesaler.status === "pending") {
      isPendingWholesaler = true;
    }
  }

  if (profile && profile.role) {
    // 도매업자이고 pending 상태인 경우 리다이렉트하지 않음 (승인 대기 중)
    if (
      profile.role === "wholesaler" &&
      profile.wholesalers &&
      profile.wholesalers.length > 0
    ) {
      const wholesaler = profile.wholesalers[0];
      if (wholesaler && wholesaler.status === "pending") {
        console.log("⚠️ [home] 도매업자 승인 대기 중, 메인페이지 유지");
        // pending 상태인 경우 리다이렉트하지 않고 메인페이지 표시
      } else {
        // 승인된 도매업자는 대시보드로 리다이렉트
        redirectByRole(profile.role);
      }
    } else {
      // 다른 역할(소매업자, 관리자)은 대시보드로 리다이렉트
      redirectByRole(profile.role);
    }
  }
  // 역할이 없는 사용자는 메인 페이지에서 역할 선택 가능

  // 목업 상품 데이터
  const recommendedProducts = [
    {
      id: 1,
      name: "햇살농장 고당도 설향 딸기 1kg",
      price: 15900,
      vendor: "VENDOR-001",
      category: "과일",
      image: "/strawberry.jpg",
    },
    {
      id: 2,
      name: "바다의선물 노르웨이 생연어 필렛 500g",
      price: 22000,
      vendor: "VENDOR-002",
      category: "수산물",
      image: "/salmon.jpg",
    },
    {
      id: 3,
      name: "푸른채소 무농약 아스파라거스 1단",
      price: 4500,
      vendor: "VENDOR-003",
      category: "채소",
      image: "/asparagus.png",
    },
    {
      id: 4,
      name: "참된목장 유기농 동물복지 유정란 10구",
      price: 7800,
      vendor: "VENDOR-004",
      category: "가공식품",
      image: "/eggs.jpg",
    },
  ];

  const categories = [
    {
      name: "과일",
      icon: Apple,
      image:
        "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300&h=300&fit=crop&q=80",
    },
    {
      name: "채소",
      icon: Carrot,
      image:
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop&q=80",
    },
    {
      name: "육류",
      icon: Beef,
      image:
        "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=300&h=300&fit=crop&q=80",
    },
    {
      name: "수산물",
      icon: Fish,
      image: "/seafood.jpg",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero 섹션 - 역할 선택 */}
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              환영합니다! 시작할 역할을 선택해주세요.
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              소매업자 또는 도매업자 중 하나를 선택하여 대시보드로 이동하세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* 소매점 카드 */}
            <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl mb-2">소매업자</CardTitle>
                <CardDescription className="text-base">
                  다양한 도매업체의 상품을 발견하고 합리적인 가격으로
                  주문하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      다양한 상품 검색 및 필터링
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShoppingCart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      간편한 주문 및 결제
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      거래 내역 및 배송 추적
                    </span>
                  </div>
                </div>
                <Link
                  href={
                    isPendingWholesaler
                      ? "/pending-approval"
                      : "/sign-in/retailer"
                  }
                  className="mt-auto"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg">
                    소매업자로 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 도매점 카드 */}
            <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl mb-2">도매업자</CardTitle>
                <CardDescription className="text-base">
                  전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      상품 등록 및 재고 관리
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      주문 접수 및 처리
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      판매 데이터 및 정산 관리
                    </span>
                  </div>
                </div>
                <Link
                  href={
                    isPendingWholesaler
                      ? "/pending-approval"
                      : "/sign-in/wholesaler"
                  }
                  className="mt-auto"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg">
                    도매업자로 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 서비스 개요 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            도매와 소매를 연결하는 B2B 중개 플랫폼
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            FarmToBiz는 도매의 민감 정보(상호명, 연락처)를 노출하지 않으면서
            소매가 여러 도매의 상품을 비교하고 주문할 수 있는 환경을 제공합니다.
          </p>
        </div>
      </section>

      {/* 주요 취급 품목 섹션 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            주요 취급 품목
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.name}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* MD 추천 상품 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            MD 추천 상품
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    판매자: {product.vendor}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {product.price.toLocaleString()}원
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 경쟁력 섹션 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            우리의 특별한 경쟁력
          </h2>
          <p className="text-center text-gray-600 mb-12">
            최고의 파트너가 되기 위한 우리의 약속입니다.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">AI 기반 상품 표준화</CardTitle>
              <CardDescription>
                Gemini AI를 활용한 상품명 자동 표준화 및 카테고리 추천으로
                효율적인 상품 관리를 지원합니다.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">실시간 시세 조회</CardTitle>
              <CardDescription>
                공공데이터포털 API를 통한 실시간 농수산물 경매가격 조회로
                합리적인 가격 결정을 지원합니다.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">투명한 가격 정책</CardTitle>
              <CardDescription>
                불필요한 유통 마진을 제거하고 공정하고 투명한 가격으로 거래할 수
                있는 환경을 제공합니다.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* 타깃 사용자 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            타깃 사용자
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardTitle className="text-2xl mb-4">소매점 (Retailer)</CardTitle>
              <CardDescription className="text-base space-y-2">
                <p className="font-semibold text-gray-900 mb-2">대상:</p>
                <p>식자재/잡화 소매점 운영자</p>
                <p className="font-semibold text-gray-900 mb-2 mt-4">니즈:</p>
                <p>&quot;여러 도매를 쉽게 비교하고 싸게 사고 싶다&quot;</p>
                <p className="font-semibold text-gray-900 mb-2 mt-4">
                  페인 포인트:
                </p>
                <p>도매 가격 비교가 어렵고, 전화로 일일이 문의해야 함</p>
              </CardDescription>
            </Card>
            <Card className="p-6">
              <CardTitle className="text-2xl mb-4">
                도매점 (Wholesaler)
              </CardTitle>
              <CardDescription className="text-base space-y-2">
                <p className="font-semibold text-gray-900 mb-2">대상:</p>
                <p>전통시장, 지역 도매상</p>
                <p className="font-semibold text-gray-900 mb-2 mt-4">니즈:</p>
                <p>
                  &quot;새로운 거래처를 찾고, 주문을 온라인으로 관리하고
                  싶다&quot;
                </p>
                <p className="font-semibold text-gray-900 mb-2 mt-4">
                  페인 포인트:
                </p>
                <p>거래처 발굴이 어렵고, 주문 관리가 수기</p>
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
