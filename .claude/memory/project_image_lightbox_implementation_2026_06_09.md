---
name: project_image_lightbox_implementation_2026_06_09
description: "이미지 라이트박스(F-13) AI 1차 구현 박제 — 다음 만지기 전 필독, 메커니즘 9개 + 자기점검 5개"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9410afcc-f87a-494f-8e10-240d6c32a017
---

이미지 라이트박스(backlog F-13) **AI 작성 + 리뷰** 1차 구현 박제 (2026-06-09, develop 1커밋 `3b7c36d`). 다음에 이 코드를 만지기 전 필독. 인지부채 HIGH — Pointer 제스처 로직은 AI 작성분이라 손으로 재구성 안 됨.

**Why(박제):** 핀치/팬/더블탭은 Pointer 이벤트 + ref 상태머신이라 읽기만으론 동작이 안 그려짐. 회귀 시 "어디서 무엇을 막고 있나"를 빨리 찾기 위함. [[feedback_ai_written_code_cognitive_debt]]

**파일:** 신규 `frontend/src/components/common/ImageLightbox.tsx` / 배선 `frontend/src/pages/post/PostDetailPage.tsx`(import·`zoomIndex` 상태·캐러셀 `<img>` onClick·렌더)

## 메커니즘 9개
1. **드래그 vs 클릭 구분** — 캐러셀 `<img>` onClick에서 `imagesScroll.state.current.moved <= 5`일 때만 `setZoomIndex`. 별도 핸들러 X, 기존 `useDragScroll`의 ref를 읽음. 드래그 스크롤 끝 클릭이 라이트박스를 안 열게. (PostCard의 `onClickCapture moved>5` 패턴과 같은 ref, 다른 적용)
2. **Portal + 배경잠금 + ESC** — `createPortal(…, document.body)`, body `overflow:hidden` 메모-복원, ESC keydown. `LegalModal` 컨벤션 복제. z-`[100]`(LegalModal z-50보다 위로 의도).
3. **Pointer 이벤트 통합** — `pointers = useRef<Map<pointerId, {x,y}>>`로 멀티터치 추적. `size===2`→핀치, `size===1 && scale>1`→팬. `setPointerCapture`로 손가락이 이미지 밖으로 나가도 move 수신 보장.
4. **clamp(offset, scale)** — 확대 시 이미지가 화면 밖으로 완전히 빠지지 않게 offset 제한. `getBoundingClientRect()`는 **transform 적용된 크기**라 `rect.width - rect.width/s` 로 여백을 역산해 maxX/maxY 계산.
5. **핀치 종료 ≠ 탭** — `pinched` ref. 핀치 중 true → 마지막 손가락 뗄 때 `wasTap=false` 강제. 없으면 핀치 후 손 떼는 동작이 더블탭으로 오인돼 줌이 튐.
6. **더블탭 토글** — `lastTap` ref + `Date.now()` 간격 300ms. 단, `wasTap`(움직임<4px·핀치 아님·1포인터)일 때만. 1↔2배 토글.
7. **확대 중 네비 숨김** — `{count>1 && !zoomed && …}`. 확대 상태에선 1포인터 드래그가 팬이라 ◀▶ 버튼/스와이프와 충돌 방지. 1배 복귀 시 다시 노출.
8. **transform 순서** — `translate(offset) scale(s)`. translate 먼저, scale 나중. 순서 바꾸면(scale 먼저) 이동량이 배율만큼 증폭돼 팬이 과민해짐.
9. **touchAction:'none'** — 이미지에 CSS로 브라우저 기본 제스처(페이지 핀치줌·스크롤) 차단. React onTouchMove passive 이슈로 `preventDefault`가 안 먹는 걸 CSS로 우회.

## 의도된 한계 (버그 아님)
- 스와이프 닫기 미구현 / focus trap 미구현(`role=dialog`만) / 줌 transition 없음(핀치 반응성 우선) / wrap-around 순환 네비.
- 모바일 실기기 제스처는 코드+데스크탑 브라우저 검증만 — 기기별 미세차 가능.

## 자기점검 5개 (다음 세션 시작 전)
1. 캐러셀을 **드래그**한 뒤 손 떼면 라이트박스가 안 열린다. 어느 값을 어디서 읽어 막나?
2. 핀치로 확대 후 두 손가락을 떼는 동작이 '더블탭'으로 오인되지 않는 장치는?
3. `clamp`가 `getBoundingClientRect`를 `scale`로 나눠 쓰는 이유는?
4. transform에서 `translate`와 `scale` 순서를 바꾸면 무슨 일이 생기나?
5. ESC·배경 클릭은 닫는데 **이미지**를 클릭하면 왜 안 닫히나? (이벤트 흐름)
