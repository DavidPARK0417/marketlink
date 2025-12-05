# 리디자인 통합 및 정리 계획 (Cleanup & Integration Plan)

## 1. 현재 상황 분석
- **기존 코드**: `farmtobiz/app/wholesaler` 폴더에 웹 개발이 선행되어 있었음.
- **디자인 변경**: 도매 전용 디자인(Blue 테마 등)에서 **소매 디자인 컨셉(Fresh Green)**으로 전면 리디자인됨.
- **목표**: 기존 로직(기능)은 유지하되, UI/UX를 `design-handoff`의 코드로 완전히 교체해야 함.

## 2. 삭제 및 정리 대상 (Cleanup List)

### 2.1 CSS/스타일 관련
- `globals.css` 내의 구형 색상 변수 (만약 있다면) -> Tailwind Class로 대체되므로 확인 후 정리.
- 기존 페이지 컴포넌트에 하드코딩된 Blue 계열 클래스 (`bg-blue-500` 등).

### 2.2 주석 및 레거시 코드
- `// TODO: 디자인 적용 필요` 와 같은 주석 삭제.
- `// 기존 도매 디자인` 주석 삭제.
- 사용하지 않는 임시 컴포넌트 파일 (만약 `farmtobiz/components`에 구형 모달 등이 있다면 교체).

### 2.3 폴더 구조
- 리디자인 과정에서 페이지 구조(URL)는 크게 변경되지 않았으므로 폴더 삭제보다는 **파일 내용 교체**가 주된 작업임.
- 단, 사용하지 않는 하위 폴더(예: `products/old-detail` 등)가 발견되면 삭제.

## 3. 통합 단계 (Integration Steps)

1. **백업**: 작업 시작 전 `farmtobiz` 폴더 전체 백업 또는 Git Commit 필수.
2. **레이아웃 교체**: `app/wholesaler/layout.tsx`를 `design-handoff/03-pages/layout/code.tsx`로 교체.
3. **페이지별 교체**: 각 페이지(`dashboard`, `products` 등)의 `page.tsx`를 핸드오프 코드로 덮어쓰기.
   - **주의**: 덮어쓸 때, 만약 기존 코드에 `useEffect`나 비즈니스 로직이 있었다면 해당 부분은 살려두고 **JSX(return 부분)와 UI 관련 State**만 교체해야 함. (현재 단계에서는 기능이 Mockup 상태이므로 덮어써도 무방할 수 있으나, 실제 개발환경에서는 주의).
4. **전역 설정 확인**: `tailwind.config.ts`에 커스텀 컬러가 필요하다면 추가 (현재는 Arbitrary value `[]`를 사용하여 의존성 낮음).
5. **테스트**: 모든 페이지가 Green 테마로 정상 작동하는지 확인.

## 4. 충돌 방지 전략
- **"UI 우선 적용"**: 로직 통합 전, 일단 핸드오프 코드로 UI를 100% 교체하여 시각적 완성을 먼저 시킵니다.
- **"주석 활용"**: 백엔드 연동이 필요한 부분은 `// TODO: Backend Integration` 주석을 남겨두어 나중에 식별하기 쉽게 합니다.


