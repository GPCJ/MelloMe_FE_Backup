---
name: ""
description: 노션에 작성할 초안. /report-notion으로 업로드 가능.
metadata: 
  node_type: memory
  type: draft
  updated: 2026-05-14
  originSessionId: bf35a4fe-ef03-404b-a596-d2fba944acf1
---

> ⚠️ **노션 업로드 시 확인 사항**
> - 트러블슈팅 번호(#010, #011)는 메모리상 #009(2026-04-10)까지 기록. 노션 페이지 직접 확인 후 실제 마지막 번호 +1부터 부여.
> - 페이지 ID:
>   - TIL: `323c8200749b80c2bbe6caf194055593`
>   - 🔧 트러블슈팅: `322c8200749b81f39f71f9c8a4d6eb44`
>   - 🏗 설계 결정: `32dc8200749b81e899bde7aea0a37937`
>   - 📈 성과 & 지표: `32dc8200749b8157b695e5e84e60e01b`

---

# [TIL] 2026-05-12 — PostCard 이미지 캐러셀 + useDragScroll 공용 훅 추출

**분류**: 리팩터링 · 컴포넌트

## 오늘 한 것

PostCard에 첨부 이미지를 가로 캐러셀로 노출하면서, 5/10 작성 모달과 PostDetailPage에 박혀있던 인라인 드래그 스크롤 코드를 `useDragScroll` 공용 훅으로 추출했습니다. 같은 35줄짜리 로직이 세 곳에 복제되어 있던 상태를 한 군데로 모았습니다.

목록 응답(`PostSummary`)에 `imageUrls: string[]` 필드가 들어오기 시작해서, 카드 본문 아래에 240×240 썸네일을 좌우로 끌리는 형태로 렌더했습니다. 첨부가 없는 카드는 영역 자체를 렌더하지 않도록 `imageUrls && imageUrls.length > 0` 가드를 뒀고, `crossOrigin="anonymous"`로 S3 응답의 캔버스 오염을 막았습니다.

## 배운 것 / 인사이트

### "세 번째에 추출한다"는 규칙을 그대로 따랐지만, 두 번째 때 미리 뺐어야 했습니다

5/10 작성 모달 때 칩 가로 스크롤과 이미지 미리보기 양쪽에서 같은 패턴이 필요해 `PostWriteForm` 안에 작은 helper 함수로 처음 등장시켰습니다. 같은 패턴을 PostDetailPage의 첨부 이미지 영역에서도 또 써야 했는데, 그때는 또 인라인으로 복제해 뒀습니다. 이번에 PostCard에 이미지 캐러셀을 붙이면서 세 번째 호출이 필요해졌고 그제서야 `hooks/useDragScroll.ts`로 빼냈습니다.

"한 번이면 둔다, 두 번이면 메모해둔다, 세 번이면 추출한다"는 일반 규칙을 그대로 따랐는데, 두 번째 복제 때 "어차피 작은 함수니까 다시 복사하면 되지" 싶었던 게 후회로 남습니다. 추출은 5분이고 추후 변경 시 세 곳 동기화 누락 위험이 훨씬 컸습니다.

### 훅의 반환값에 "상태 ref"를 노출해서 부모가 가드 판단에 쓸 수 있게 했습니다

훅 안에서 mousedown 시작점/이동거리(`moved`)를 `useRef`로 들고 있는데, 보통이라면 외부에 노출하지 않을 내부 상태입니다. 그런데 이 훅의 사용처는 모두 "드래그가 끝날 때 mouseup이 click으로 이어지지 않도록 부모에서 흡수해야 한다"는 공통 요구가 있었습니다. 그래서 `state` ref 자체를 반환해 부모가 `onClickCapture`에서 `state.current.moved > 5`로 직접 가드 조건을 작성하게 했습니다.

대안은 훅 내부에 click 가드를 자동으로 박는 길이었습니다. 거부한 이유는 (1) 가드 대상이 컨테이너냐 부모 `<Link>`냐 사례마다 다름, (2) 5px 임계값이 사례별로 달라질 수 있음, (3) 훅이 click 이벤트까지 가져가면 추상화가 너무 두꺼워짐. 상태만 노출하고 가드 작성은 호출자가 결정하는 분배가 더 자연스러웠습니다.

### 캐러셀 본체 코드는 아직 머릿속에 안 박혔습니다 (인지부채)

캐러셀 구현 부분은 사실 5/10 작성 모달의 칩/미리보기 코드를 거의 복붙한 결과입니다. mousedown에서 시작점을 캡쳐하고 mousemove에서 그 차이만큼 scrollLeft를 갱신하는 흐름까지는 머리로 그릴 수 있는데, 그 뒤로 이어지는 cursor 토글, leave 시 상태 정리, `state.current.moved`로 클릭 흡수까지의 전체 그림은 한 번에 떠오르지 않습니다. PostCard.tsx의 캐러셀 블록에 그 점을 정직하게 코멘트로 남겼습니다("코드 복붙으로 작성한 코드라서 어떻게 돌아가는 코드인지 모름"). 학습 우선순위 후보로 백로그에 박아뒀습니다.

## 포트폴리오 어필 포인트

- 중복 제거 타이밍을 코드로 박제했습니다. "세 번째에 추출"은 규칙이 아니라 임계값이고, 두 번째에서도 추출 비용/유지 비용을 비교해야 한다는 점이 사례에서 확인됐습니다.
- 훅 API 설계에서 "내부 상태 ref를 노출할지 vs 자동 가드를 박을지" 두 길의 트레이드오프를 명시적으로 비교해 정했습니다. 훅의 책임 경계를 정하는 사고를 보여주는 자리입니다.
- 자기 코드 정직성: 이해 못 한 코드 위에 정확하게 "이해 못 했다"는 코멘트를 남기고 학습 후보로 박제하는 태도. AI 작성 코드의 인지부채를 모니터링하는 본인 규칙(메모리)에도 부합합니다.

## 한계점

- 캐러셀은 마우스 드래그 + 네이티브 터치 스크롤 조합입니다. 키보드/스크롤 휠 좌우 이동은 명시적으로 지원하지 않습니다. 접근성 측면에서 키보드 사용자가 캐러셀 안 이미지를 탐색할 길이 없는데, MVP 범위에서는 후순위로 미뤘습니다.
- 이미지 클릭 시 라이트박스/원본 보기는 없습니다. 5px 흡수 가드 때문에 정적 클릭은 부모 `<Link>`로 흘러 상세 진입이 됩니다. "이미지만 크게" 요구가 들어오면 별도 라이트박스가 필요합니다.
- 백엔드 응답의 `imageUrls` 순서/개수에 정렬·limit이 없어 보입니다. 글 하나에 이미지가 10장 넘으면 카드 본문이 화면 폭 이상을 차지합니다. 디자이너 컨펌 후 limit 결정 필요.

---

# [🔧 트러블슈팅] #010 — `<Link>` 안의 캐러셀이 dragstart bubbling으로 끌려가는 문제

**날짜**: 2026-05-12
**분류**: React · 이벤트 시스템 · HTML5 DnD
**난이도**: ⭐⭐⭐

## 문제 상황

PostCard에 가로 드래그 캐러셀을 처음 붙였더니, 이미지를 끌면 카드 전체(헤더+본문 포함)가 따라 움직이는 현상이 보였습니다. 시각적으로는 마우스 커서에 카드 그림자가 따라붙는 형태였고, 드래그를 놓아도 그 잔상이 잠시 남았습니다.

캐러셀 div에는 `onMouseDown/Move/Up`만 붙여 자체 스크롤은 잘 동작하는데, 왜 부모 카드가 끌리는지 처음에는 원인이 안 잡혔습니다.

## 원인 분석

원인은 HTML5 dragstart 이벤트의 버블링이었습니다. `<img>` 위에서 mousedown + move가 일정 거리 이상 진행되면 브라우저가 자동으로 dragstart 이벤트를 발화시킵니다. 이 이벤트는 부모로 버블링되는데, PostCard는 전체가 `<Link>`(=`<a>`)로 감싸여 있었습니다.

`<a>` 태그는 기본적으로 `draggable=true`입니다. 그 위에서 dragstart가 잡히니 브라우저는 "이 링크를 드래그하려는 의도"로 해석해 링크 자체를 끌리는 객체(ghost)로 만들어 버립니다. 마우스 커서에 카드 모양 고스트가 따라붙는 그림이 정확히 이 동작이었습니다.

내가 붙인 mousedown/move 핸들러는 마우스 이벤트만 막았지 dragstart는 막지 않았기 때문에, 두 흐름이 독립적으로 발화한 셈입니다. 캐러셀 자체 스크롤(mousedown 기반)은 정상 동작하면서, 동시에 브라우저의 native DnD(dragstart 기반)가 부모 `<a>`를 끌고 있었습니다.

## 해결 과정

### 1차 시도 — 캐러셀 div에 onDragStart preventDefault

캐러셀 컨테이너 div에 `onDragStart={e => e.preventDefault()}`만 추가했습니다. 동작 변화가 없었습니다. 이유는 dragstart가 `<img>`에서 시작하지 않고 `<a>`(부모)에서 시작·발화한다는 점이었습니다. 자식 div는 그 흐름의 중간에 끼지 않아 핸들러가 호출되지 않았습니다.

### 2차 시도 — `<Link>`에 draggable={false}

근본 차단은 부모 `<a>`가 드래그 가능 요소가 되지 않도록 끄는 것이었습니다. `<Link draggable={false}>` 한 줄로 해결됐습니다. `<a>`가 draggable이 아니면 그 위에서 dragstart 자체가 발화하지 않으니 ghost가 만들어질 일이 없습니다.

### 방어 3겹

`<Link draggable={false}>`로 근본 차단했지만, 1차 시도의 가드도 살려뒀습니다. 미래에 누군가 `<Link>`의 draggable을 되돌리거나 다른 wrapper로 교체하는 경우를 대비한 이중 가드입니다. 추가로 `<img draggable={false}>`도 이미지 단위에서 같이 막았습니다.

```tsx
<Link to={...} draggable={false}>          // 1차 — 근본 차단
  <article>
    <div onDragStart={e => e.preventDefault()}  // 2차 — 컨테이너 가드
         {...handlers}>
      <img draggable={false} />             // 3차 — 이미지 단위
    </div>
  </article>
</Link>
```

### 5px 클릭 흡수 가드 (별도 트랙)

드래그 종료 시 mouseup이 click으로 이어지고, 그 click이 부모 `<Link>`로 버블링되면 의도치 않은 게시글 상세 진입이 발생합니다. 캐러셀 컨테이너 `onClickCapture`에서 `useDragScroll`이 노출하는 `state.current.moved` (드래그 누적 거리)를 보고, 5px 이상이면 `preventDefault + stopPropagation`로 클릭을 흡수합니다. 5px 임계값은 작성 모달 칩에서도 같은 값을 쓰던 케이스에서 이어왔습니다.

## 핵심 개념

- **HTML5 native DnD와 마우스 이벤트는 별도 트랙**입니다. mousedown/move를 막아도 dragstart는 별도로 발화합니다. 둘 다 차단하려면 각각 따로 처리해야 합니다.
- **`<a>`/`<img>` 기본 draggable=true**. 이 둘이 부모/자식으로 있으면 dragstart 발화 지점이 어디인지가 미묘한 차이를 만듭니다. 캐러셀의 `<img>`에 핸들러를 붙여도, dragstart가 부모 `<a>`에서 잡히면 자식 div는 통과 경로 밖입니다.
- **이벤트 버블링 방향이 "내가 핸들러 붙인 곳"과 일치하는지 검증**해야 합니다. 1차 시도가 실패한 이유는 이걸 검증 안 하고 "div에 핸들러 붙였으니 막힐 것"이라고 가정한 것입니다.

## 면접 포인트

- HTML5 DnD가 dragstart→drag→dragend의 별도 라이프사이클을 가지며, 이게 mousedown/move/up 사이클과 독립적으로 동작한다는 점.
- React의 SyntheticEvent도 브라우저의 native dragstart를 그대로 감싸기 때문에 `onDragStart` 핸들러의 호출 지점은 native 발화 위치에 종속됩니다. "내가 붙인 컴포넌트에 핸들러 있다고 잡히는 게 아니다"라는 메커니즘 인지.
- 방어 3겹 패턴: 근본 차단 + 컨테이너 가드 + 단위 가드. 각 층이 서로 다른 미래 변경(wrapper 교체, 자식 추가)을 가정해 살아남는 구조라는 설명을 곁들이면 단순히 "여러 군데 막았다"가 아니라 "각 층이 어떤 회귀를 막는다"는 사고로 보입니다.
- 5px 클릭 흡수 가드는 dragstart 문제와 **별개 트랙**(mouseup→click 흐름)을 다룬 것이며, 둘이 한 화면에서 같이 일어나기 때문에 같이 박제했다는 점.

## 관련

- 메모리 wiki `link-dragstart-bubbling-postcard-2026-05-12` (debugging)
- 메모리 wiki `usedragscroll-onclickcapture-5px-high` (pattern, 인지부채 HIGH)

---

# [TIL] 2026-05-12 — 마이페이지 RQ 캐시 무효화 (옵션 A/B/C 검토)

**분류**: React Query · 상태 관리

## 오늘 한 것

ProfilePage에서 프로필 이미지나 닉네임을 변경했을 때 "내 시그널"/"내 댓글"/"스크랩" 탭의 PostCard 작은 아바타와 닉네임이 옛값을 그대로 들고 있는 버그를 잡았습니다. 헤더의 큰 아바타는 `useAuthStore`를 직접 구독해서 즉시 갱신되는데, 같은 페이지의 RQ 캐시(`['myPosts', page]`, `['myComments', page]`, `['myScraps', page]`)에 들어있는 카드 데이터는 stale로 남는 구조였습니다.

수정은 `handleImageChange`/`handleSaveNickname` 성공 분기에서 `setUser(...)` 직후에 `invalidateMyPageTabs()` 헬퍼를 호출하는 것입니다. 헬퍼는 컴포넌트 내부 closure로 두고 세 queryKey prefix를 한 번에 무효화합니다.

```ts
const queryClient = useQueryClient();
const invalidateMyPageTabs = () => {
  queryClient.invalidateQueries({ queryKey: ['myPosts'] });
  queryClient.invalidateQueries({ queryKey: ['myComments'] });
  queryClient.invalidateQueries({ queryKey: ['myScraps'] });
};
```

커밋: `ee07728` (develop).

## 배운 것 / 인사이트

### Zustand store와 RQ 캐시는 서로 다른 데이터 소스입니다

같은 "내 정보"라도 어디서 읽느냐에 따라 갱신 책임자가 다릅니다. 헤더 아바타는 `useAuthStore.user.profileImageUrl`을 직접 구독하므로 `setUser` 한 줄로 끝납니다. PostCard 아바타는 `post.authorProfileImageUrl`을 props로 받고, 그 데이터는 RQ 캐시에 박혀있어 `setUser`로는 닿지 않습니다.

이전엔 "store를 갱신하면 화면 어디서나 즉시 반영된다"고 막연히 생각했는데, 실제로는 그 데이터가 다시 store에서 뽑힐 때만 그렇습니다. 서버 응답이 따로 RQ에 박혀 있는 자리는 캐시 자체를 건드려야 합니다.

### invalidate vs setQueryData vs UI 분기 — 옵션 A/B/C 비교

| 옵션 | 변경량 | 네트워크 | 채택 여부 |
|---|---|---|---|
| A. `invalidateQueries(['myPosts'])` prefix 무효화 | 1~3줄 | 활성 탭 1회 + 비활성 2회는 다음 마운트 때 | ✅ 채택 |
| B. `setQueryData`로 캐시 직접 패치 | 페이지별 queryKey 순회 + 닉네임 매핑 따로 → 길어짐 | 0회 | 비채택 (과함) |
| C. PostCard에서 본인 여부 분기 (`authorId === currentUserId`이면 store override) | 작지만 영향 범위 넓음 | 0회 | 비채택 |

**A 채택 근거**: prefix 무효화는 `['myPosts', 0]`, `['myPosts', 1]` 등 페이지 번호 무관 전체 매칭이라 1줄로 끝납니다. 비활성 탭은 다음 마운트 시 refetch라 네트워크 비용도 분산됩니다.

**B 비채택 근거**: 페이지마다 queryKey가 다르고, 매핑 함수도 닉네임/이미지 별도라 코드가 길어집니다. 네트워크 0회의 이득보다 코드 복잡도 비용이 큽니다.

**C 비채택 근거**: `PostSummary.authorId` 부재(현재 백엔드 미동봉, PostCard.tsx에 TODO 있음), 닉네임 비교는 동명이인 위험, 그리고 본인 보정 분기가 피드(`/posts`)까지 영향을 줍니다. MVP 발표 임박에서 blast radius가 큰 길.

### 캐시 적용 범위 분류: "내 정보만" vs "타인 정보 섞임"

- **내 정보만 들어있는 캐시(`my*` 계열)**: prefix 무효화로 충분. 이번 패턴 그대로.
- **타인 정보 섞인 캐시(feed 등)**: 본인 글만 매핑 갈아끼우는 setQueryData 또는 PostCard 자체에서 본인 분기. 단, `PostSummary.authorId` 부재 해소가 선행 조건.

이 분류가 다음에 같은 종류 버그를 만났을 때 옵션 선택을 빠르게 해주는 체크리스트가 됐습니다.

## 포트폴리오 어필 포인트

- 옵션 A/B/C를 표로 명시 비교하고 채택 근거를 박제했습니다. "왜 A인가"가 코드만 봐서는 안 보이는 자리입니다.
- 캐시 적용 범위(my\* vs feed)를 분류해서 같은 패턴이 미래 다른 자리에 재사용 가능하게 일반화했습니다.
- `setUser` 직후라는 호출 시점 선택의 이유: 서버 응답이 도착해 store와 캐시가 모두 stale인 시점을 한 번에 처리해 race를 없앴습니다.

## 한계점

- 비활성 탭은 다음 마운트 시 refetch라 사용자가 빠르게 탭 전환하면 옛 데이터가 잠깐 보일 수 있습니다. UX 회귀가 보고되면 `refetchType: 'all'`로 즉시 refetch 전환 검토.
- 닉네임 변경 early-return(실제로 안 바뀐 케이스)에서는 호출하지 않는데, 이 분기 자체가 닉네임이 비어있을 때만 잡혀서 실제 빈도가 낮을 것 같습니다. 그래도 "실제로 바뀐 케이스"를 더 정확히 잡으려면 비교 로직을 강화해야 합니다.
- 피드(`/posts`) 본인 카드는 이번 fix 대상이 아닙니다. 피드 시각에 본인 글이 섞여 있으면 그쪽은 여전히 stale. `authorId` 백엔드 동봉 후 별도 검토.

---

# [🏗 설계 결정] 05-13 — 알림 기능 통합 전략 (cherry-pick 옵션 B 채택)

## 1. 알림 브랜치를 develop에 통합하는 방법

**문제**: `origin/feat/notification`은 2026-04-26 base에서 35커밋이 작업된 브랜치인데, 그 사이 develop이 78커밋 진화했습니다. 두 흐름이 LoginPage/SignupPage/WelcomeModal/CommentCard/PostCard/CommentInput 등 14개 파일에서 별도로 진화했고, 그대로 머지하면 develop의 최신 변경이 알림 브랜치의 옛 시안으로 덮일 위험이 있었습니다.

**검토한 선택지**:

- **옵션 A — 알림 브랜치를 develop 위로 rebase 후 머지**: 35커밋을 develop 78커밋 위로 다시 얹으면서 14파일에서 충돌 해소. 충돌 표면이 너무 넓고, 알림과 무관한 develop 진화분이 충돌 해소 과정에서 의도치 않게 손상될 위험.
- **옵션 B — 알림 코어 파일만 cherry-pick + 통합 지점 4파일만 수동 수정**: 신규 9파일(알림 코어)은 conflict 없이 cherry-pick으로 들어옴, 통합 지점(App.tsx, SideNav, Layout, mocks/index)은 develop 최신 위에 손으로 알림 슬롯만 추가.
- **옵션 C — develop에 알림 기능을 처음부터 다시 구현**: 백엔드 SSE 인프라/Swagger 스펙은 이미 동작하니 프론트만 다시 짜는 길. 가장 안전하지만 비용 너무 큼, MVP 발표 D-2에서 불가.

**결정**: 옵션 B 채택.

**근거**:

- 알림 코어 9파일은 신규 파일이라 conflict 자체가 없음. cherry-pick으로 안전 이동.
- 통합 지점은 4파일로 좁혀짐. 각각 알림 슬롯/뱃지/route를 추가하는 일이라 develop 시점 코드를 그대로 둔 채 손으로 한 줄~몇 줄씩 끼워넣는 형태.
- develop 진화분이 손상 없이 보존됨. 알림 외 영역(Login/Signup/WelcomeModal/CommentCard 등)은 한 줄도 안 건드림.
- 35커밋 충돌 해소(옵션 A) 대비 4파일 수동 수정(옵션 B)의 표면이 훨씬 작음.

**결과**: 신규 9개 + 통합 4개 = 총 13파일. `tsc -b --noEmit` 통과, `npm run build` 7.01s 통과, MSW 모드 8케이스 사용자 검증 완료.

---

## 2. Swagger 정합 fix 4건 — 백엔드 진실의 원본을 staging spec으로 단일화

**문제**: cherry-pick으로 들어온 알림 코어 코드가 4월 시점의 API 가정 위에 작성돼 있었습니다. 한 달 사이 백엔드 스펙이 변했는데 frontend는 옛 가정 그대로. `tsc`는 통과하지만 응답 매핑이 어긋난 상태였습니다.

**검토한 선택지**:

- **옵션 A — `docs/openapi-local.json` 기준 정합**: 로컬에 캐시된 OpenAPI 스펙은 한참 stale.
- **옵션 B — staging Swagger UI(`https://api-staging.melonnetherapists.com/v3/api-docs`) 기준 정합**: 실제 백엔드가 보내는 응답과 일치. 단, 매번 확인이 필요.

**결정**: 옵션 B. 로컬 스펙 drift 시 staging spec이 정답지.

**fix 4건**:

1. `NotificationType` enum에 `VERIFICATION_SUBMITTED` 추가 (8종으로 확장)
2. `PaginatedNotifications` 필드명 `pageNumber/pageSize` → `page/size`, `totalPages` 추가
3. `NotificationResponse.postId` 필드 제거 (백엔드 미동봉, frontend 가정 오류)
4. `getNotificationRoute(type, referenceId?)` 시그니처 변경 — `referenceId` 의미가 type별로 다름:
   - `NEW_POST_REACTION`/`NEW_SCRAP` → 게시글 ID → `/posts/${referenceId}`
   - `NEW_COMMENT`/`NEW_REPLY`/`NEW_COMMENT_REACTION` → 댓글 ID → `/posts` 목록 fallback (postId 미동봉 → 백엔드 B-10 대기)
   - `VERIFICATION_*` → `/profile`

---

## 3. axios 응답 unwrap 자동 처리 vs 수동 unwrap

**문제**: `api/notifications.ts`의 `res.data` 캐스팅이 `{success, data}` 한 겹 unwrap을 누락한 것처럼 보였습니다. 다른 wiki(`unwrap`)에 동일 패턴의 버그 기록이 있어 의심됐습니다.

**검토**: `axiosInstance.ts:37`의 응답 인터셉터가 `{success, data}`를 자동으로 unwrap하는 것을 확인. 추가 변경 불필요.

**결정**: 코드 변경 없음. 단, "wiki unwrap 패턴과 헷갈리기 쉬운 케이스"로 박제 — `res.data` 캐스팅이 보였을 때 인터셉터 동작 확인이 1차 검증.

---

## 4. 헤더 드롭다운 미반영

**문제**: `feat/notification` 원본은 Bell 아이콘 클릭 시 최근 5건 미리보기 드롭다운을 두는 구조였습니다.

**검토한 선택지**:

- **옵션 A — 드롭다운 그대로 포팅**: develop의 Chrome 통일 정책(2026-05-08)으로 Layout 헤더가 폐기됐고 PageHeader 단일 진입점만 남았기 때문에 Bell을 둘 자리가 없음.
- **옵션 B — SideNav/BottomNav/`/notifications` 페이지로 일원화**: PC는 SideNav 뱃지 슬롯, 모바일은 BottomNav 뱃지 슬롯, 풀스크린은 `/notifications` 페이지.

**결정**: 옵션 B. Chrome 통일 정책의 일관성 유지가 더 큰 가치.

**한계점**: 헤더 드롭다운의 "최근 5건 미리보기" UX는 제공하지 않습니다. 사용자가 알림을 보려면 페이지/페인을 한 단계 이동해야 합니다. 이 트레이드오프는 Chrome 통일 정책의 비용으로 박제.

---

# [🔧 트러블슈팅] #011 — 안 읽은 알림 삭제 시 SideNav/BottomNav 뱃지 미감소

**날짜**: 2026-05-13
**분류**: Zustand · 상태 분리 패턴
**난이도**: ⭐⭐⭐

## 문제 상황

알림 기능 통합 후 MSW 모드 8케이스 검증 중 발견한 버그입니다.

- 안 읽은 알림 (예: 뱃지 5) → `/notifications` 페이지에서 휴지통 클릭 → 항목 사라짐 → **뱃지는 여전히 5**
- 안 읽은 알림 → 페이지에서 "읽음 표시" 클릭 → 뱃지 정상 4
- 안 읽은 알림 → 페이지에서 "모두 읽음" 클릭 → 뱃지 정상 0

삭제만 카운트가 미감소했습니다. 개별 읽음/모두 읽음은 정상.

## 원인 분석

`useNotificationStore`와 `NotificationPage`가 알림을 따로 들고 있었습니다.

- **store**: SSE로 실시간 도착한 알림 + `unreadCount` (전역 뱃지 소스)
- **NotificationPage**: 초기 마운트 시 `GET /notifications`로 fetch한 결과를 `useState`로 보관 (RQ 마이그레이션 전 시점)

두 컬렉션이 분리 관리되고 있어, 페이지에서 띄우는 알림은 store 배열에 없는 경우가 있었습니다(SSE 연결 전에 들어온 알림은 fetch에만 잡힘).

`removeNotification(id)` 구현은 이랬습니다:

```ts
removeNotification: (id: number) => set((state) => {
  const target = state.notifications.find(n => n.id === id);
  const newCount = target && !target.read
    ? Math.max(0, state.unreadCount - 1)
    : state.unreadCount;
  return {
    notifications: state.notifications.filter(n => n.id !== id),
    unreadCount: newCount,
  };
}),
```

페이지에서 삭제한 알림이 store 배열에 없으면 `target === undefined` → 카운트 분기 조건 false → 카운트 그대로. 그래서 안 읽은 알림을 페이지에서 지워도 뱃지가 안 줄었습니다.

### 왜 다른 함수는 정상 동작했나

- `markAsRead(id)`: `read` 여부 분기 없이 무조건 `unreadCount - 1` (음수 방지 `Math.max(0, ...)`만)
- `markAllAsRead()`: 무조건 `unreadCount = 0`

읽음 처리 두 함수는 `read` 여부를 신경 쓸 필요가 없습니다(어차피 안 읽은 걸 읽음으로 만드는 동작이라 음수 가드만 있으면 됨). 삭제만 "읽은 거 지우면 카운트 유지, 안 읽은 거 지우면 -1"라는 분기가 필요해서 store 배열 검사에 의존했습니다.

## 해결 과정

### 1차 시도 (생각만) — store가 페이지 알림까지 통합 관리

페이지 fetch 결과를 store에 합치는 길. 거부 이유는 (1) SSE 실시간 알림과 페이지 fetch 알림의 lifecycle이 달라(SSE는 메모리, fetch는 서버 truth) 합치면 동기화 로직이 더 늘어남, (2) 변경 표면이 store 시그니처/페이지 양쪽 → blast radius 큼.

### 2차 시도 — 호출자가 wasUnread를 명시 전달

`removeNotification(id, wasUnread?: boolean)` 시그니처를 확장했습니다.

```ts
removeNotification: (id: number, wasUnread?: boolean) => set((state) => {
  const isUnread = wasUnread !== undefined
    ? wasUnread
    : state.notifications.some(n => n.id === id && !n.read);
  return {
    notifications: state.notifications.filter(n => n.id !== id),
    unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
  };
}),
```

- 호출자가 명시 전달하면 그 값 사용.
- 미명시 시 store 배열 검사 fallback 유지(향후 Layout 드롭다운 삭제 기능 같은 store-only 경로 대비).
- `find + !!` → `some()`으로 단순화 (boolean만 필요).

페이지에서는:

```ts
const target = page.find(n => n.id === id);
removeNotification(id, target && !target.read);
```

페이지가 자기 컨텍스트에서 `read` 여부를 알고 있으니 그 정보를 호출 시 같이 넘기는 형태입니다.

## 핵심 개념

- **데이터를 어디서 들고 있느냐는 책임 경계 문제**입니다. store가 모든 알림을 다 들고 있다고 가정한 함수가 실제로는 일부만 들고 있을 때 가정이 깨집니다.
- **분리된 컬렉션에 걸쳐 동작하는 작업은 호출자가 정보를 합쳐서 store에 넘기는 분배**가 자연스럽습니다. store가 외부 컬렉션을 알 필요가 없도록.
- **읽음 처리(`markAsRead`)와 삭제(`remove`)의 분기 필요성 차이**: 전자는 항상 unreadCount를 1 줄이거나 0으로 만드는 단순 동작, 후자는 "안 읽은 것만" 줄여야 하는 조건부 동작. 그래서 후자만 read 여부 검사가 필요했고, 그 검사가 분리된 컬렉션 가정 위에서 작성돼 깨진 자리.

## 면접 포인트

- Zustand store가 "단일 진실 원본(SSOT)"이라는 가정이 실제로 모든 자리에서 성립하는지 검증해야 한다는 점. 이번 자리는 SSE 도착분과 페이지 fetch가 분리돼 있어 store가 부분 진실이었습니다.
- 함수 시그니처에 "호출자가 알고 있는 컨텍스트 정보"를 옵션 인자로 받는 패턴. 기본 동작은 그대로 두고 명시 인자로 fast-path를 여는 길이라 backward-compat 안전합니다.
- `find + !!` → `some()` 단순화는 작은 디테일이지만, boolean만 필요한 자리에서 객체 참조를 통해 boolean을 만드는 것보다 의도 표현이 명확합니다.

## 관련

- 메모리 `project_notification_integration_2026_05_13.md`
- backlog `CH-05` (완료), `B-10` (백엔드 postId 동봉 대기)

---

# [📈 성과 & 지표] 05-13 — 알림 기능 통합 성과

## 배포 상태

- **2026-05-13 develop 통합 완료** — 알림 기능 9개 신규 파일 + 4개 통합 지점 수정
- MSW 모드 브라우저 검증 8케이스 통과 (뱃지/목록/개별 읽음/모두 읽음/삭제/라우팅 5종)
- `tsc -b --noEmit` 통과
- `npm run build` 7.01s 통과
- **staging LIVE 검증 미실시**: SSE 인프라(ALB idle timeout, EC2 nginx `proxy_buffering`) 미확인 → MVP 발표 전 staging에서 SSE 연결 안정성 확인 필요

## 기능 단위 성과

- **실시간 SSE 알림 연결**: `fetch + ReadableStream` 기반 직접 파싱(`lib/sseClient.ts`), 지수 백오프, `Last-Event-ID` 재연결, `visibilitychange` 재연결 로직
- **뱃지 자동 갱신**: SideNav(PC)/BottomNav(모바일) 알림 슬롯에 unreadCount 뱃지 동기 표시
- **알림 페이지**: `/notifications` 풀스크린, 무한 스크롤, 개별/전체 읽음, 삭제, 타입별 라우팅
- **타입별 라우팅 분기**: 8종 알림 타입(NEW_POST_REACTION/NEW_SCRAP/NEW_COMMENT/NEW_REPLY/NEW_COMMENT_REACTION/VERIFICATION_SUBMITTED 등)에 따라 게시글/프로필/목록 fallback 분기
- **MSW mock 데이터**: handler + mock data로 백엔드 없이 풀-사이클 동작 확인

## 안전성 / 정합성

- **Swagger 정합 fix 4건**: staging spec 기준으로 enum/필드명/시그니처 일치화 (옛 가정 오류 4건 해소)
- **store/페이지 분리 버그 fix**: 안 읽은 알림 삭제 시 뱃지 미감소 버그를 호출자 명시 인자 패턴으로 해소
- **응답 unwrap 방어**: axios 인터셉터 자동 unwrap을 활용해 코드 일관성 유지
- **401 처리 위임**: axios 인터셉터에 401 refresh 흐름 위임, 알림 코드에서 401 처리 로직 제거

## 이력서 bullet 예시

- 알림 SSE 실시간 연결 + 페이지/뱃지 통합을 78커밋 진화한 브랜치 위에 cherry-pick + 4파일 수동 통합 전략으로 안전 통합(머지 충돌 14파일을 4파일로 축소).
- 백엔드 Swagger staging spec 기준 정합 fix 4건(enum 누락, 필드명 변경, 시그니처 변경, 미동봉 필드 제거)으로 cherry-pick된 옛 가정 오류를 해소, 통합 후 tsc/build/MSW 8케이스 검증 통과.
- Zustand store와 페이지 fetch state가 분리된 자리에서 "호출자가 read 여부를 명시 전달"하는 시그니처 확장 패턴으로, store가 외부 컬렉션을 알 필요 없도록 책임 경계를 정리.

## 한계점

- **staging LIVE 검증 미실시**: MSW 모드 통과만 확인. ALB idle timeout, nginx `proxy_buffering` 같은 SSE 인프라 변수가 검증 안 됨. MVP 발표 전 1차 staging 검증 필요.
- **댓글 알림 라우팅 fallback**: NEW_COMMENT/NEW_REPLY/NEW_COMMENT_REACTION은 백엔드가 postId 미동봉이라 `/posts` 목록 fallback. B-10 백엔드 요청 후 정상화 예정.
- **헤더 드롭다운 미반영**: Chrome 통일 정책으로 Bell 드롭다운 미적용. 알림 확인은 SideNav/BottomNav/페이지로 일원화. UX 트레이드오프 박제.
- **SSE 라이브러리 결정 미완**: wiki(`sse-b-zustand-fetch-event-source`)는 fetch-event-source 채택 기록인데 실제 구현은 자가 파서. 별도 세션에서 결정 정합 필요.
