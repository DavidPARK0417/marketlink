# Farm to Biz 도매 플랫폼 디자인 전달 폴더 사용 가이드

## 📋 개요

이 폴더는 Farm to Biz 농수산물 B2B 도매 플랫폼의 디자인 시스템과 퍼블리싱 코드를 포함하고 있습니다.
개발자가 기존 도매 사이트에 새로운 디자인을 통합할 때 참조할 수 있도록 구성되었습니다.

**작성일**: 2024-12-04
**버전**: 1.0.0
**기술 스택**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4

---

## 📁 폴더 구조

```
design-handoff/
├── 00-guides/                    # 📖 가이드 문서
│   ├── README.md                 # 이 파일 - 폴더 사용 가이드
│   ├── DEVELOPER_GUIDE.md        # 개발자 구현 가이드
│   └── DESIGN_SYSTEM.md          # 디자인 시스템 통합 명세서
│
├── 01-design-tokens/             # 🎨 디자인 토큰 (JSON)
│   ├── colors.json               # 색상 시스템
│   ├── typography.json           # 타이포그래피
│   ├── spacing.json              # 간격 시스템
│   └── shadows.json              # 그림자 & 이펙트
│
├── 02-components/                # 🧩 컴포넌트 명세 & 코드
│   ├── buttons/                  # 버튼 컴포넌트
│   ├── cards/                    # 카드 컴포넌트
│   ├── forms/                    # 폼 컴포넌트 (Input, Select 등)
│   ├── modals/                   # 모달 컴포넌트 (원본 포함)
│   ├── tables/                   # 테이블 컴포넌트
│   └── navigation/               # 네비게이션 (Sidebar, Header)
│
├── 03-pages/                     # 📄 페이지별 명세 & 퍼블리싱 코드
│   ├── layout/                   # 레이아웃 구조
│   ├── dashboard/                # 대시보드
│   ├── products/                 # 상품 관리
│   ├── orders/                   # 주문 관리
│   ├── settlements/              # 정산 관리
│   ├── market-prices/            # 시세 조회
│   ├── cs/                       # 고객 지원
│   └── settings/                 # 설정
│
├── 04-assets/                    # 🎭 에셋 가이드
│   └── README.md                 # Lucide Icons 사용 가이드
│
└── 05-integration-prompts/       # 🤖 통합 실행 프롬프트
    ├── 01-cleanup.md             # 클린업 실행 가이드
    ├── 02-color-unification.md   # 색상 통일 프롬프트
    ├── 03-component-replacement.md  # 컴포넌트 교체 가이드
    └── 04-verification.md        # 검증 체크리스트
```

---

## 🚀 빠른 시작

### 1. 이 폴더를 도매 개발 프로젝트로 복사

```bash
# 현재 위치에서
cp -r /path/to/design-handoff /도매개발폴더/design-handoff
```

### 2. 가이드 문서 읽기

순서대로 읽어주세요:

1. **`00-guides/README.md`** (이 파일) - 폴더 구조 이해
2. **`00-guides/DESIGN_SYSTEM.md`** - 디자인 시스템 전체 파악
3. **`00-guides/DEVELOPER_GUIDE.md`** - 구현 방법 학습

### 3. 디자인 토큰 확인

`01-design-tokens/` 폴더의 JSON 파일들을 열어 색상, 타이포그래피, 간격, 그림자 값을 확인하세요.

### 4. 통합 시작

`05-integration-prompts/` 폴더의 프롬프트를 순서대로 따라 실행하세요.

---

## 📖 파일 종류별 설명

### 📌 디자인 토큰 (JSON)

**위치**: `01-design-tokens/`

디자인 시스템의 기본 값들을 JSON 형식으로 정의했습니다.

#### `colors.json`
- Primary 색상: `#10B981` (Emerald Green)
- 색상 팔레트, Variants, 사용처
- Tailwind 클래스 매핑

**사용 예시**:
```typescript
// colors.json 읽기
import colors from './design-handoff/01-design-tokens/colors.json';

// Primary 색상 가져오기
const primaryColor = colors.colors.primary.value; // "#10B981"
```

#### `typography.json`
- 폰트 패밀리: Pretendard Variable
- 폰트 크기, 두께, 행간, 자간
- 텍스트 스타일 조합 (h1, h2, body 등)

#### `spacing.json`
- 간격 시스템 (Tailwind 기반)
- 컴포넌트별 표준 간격
- 반응형 간격 가이드

#### `shadows.json`
- 그림자 값 (shadow-sm ~ shadow-2xl)
- 커스텀 그림자 (3D 효과, 포커스 링 등)
- 트랜지션, 변형 효과

---

### 📌 컴포넌트 명세서 (Markdown)

**위치**: `02-components/*/spec.md`

각 컴포넌트의 디자인 명세를 상세히 문서화했습니다.

**구조**:
```markdown
# [컴포넌트명] 디자인 명세서

## 1. 컴포넌트 개요
- 용도, 사용 위치

## 2. Variants (종류)
- Primary, Secondary, Ghost 등

## 3. States (상태)
- Default, Hover, Focus, Active, Disabled

## 4. Props 정의
- TypeScript interface

## 5. 스타일 명세
- 색상, 크기, 간격, 그림자

## 6. 사용 예시
```

**읽는 방법**:
1. 컴포넌트 개요로 전체 파악
2. Variants에서 어떤 종류가 있는지 확인
3. States에서 상태별 스타일 차이 확인
4. Props 정의로 구현 시 필요한 인터페이스 파악
5. 스타일 명세로 Tailwind 클래스 확인
6. 사용 예시로 실제 코드 작성법 학습

---

### 📌 컴포넌트 퍼블리싱 코드 (TSX)

**위치**: `02-components/*/code.tsx`

비즈니스 로직이 제거된 순수 UI 코드입니다.

**특징**:
- ✅ JSX 구조와 Tailwind 클래스 포함
- ✅ Props interface 정의
- ✅ 모든 Variants와 States 구현
- ❌ 비즈니스 로직 없음 (useState, useEffect, API 호출 등)
- ❌ 더미 데이터 최소화

**사용 방법**:
1. 파일을 열어 JSX 구조 확인
2. 필요한 Tailwind 클래스 복사
3. 기존 컴포넌트에 스타일 적용
4. Props interface를 참고해 타입 정의

---

### 📌 페이지 명세서 (Markdown)

**위치**: `03-pages/*/SPEC.md`

각 페이지의 디자인을 상세히 설명합니다.

**구조**:
```markdown
# [페이지명] 디자인 명세서

## 1. 페이지 개요
## 2. 레이아웃 구조
## 3. 컴포넌트 목록
## 4. 색상 사용
## 5. 반응형 동작
## 6. 인터랙션
## 7. 구현 노트
```

**활용법**:
- 페이지 전체 구조 파악
- 사용된 컴포넌트 목록 확인
- 반응형 동작 이해
- 주의사항 확인

---

### 📌 페이지 퍼블리싱 코드 (TSX)

**위치**: `03-pages/*/publishing.tsx`

페이지의 UI 구조를 담은 코드입니다.

**특징**:
- ✅ 전체 페이지 레이아웃
- ✅ 섹션별 구조와 스타일
- ✅ 반응형 클래스 포함
- ❌ 상태 관리 로직 제거
- ❌ API 호출 제거
- 📝 주석으로 로직 연결 지점 표시

**사용 방법**:
1. 파일 열어 전체 구조 파악
2. 섹션별로 복사해서 적용
3. 주석을 참고해 비즈니스 로직 연결
4. 더미 데이터를 실제 데이터로 교체

---

### 📌 통합 프롬프트 (Markdown)

**위치**: `05-integration-prompts/`

AI 어시스턴트(Claude Code 등)에게 전달할 실행 프롬프트입니다.

**사용 방법**:
1. 프롬프트 파일 열기
2. 내용 전체 복사
3. AI 어시스턴트에 붙여넣기
4. AI가 자동으로 작업 수행

**순서**:
1. `01-cleanup.md` - 레거시 코드 정리
2. `02-color-unification.md` - 색상 통일
3. `03-component-replacement.md` - 컴포넌트 교체
4. `04-verification.md` - 검증 실행

---

## 🎯 파일 네이밍 규칙

### 명세서 (Markdown)
- 컴포넌트 명세: `spec.md`
- 페이지 명세: `SPEC.md` (대문자)

### 코드 파일 (TSX)
- 컴포넌트 퍼블리싱 코드: `code.tsx`
- 페이지 퍼블리싱 코드: `publishing.tsx`
- 원본 모달 파일: `[ComponentName].tsx` (PascalCase)

### 디자인 토큰 (JSON)
- 소문자, 하이픈 구분: `colors.json`, `typography.json`

---

## 🔍 주요 컨셉 설명

### 디자인 토큰이란?

디자인 시스템의 기본 단위 값들을 변수화한 것입니다.

**예시**:
```json
// colors.json
{
  "primary": {
    "value": "#10B981",
    "hover": "#059669"
  }
}
```

이를 코드에서 사용:
```tsx
// Tailwind
<button className="bg-[#10B981] hover:bg-[#059669]">

// 또는 CSS 변수
<button className="bg-primary hover:bg-primary-hover">
```

### 퍼블리싱 코드란?

비즈니스 로직이 제거된 순수 UI 코드입니다.

**퍼블리싱 코드** (디자인만):
```tsx
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-[#10B981] px-4 py-2 rounded-lg">
      {children}
    </button>
  );
}
```

**실제 개발 코드** (로직 포함):
```tsx
export function Button({ onClick, loading }: ButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick?.();
    // 비즈니스 로직...
  };

  return (
    <button
      className="bg-[#10B981] px-4 py-2 rounded-lg"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

---

## ⚙️ Tailwind CSS 사용 가이드

### 색상 적용

```tsx
{/* Primary 색상 */}
<div className="bg-[#10B981] text-white">

{/* Hover 색상 */}
<button className="bg-[#10B981] hover:bg-[#059669]">

{/* Tailwind 기본 색상 */}
<div className="bg-emerald-500 hover:bg-emerald-600">
```

### 간격 적용

```tsx
{/* Padding */}
<div className="p-6">           {/* 24px */}
<div className="px-4 py-2">     {/* 가로 16px, 세로 8px */}

{/* Margin */}
<div className="mt-4 mb-6">     {/* 위 16px, 아래 24px */}

{/* Gap (Flexbox/Grid) */}
<div className="flex gap-4">    {/* 요소 간 16px */}
```

### 반응형 클래스

```tsx
{/* Mobile First */}
<div className="text-sm lg:text-base">  {/* 모바일: 14px, 데스크톱: 16px */}

{/* Hidden/Visible */}
<div className="hidden lg:block">       {/* 데스크톱에서만 표시 */}
<div className="lg:hidden">             {/* 모바일에서만 표시 */}
```

### 그림자 & 효과

```tsx
{/* 그림자 */}
<div className="shadow-md hover:shadow-xl">

{/* 트랜지션 */}
<div className="transition-all duration-300">

{/* 변형 */}
<div className="hover:-translate-y-1 hover:scale-102">
```

---

## 🛠 개발 워크플로우

### 1단계: 준비
- [ ] `design-handoff` 폴더를 도매 개발 프로젝트로 복사
- [ ] `00-guides/DESIGN_SYSTEM.md` 읽고 디자인 시스템 이해
- [ ] `00-guides/DEVELOPER_GUIDE.md` 읽고 통합 전략 파악

### 2단계: 클린업
- [ ] `05-integration-prompts/01-cleanup.md` 프롬프트 실행
- [ ] 레거시 코드 정리 완료 확인

### 3단계: 색상 통일
- [ ] `05-integration-prompts/02-color-unification.md` 프롬프트 실행
- [ ] 모든 파일의 색상이 `#10B981`로 통일되었는지 확인

### 4단계: 컴포넌트 교체
- [ ] `05-integration-prompts/03-component-replacement.md` 프롬프트 실행
- [ ] 컴포넌트별 명세서와 퍼블리싱 코드 참조
- [ ] 순서: 버튼 → 카드 → 폼 → 모달 → 테이블 → 네비게이션

### 5단계: 페이지 통합
- [ ] `03-pages/*/SPEC.md` 읽고 페이지 구조 파악
- [ ] `03-pages/*/publishing.tsx` 참조해 스타일 적용
- [ ] 페이지별로 순차 작업

### 6단계: 검증
- [ ] `05-integration-prompts/04-verification.md` 체크리스트 실행
- [ ] 빌드 에러 확인
- [ ] 반응형 테스트
- [ ] 브라우저 크로스 체크

---

## 💡 팁 & 모범 사례

### ✅ DO (권장)

1. **디자인 토큰 먼저 확인**
   - 하드코딩하지 말고 토큰 값 사용

2. **명세서를 먼저 읽기**
   - 코드만 보지 말고 명세서로 전체 파악

3. **컴포넌트 단위로 작업**
   - 한 번에 하나씩 교체

4. **반응형을 항상 고려**
   - `lg:` 브레이크포인트 확인

5. **검증 단계 건너뛰지 않기**
   - 각 단계마다 빌드 확인

### ❌ DON'T (피해야 할 것)

1. **명세서 없이 코드만 복사**
   - 맥락을 이해하지 못하면 오류 발생

2. **여러 컴포넌트 동시 작업**
   - 충돌 위험

3. **Tailwind 클래스 임의 수정**
   - 디자인 시스템 일관성 깨짐

4. **반응형 테스트 생략**
   - 모바일에서 레이아웃 깨질 수 있음

5. **검증 없이 다음 단계 진행**
   - 누적된 오류는 디버깅 어려움

---

## 📞 도움이 필요하면

### 1. 가이드 문서 확인
- `DEVELOPER_GUIDE.md` - 구현 방법 상세 설명
- `DESIGN_SYSTEM.md` - 디자인 시스템 전체 명세

### 2. 명세서 참조
- 각 컴포넌트/페이지의 `spec.md` 또는 `SPEC.md` 확인

### 3. 퍼블리싱 코드 확인
- `code.tsx` 또는 `publishing.tsx` 파일 열어보기

### 4. 디자인 토큰 검색
- JSON 파일에서 Ctrl+F로 원하는 값 찾기

---

## 📝 버전 히스토리

### v1.0.0 (2024-12-04)
- 초기 디자인 전달 폴더 생성
- 9개 페이지 + 3개 모달 명세 및 코드 작성
- 4개 디자인 토큰 파일 작성
- 3개 가이드 문서 작성
- 4개 통합 프롬프트 작성

---

**작성자**: Claude Code
**문의**: 디자인 전달 폴더 관련 질문은 `DEVELOPER_GUIDE.md`의 FAQ 섹션을 참조하세요.
