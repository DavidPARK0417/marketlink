# 개발자 구현 가이드 (Developer Implementation Guide)

## 1. 소개
이 가이드는 `design-handoff` 폴더에 정의된 디자인 명세와 퍼블리싱 코드를 실제 개발 환경(`farmtobiz/app/wholesaler`)에 통합하기 위한 지침서입니다.

## 2. 디자인 시스템 핵심 (Design Token Summary)

### 색상 (Color Palette)
| 역할 | 색상 코드 | Tailwind Class | 용도 |
|---|---|---|---|
| **Primary** | `#10B981` | `text-[#10B981]`, `bg-[#10B981]` | 주요 버튼, 강조 텍스트, 활성 상태 |
| **Secondary** | `#059669` | `text-[#059669]`, `bg-[#059669]` | 호버 상태, 그라데이션 끝점 |
| **Alert (Warning)** | `#fbbf24` | `text-[#fbbf24]`, `bg-[#fbbf24]` | 대기 상태, 주의 알림 |
| **Error (Danger)** | `#ef4444` | `text-red-500`, `bg-red-600` | 삭제, 오류, 수수료 차감 |
| **Background** | `#F8F9FA` | `bg-[#F8F9FA]` | 페이지 배경, 테이블 헤더 |

### 컴포넌트 스타일링 규칙
1. **Shadow**:
   - 기본 카드: `shadow-md`
   - 강조 요소 (버튼 등): `shadow-[0_4px_20px_rgba(16,185,129,0.3)]` (Green Glow)
2. **Rounded Corners**:
   - 버튼/입력창: `rounded-xl` (12px)
   - 카드/컨테이너: `rounded-2xl` (16px) ~ `rounded-3xl` (24px)
3. **Interaction**:
   - 모든 인터랙티브 요소는 `transition-all duration-200` 이상을 적용합니다.
   - Hover 시 `transform hover:-translate-y-1` 등을 사용하여 "떠오르는" 느낌을 줍니다.

## 3. 구현 시 주의사항

### 3.1 Dummy Data 교체
- `design-handoff`의 코드는 `dummy-data.ts`를 사용하고 있습니다.
- 통합 시에는 실제 API 호출 또는 React Query/SWR 훅으로 데이터를 fetching하는 로직으로 교체해야 합니다.
- **Tip**: UI 컴포넌트 구조(`table`, `card`, `filter bar`)는 그대로 유지하고, 데이터 매핑 부분(`map()`)의 소스만 변경하세요.

### 3.2 상태 관리 (State Management)
- 필터링(검색, 카테고리 등) 로직이 현재 `useState`로 클라이언트 사이드에서 구현되어 있습니다.
- 대량의 데이터가 예상되는 경우, URL Query Parameter(`searchParams`)를 이용한 서버 사이드 필터링으로 변경하는 것을 권장합니다.

### 3.3 모바일 반응형 (Responsive Design)
- 모든 페이지는 `lg:` (1024px) 브레이크포인트를 기준으로 데스크톱/모바일 뷰가 전환됩니다.
- `hidden lg:block` (데스크톱 전용) / `lg:hidden` (모바일 전용) 클래스를 주의 깊게 확인하세요.

## 4. 파일 구조 매핑

| Handoff Path | Target Path (Real App) |
|---|---|
| `03-pages/dashboard/code.tsx` | `app/wholesaler/dashboard/page.tsx` |
| `03-pages/products/code.tsx` | `app/wholesaler/products/page.tsx` |
| `03-pages/orders/code.tsx` | `app/wholesaler/orders/page.tsx` |
| `03-pages/settlements/code.tsx` | `app/wholesaler/settlements/page.tsx` |
| `03-pages/cs/code.tsx` | `app/wholesaler/cs/page.tsx` |
| `03-pages/market-prices/code.tsx` | `app/wholesaler/market-prices/page.tsx` |
| `03-pages/settings/code.tsx` | `app/wholesaler/settings/page.tsx` |
| `03-pages/layout/code.tsx` | `app/wholesaler/layout.tsx` |

## 5. 아이콘
- `lucide-react` 라이브러리를 사용합니다.
- 모든 아이콘은 Stroke Width 기본값 또는 1.5~2.0 사이를 유지하여 깔끔한 느낌을 줍니다.
