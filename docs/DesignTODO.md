# 디자인 변경 작업 계획서 (Design Migration Plan)

**작성일**: 2024-12-04  
**목표**: Blue 테마 → Green 테마 (Farm to Biz 디자인 시스템)  
**참고 URL**: https://marketlink-sigma.vercel.app/wholesaler/dashboard  
**디자인 핸드오프 경로**: `docs/design-handoff_D/`

---

## 📋 작업 원칙

### 핵심 원칙

1. ✅ **기존 비즈니스 로직 보존**: 데이터 fetching, 상태 관리 로직은 절대 삭제하지 않음
2. ✅ **Pretendard Variable 폰트로 완전 교체**: Geist 폰트 제거
3. ✅ **디자인팀 제공 디자인 그대로 반영**: `design-handoff_D` 폴더의 코드 기준
4. ✅ **관리자 페이지도 동일한 디자인 기준 적용**
5. ✅ **각 페이지 교체 후 즉시 테스트**: 빌드 에러 및 브라우저 테스트

### 작업 전 필수 확인사항

- [ ] Git 커밋 (백업)
- [ ] 현재 빌드 상태 확인 (`pnpm run build`)
- [ ] 개발 서버 정상 작동 확인 (`pnpm run dev`)

---

## Phase 1: 전역 디자인 토큰 통합 ⚡ (최우선)

### 1.1 Pretendard Variable 폰트 추가

**작업 파일**: `app/globals.css`

**작업 내용**:

- [x] Pretendard Variable CDN 추가
- [x] `--font-sans` 변수를 Pretendard로 변경
- [x] Geist 폰트 관련 코드 제거 또는 주석 처리

**체크리스트**:

- [x] `globals.css`에 Pretendard Variable CDN 추가 확인
- [x] 빌드 후 폰트 적용 확인 (`pnpm run build`)
- [ ] 브라우저에서 폰트 로딩 확인 (개발 서버 실행 후 확인 필요)

**참고 코드**:

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css");

@theme inline {
  --font-sans: "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui,
    Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR",
    "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
}
```

---

### 1.2 색상 시스템 변경 (Blue → Green)

**작업 파일**: `app/globals.css`

**작업 내용**:

- [x] `--primary` 색상을 `#10B981` (Emerald Green)로 변경
- [x] 프로젝트 전체에서 Blue 계열 하드코딩 클래스 검색 및 교체

**체크리스트**:

- [x] `globals.css`의 `--primary: #137fec` → `--primary: #10B981` 변경
- [x] `grep -r "bg-blue" app/ components/` 실행하여 Blue 클래스 검색
- [x] `grep -r "text-blue" app/ components/` 실행하여 Blue 클래스 검색
- [x] 발견된 Blue 클래스를 Green 계열로 교체
- [x] shadcn/ui 컴포넌트가 CSS 변수를 사용하므로 자동 반영 확인

**교체 매핑**:

- `bg-blue-500` → `bg-[#10B981]` 또는 `bg-emerald-500`
- `text-blue-600` → `text-[#10B981]` 또는 `text-emerald-600`
- `border-blue-500` → `border-[#10B981]` 또는 `border-emerald-500`

**참고 파일**:

- `docs/design-handoff_D/01-design-tokens/colors.json`

---

### 1.3 디자인 토큰 파일 통합 (선택사항)

**작업 내용**:

- [ ] 디자인 토큰 JSON 파일을 프로젝트에 통합할지 결정
- [ ] 필요시 `lib/design-tokens/` 폴더 생성 및 파일 복사

**체크리스트**:

- [ ] 디자인 토큰 파일 통합 필요성 검토
- [ ] Tailwind 설정에 커스텀 색상 추가 여부 결정
- [ ] (선택) 디자인 토큰 파일 복사

---

## Phase 2: 레이아웃 교체 🎨

### 2.1 WholesalerLayoutClient UI 교체

**작업 파일**:

- `components/wholesaler/Layout/WholesalerLayoutClient.tsx`
- `components/wholesaler/Layout/Header.tsx` (필요시)
- `components/wholesaler/Layout/Sidebar.tsx` (필요시)

**참고 파일**: `docs/design-handoff_D/03-pages/layout/code.tsx`

**작업 내용**:

- [x] 기존 `WholesalerLayoutClient.tsx` 백업
- [x] 디자인 핸드오프의 레이아웃 코드 확인
- [x] 기존 로직 통합:
  - [x] `useUser`, `useClerk` 훅 유지
  - [x] `useWholesaler` 훅 유지
  - [x] 로그아웃 로직 유지
  - [x] TermsModal, PrivacyModal 연동 유지 (Footer 컴포넌트에서 관리)
- [x] UI 부분만 디자인 핸드오프 스타일로 교체

**체크리스트**:

- [x] 레이아웃 파일 백업 완료
- [x] 디자인 핸드오프 레이아웃 코드 복사
- [x] 기존 인증/사용자 로직 통합 완료
- [ ] 모바일 메뉴 동작 확인 (브라우저 테스트 필요)
- [ ] 사이드바 네비게이션 하이라이트 확인 (브라우저 테스트 필요)
- [ ] 빌드 에러 확인 (`pnpm run build`) (사용자 확인 필요)
- [ ] 브라우저에서 레이아웃 확인 (사용자 확인 필요)

**주의사항**:

- `app/wholesaler/layout.tsx` (서버 컴포넌트)의 인증/권한 확인 로직은 절대 수정하지 않음
- 클라이언트 컴포넌트의 UI만 교체

---

## Phase 3: 페이지별 교체 📄 (순차 진행)

### 3.1 대시보드 페이지

**작업 파일**: `app/wholesaler/dashboard/page.tsx`

**참고 파일**: `docs/design-handoff_D/03-pages/dashboard/code.tsx`

**현재 상태**:

- ✅ 실제 데이터 fetching 로직 존재 (`useQuery`, `fetchDashboardStats`)
- ✅ 실시간 주문 알림 구독 (`subscribeToNewOrders`)
- ✅ `StatCard`, `RecentOrders`, `LowStockAlert` 컴포넌트 사용

**작업 내용**:

- [x] 기존 파일 백업
- [x] 기존 데이터 fetching 로직 확인 및 보존
- [x] 디자인 핸드오프 코드 확인
- [x] UI 부분만 디자인 핸드오프 스타일로 교체:
  - [x] 알림 배너 스타일 적용 (Green 그라디언트, 3D 효과)
  - [x] 통계 카드 스타일 적용 (3D 효과 카드)
  - [x] 최근 주문 섹션 스타일 적용
  - [x] 재고 부족 알림 스타일 적용

**체크리스트**:

- [x] 기존 데이터 fetching 로직 보존 확인
- [x] 디자인 핸드오프 스타일 적용 완료
- [x] `StatCard` 컴포넌트 스타일 업데이트 또는 인라인 스타일 적용
- [x] 빌드 에러 확인 (`pnpm run build`)
- [ ] 브라우저에서 레이아웃 확인
- [ ] 반응형 확인 (모바일/태블릿/데스크톱)
- [ ] 데이터 표시 정상 확인

---

### 3.2 상품 관리 페이지

**작업 파일**: `app/wholesaler/products/page.tsx`

**참고 파일**: `docs/design-handoff_D/03-pages/products/code.tsx`

**작업 내용**:

- [x] 기존 파일 백업
- [x] 기존 데이터 fetching 로직 확인 및 보존
- [x] 디자인 핸드오프 코드 확인
- [x] UI 부분만 디자인 핸드오프 스타일로 교체

**체크리스트**:

- [x] 기존 로직 보존 확인
- [x] 디자인 핸드오프 스타일 적용
- [x] 빌드 에러 확인
- [ ] 브라우저 테스트
- [ ] 반응형 확인

---

### 3.3 주문 관리 페이지

**작업 파일**: `app/wholesaler/orders/page.tsx`

**참고 파일**: `docs/design-handoff_D/03-pages/orders/code.tsx`

**작업 내용**:

- [ ] 기존 파일 백업
- [ ] 기존 데이터 fetching 로직 확인 및 보존
- [ ] 디자인 핸드오프 코드 확인
- [ ] UI 부분만 디자인 핸드오프 스타일로 교체

**체크리스트**:

- [ ] 기존 로직 보존 확인
- [ ] 디자인 핸드오프 스타일 적용
- [ ] 빌드 에러 확인
- [ ] 브라우저 테스트
- [ ] 반응형 확인

---

### 3.4 정산 관리 페이지

**작업 파일**: `app/wholesaler/settlements/page.tsx`

**참고 파일**: `docs/design-handoff_D/03-pages/settlements/code.tsx`

**작업 내용**:

- [ ] 기존 파일 백업
- [ ] 기존 데이터 fetching 로직 확인 및 보존
- [ ] 디자인 핸드오프 코드 확인
- [ ] UI 부분만 디자인 핸드오프 스타일로 교체

**체크리스트**:

- [ ] 기존 로직 보존 확인
- [ ] 디자인 핸드오프 스타일 적용
- [ ] 빌드 에러 확인
- [ ] 브라우저 테스트
- [ ] 반응형 확인

---

### 3.5 시장 가격 페이지

**작업 파일**: `app/wholesaler/market-prices/page.tsx`

**참고 파일**: `docs/design-handoff_D/03-pages/market-prices/code.tsx`

**작업 내용**:

- [ ] 기존 파일 백업
- [ ] 기존 데이터 fetching 로직 확인 및 보존
- [ ] 디자인 핸드오프 코드 확인
- [ ] UI 부분만 디자인 핸드오프 스타일로 교체

**체크리스트**:

- [ ] 기존 로직 보존 확인
- [ ] 디자인 핸드오프 스타일 적용
- [ ] 빌드 에러 확인
- [ ] 브라우저 테스트
- [ ] 반응형 확인

---

### 3.6 고객 지원 페이지

**작업 파일**: `app/wholesaler/support/page.tsx`

**참고 파일**: `docs/design-handoff_D/03-pages/cs/code.tsx`

**작업 내용**:

- [ ] 기존 파일 백업
- [ ] 기존 데이터 fetching 로직 확인 및 보존
- [ ] 디자인 핸드오프 코드 확인
- [ ] UI 부분만 디자인 핸드오프 스타일로 교체

**체크리스트**:

- [ ] 기존 로직 보존 확인
- [ ] 디자인 핸드오프 스타일 적용
- [ ] 빌드 에러 확인
- [ ] 브라우저 테스트
- [ ] 반응형 확인

---

### 3.7 설정 페이지

**작업 파일**: `app/wholesaler/settings/page.tsx`

**참고 파일**: `docs/design-handoff_D/03-pages/settings/code.tsx`

**작업 내용**:

- [ ] 기존 파일 백업
- [ ] 기존 데이터 fetching 로직 확인 및 보존
- [ ] 디자인 핸드오프 코드 확인
- [ ] UI 부분만 디자인 핸드오프 스타일로 교체

**체크리스트**:

- [ ] 기존 로직 보존 확인
- [ ] 디자인 핸드오프 스타일 적용
- [ ] 빌드 에러 확인
- [ ] 브라우저 테스트
- [ ] 반응형 확인

---

## Phase 4: 공통 컴포넌트 스타일 업데이트 🧩

### 4.1 버튼 컴포넌트

**작업 파일**: `components/ui/button.tsx`

**작업 내용**:

- [ ] `rounded-xl` 적용 (12px)
- [ ] Green 색상 적용 (`bg-[#10B981]`, `hover:bg-[#059669]`)
- [ ] 호버 효과 추가 (`hover:-translate-y-0.5`, `hover:shadow-lg`)
- [ ] 액티브 효과 추가 (`active:scale-98`)
- [ ] 트랜지션 추가 (`transition-all duration-300`)

**체크리스트**:

- [ ] 버튼 스타일 업데이트 완료
- [ ] 모든 버튼 variant 확인
- [ ] 빌드 에러 확인

**참고**: `docs/design-handoff_D/02-components/buttons/code.tsx`

---

### 4.2 카드 컴포넌트

**작업 파일**: `components/ui/card.tsx`

**작업 내용**:

- [ ] `rounded-2xl` 또는 `rounded-3xl` 적용 (16px~24px)
- [ ] 그림자 효과 추가 (`shadow-md`, `hover:shadow-xl`)
- [ ] 호버 효과 추가 (`hover:-translate-y-1`)
- [ ] 트랜지션 추가 (`transition-all duration-300`)

**체크리스트**:

- [ ] 카드 스타일 업데이트 완료
- [ ] 빌드 에러 확인

**참고**: `docs/design-handoff_D/02-components/cards/code.tsx`

---

### 4.3 입력 필드 컴포넌트

**작업 파일**: `components/ui/input.tsx`

**작업 내용**:

- [ ] `rounded-xl` 적용 (12px)
- [ ] 포커스 링 색상 Green으로 변경 (`focus:ring-[#10B981]`)
- [ ] 트랜지션 추가 (`transition-colors duration-150`)

**체크리스트**:

- [ ] 입력 필드 스타일 업데이트 완료
- [ ] 빌드 에러 확인

**참고**: `docs/design-handoff_D/02-components/forms/code.tsx`

---

### 4.4 테이블 컴포넌트

**작업 파일**: `components/ui/table.tsx`

**작업 내용**:

- [ ] 디자인 핸드오프 스타일 확인
- [ ] 필요시 스타일 업데이트

**체크리스트**:

- [ ] 테이블 스타일 확인 및 업데이트
- [ ] 빌드 에러 확인

**참고**: `docs/design-handoff_D/02-components/tables/code.tsx`

---

### 4.5 모달 컴포넌트

**작업 파일**: `components/ui/dialog.tsx`

**작업 내용**:

- [ ] 디자인 핸드오프 모달 스타일 확인
- [ ] 백드롭 블러 효과 확인 (`backdrop-blur-sm`)
- [ ] 필요시 스타일 업데이트

**체크리스트**:

- [ ] 모달 스타일 확인 및 업데이트
- [ ] 빌드 에러 확인

**참고**: `docs/design-handoff_D/02-components/modals/`

---

## Phase 5: 관리자 페이지 디자인 통합 👑

### 5.1 관리자 레이아웃 업데이트

**작업 파일**: `app/admin/layout.tsx`

**작업 내용**:

- [ ] 관리자 레이아웃 확인
- [ ] Green 테마 적용
- [ ] Pretendard 폰트 적용
- [ ] 도매 레이아웃과 동일한 디자인 시스템 적용

**체크리스트**:

- [ ] 관리자 레이아웃 스타일 업데이트
- [ ] 빌드 에러 확인
- [ ] 브라우저 테스트

---

### 5.2 관리자 페이지들 스타일 통일

**작업 파일**: `app/admin/**/*.tsx`

**작업 내용**:

- [ ] 각 관리자 페이지 확인
- [ ] Green 테마 적용
- [ ] 공통 컴포넌트 스타일 적용

**체크리스트**:

- [ ] 관리자 대시보드 스타일 업데이트
- [ ] 관리자 CS 페이지 스타일 업데이트
- [ ] 기타 관리자 페이지 스타일 업데이트
- [ ] 빌드 에러 확인

---

## Phase 6: 빌드 에러 예방 및 검증 🔍

### 6.1 각 페이지 교체 후 빌드 체크리스트

**Import 관련**:

- [ ] 사용하는 모든 컴포넌트가 import 되어 있는가?
- [ ] shadcn/ui 컴포넌트는 올바른 경로에서 import 하는가? (`@/components/ui/`)
- [ ] `lucide-react` 아이콘은 올바르게 import 하는가?
- [ ] 존재하지 않는 모듈을 import 하지 않았는가?

**타입 관련**:

- [ ] TypeScript 컴파일 에러가 없는가? (`pnpm run build`)
- [ ] 인터페이스에 실제 사용되는 모든 속성이 정의되어 있는가?
- [ ] Optional 속성은 `?`로 명시되어 있는가?
- [ ] HTML 속성과 커스텀 prop이 충돌하지 않는가?

**컴포넌트 Prop**:

- [ ] 사용하는 컴포넌트의 실제 prop 인터페이스를 확인했는가?
- [ ] shadcn/ui 컴포넌트는 `open`/`onOpenChange` 패턴을 사용하는가?
- [ ] 함수 파라미터 타입이 실제 전달되는 값의 타입과 일치하는가?

**스타일 관련**:

- [ ] Tailwind 클래스 문법 오류 없음
- [ ] 색상 코드 형식 확인 (`#10B981` 또는 `bg-[#10B981]`)

**참고 문서**: `docs/디자인변경_빌드에러대비.md`

---

### 6.2 테스트 전략

**각 페이지 교체 후 즉시 테스트**:

1. **빌드 테스트**

   ```bash
   pnpm run build
   ```

   - [ ] 빌드 성공 확인
   - [ ] TypeScript 에러 없음 확인
   - [ ] 경고 메시지 확인

2. **개발 서버 실행**

   ```bash
   pnpm run dev
   ```

   - [ ] 서버 정상 시작 확인
   - [ ] 콘솔 에러 없음 확인

3. **브라우저 테스트**

   - [ ] 페이지 로딩 확인
   - [ ] 레이아웃 깨짐 확인
   - [ ] 반응형 확인 (모바일/태블릿/데스크톱)
   - [ ] 인터랙션 확인 (호버, 클릭 등)
   - [ ] 데이터 표시 확인

4. **기능 테스트**
   - [ ] 데이터 fetching 정상 작동 확인
   - [ ] 상태 관리 정상 작동 확인
   - [ ] 네비게이션 정상 작동 확인
   - [ ] 폼 제출 정상 작동 확인 (해당 페이지에 있는 경우)

---

## Phase 7: 정리 및 문서화 📝

### 7.1 레거시 코드 정리

**정리 대상**:

- [ ] 사용하지 않는 Blue 계열 클래스 제거
- [ ] 주석 처리된 코드 제거
- [ ] 사용하지 않는 컴포넌트 제거
- [ ] 사용하지 않는 import 제거

**검색 명령어**:

```bash
# Blue 계열 클래스 검색
grep -r "bg-blue" app/ components/
grep -r "text-blue" app/ components/
grep -r "border-blue" app/ components/

# 주석 처리된 코드 검색
grep -r "//.*TODO.*디자인" app/ components/
grep -r "//.*기존.*디자인" app/ components/
```

---

### 7.2 문서 업데이트

**작업 내용**:

- [ ] 디자인 변경 이력 문서화
- [ ] 변경된 색상/폰트 시스템 문서화
- [ ] README 업데이트 (필요시)

---

## 🚨 주의사항

### 절대 하지 말아야 할 것

1. ❌ 기존 데이터 fetching 로직 삭제
2. ❌ 상태 관리 로직 삭제
3. ❌ 인증/권한 확인 로직 수정
4. ❌ 한 번에 모든 것을 변경
5. ❌ 테스트 없이 다음 단계로 진행

### 반드시 해야 할 것

1. ✅ 각 단계마다 Git 커밋
2. ✅ 각 페이지 교체 후 즉시 빌드 테스트
3. ✅ 각 페이지 교체 후 즉시 브라우저 테스트
4. ✅ 기존 로직 보존 확인
5. ✅ 빌드 에러 대비 가이드라인 참고

---

## 📊 진행 상황 추적

### Phase 1: 전역 디자인 토큰 통합

- [ ] 1.1 Pretendard 폰트 추가
- [x] 1.2 Green 색상 시스템 적용
- [ ] 1.3 디자인 토큰 파일 통합 (선택사항)

### Phase 2: 레이아웃 교체

- [x] 2.1 WholesalerLayoutClient UI 교체

### Phase 3: 페이지별 교체

- [ ] 3.1 대시보드 페이지
- [ ] 3.2 상품 관리 페이지
- [ ] 3.3 주문 관리 페이지
- [ ] 3.4 정산 관리 페이지
- [ ] 3.5 시장 가격 페이지
- [ ] 3.6 고객 지원 페이지
- [ ] 3.7 설정 페이지

### Phase 4: 공통 컴포넌트 스타일 업데이트

- [ ] 4.1 버튼 컴포넌트
- [ ] 4.2 카드 컴포넌트
- [ ] 4.3 입력 필드 컴포넌트
- [ ] 4.4 테이블 컴포넌트
- [ ] 4.5 모달 컴포넌트

### Phase 5: 관리자 페이지 디자인 통합

- [ ] 5.1 관리자 레이아웃 업데이트
- [ ] 5.2 관리자 페이지들 스타일 통일

### Phase 6: 빌드 에러 예방 및 검증

- [ ] 각 페이지별 빌드 체크리스트 완료
- [ ] 각 페이지별 테스트 완료

### Phase 7: 정리 및 문서화

- [ ] 레거시 코드 정리
- [ ] 문서 업데이트

---

## 📚 참고 자료

- **디자인 시스템 명세서**: `docs/design-handoff_D/00-guides/DESIGN_SYSTEM.md`
- **개발자 가이드**: `docs/design-handoff_D/00-guides/DEVELOPER_GUIDE.md`
- **빌드 에러 대비 가이드**: `docs/디자인변경_빌드에러대비.md`
- **디자인 토큰**: `docs/design-handoff_D/01-design-tokens/`
- **컴포넌트 명세**: `docs/design-handoff_D/02-components/`
- **페이지 코드**: `docs/design-handoff_D/03-pages/`
- **통합 가이드**: `docs/design-handoff_D/05-integration-prompts/`

---

## 🎯 최종 목표

- ✅ 모든 도매 페이지가 Green 테마로 통일
- ✅ Pretendard Variable 폰트 적용
- ✅ 디자인팀 제공 디자인 100% 반영
- ✅ 관리자 페이지도 동일한 디자인 시스템 적용
- ✅ 모든 페이지 빌드 에러 없음
- ✅ 모든 페이지 브라우저 테스트 통과
- ✅ 기존 기능 정상 작동 확인

---

**작성자**: AI Assistant  
**최종 수정**: 2024-12-04
