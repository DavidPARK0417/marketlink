# 통합 프롬프트 (Integration Prompts)

이 파일은 AI(Cursor, ChatGPT 등)에게 리디자인된 코드를 실제 프로젝트에 적용해달라고 요청할 때 사용할 수 있는 프롬프트 모음입니다.

---

## 프롬프트 1: 안전한 코드 교체 (기본)

```text
[상황 설명]
현재 design-handoff/03-pages/[페이지명] 폴더에 최종 디자인이 적용된 code.tsx가 있습니다.
이 코드를 실제 개발 폴더인 farmtobiz/app/wholesaler/[페이지명]/page.tsx 에 적용하고 싶습니다.

[요청 사항]
1. 실제 개발 폴더의 page.tsx 내용을 읽어보세요.
2. design-handoff의 code.tsx 내용으로 코드를 완전히 교체(Overwrite)해주세요.
3. 단, 교체 과정에서 필요한 라이브러리(lucide-react 등)나 컴포넌트(Modal 등) import 경로가 올바른지 확인해주세요.
4. 디자인 관련 주석이나 이전 스타일 코드는 모두 삭제해주세요.
```

## 프롬프트 2: 로직 유지하며 디자인만 입히기 (고급)

```text
[상황 설명]
farmtobiz/app/wholesaler/[페이지명]/page.tsx 에는 이미 백엔드와 연동된 비즈니스 로직(fetchData, useEffect 등)이 포함되어 있습니다.
design-handoff/03-pages/[페이지명]/code.tsx 는 로직 없이 UI만 구현된 더미 코드입니다.

[요청 사항]
1. 기존 page.tsx의 비즈니스 로직(데이터 fetching, 상태 관리 등)은 보존하세요.
2. UI 부분(return 문 내부의 JSX 및 Tailwind 클래스)만 design-handoff의 코드로 교체해주세요.
3. 기존 로직의 변수명과 새로운 UI의 변수명이 다르다면, UI 쪽 변수명을 기존 로직에 맞춰 수정해주세요.
4. 색상이나 레이아웃은 무조건 design-handoff의 스타일을 따라야 합니다.
```

## 프롬프트 3: 전체 테마 정리 (Cleanup)

```text
[상황 설명]
프로젝트 전체적으로 Blue 테마에서 Green 테마로 변경되었습니다.
아직 남아있는 레거시 스타일 코드를 찾아서 정리하고 싶습니다.

[요청 사항]
1. farmtobiz/app/wholesaler 폴더 내의 모든 파일에서 'bg-blue-500', 'text-blue-600' 등 파란색 계열 클래스가 남아있는지 검색해주세요.
2. 발견된다면, 이것이 의도된 것인지(예: 정보성 아이콘) 아니면 레거시인지 판단하고, 레거시라면 Green 계열(#10B981)로 수정해주세요.
3. 주석 중 "기존 디자인", "임시 스타일" 등이 포함된 라인을 찾아 삭제해주세요.
```


