---
name: .git object 손상 복구 경로 (push-mello 등 실패 시)
description: 갑작스런 종료로 object가 0바이트/손상되어 HEAD 파싱 실패할 때 백업 → 삭제 → fetch로 복구하는 절차
type: project
originSessionId: 04d583e8-b161-4f24-8f97-bf07ccfae50d
---
## 언제 발생하나

- push-mello, git commit, git pull 등 중 `error: object file .git/objects/.../... is empty` 또는 `fatal: could not parse HEAD`
- WSL/PC 갑작스런 종료 후 fsync되지 않은 object들이 0바이트로 남아 HEAD가 참조하는 commit/tree/blob object가 비거나 inflate 실패

## 진단 순서

```bash
cd ~/my-project
git fsck --full 2>&1 | head -50
```
- `object corrupt or missing: .git/objects/XX/YYYY...` 목록 수집
- `refs/heads/main: invalid sha1 pointer ...`, `HEAD: invalid sha1 pointer ...` 나오면 HEAD 손상 확정

참조 확인:
```bash
cat .git/HEAD
cat .git/logs/HEAD | tail -10
```

## 복구 절차 (비파괴, 안전장치 포함)

**1. 워킹트리 수정본 백업**
```bash
cp <수정 중인 파일> /tmp/
```

**2. `.git` 전체 백업 (복구 실패 시 원복용)**
```bash
cp -a .git .git.backup_$(date +%Y%m%d_%H%M%S)
```
⚠️ 이 백업 폴더는 프로젝트 루트에 생기므로 `git add -A` 대상에 휩쓸릴 수 있음. 커밋 전 반드시 `~/` 등 프로젝트 밖으로 이동 또는 `.gitignore` 추가.

**3. 손상 object 파일 삭제**
```bash
# fsck 출력에서 얻은 object 목록을 하나씩 삭제
for obj in XXYY... XXYY... ...; do
  dir=${obj:0:2}; file=${obj:2}
  rm ".git/objects/$dir/$file"
done
```

**4. 리모트에서 object 재수급**
```bash
git fetch origin --no-tags
```
리모트에 object가 있으면 자동 복구됨.

**5. 검증**
```bash
git fsck --full   # object corrupt 에러 사라져야 함
git status        # HEAD 정상 파싱
git log --oneline -3  # 커밋 체인 정상
```

## 2026-04-17 실제 복구 사례

- push-mello 실행 중 `fatal: could not parse HEAD` 발생
- `git fsck` 결과 9개 object 손상 (0바이트 8개 + inflate 실패 1개)
- 손상 범위: `3b39b9bd...`(HEAD/main/origin/main 모두가 가리킴) + 관련 tree/blob들
- 위 5단계 절차로 완전 복구. 스테이징된 7개 변경사항 및 워킹트리 수정본 모두 보존

**Why:** 갑작스런 종료로 git 저장소 망가지는 일은 드물지만 발생하면 stuck됨. 재발 시 같은 경로로 빠르게 복구하려면 절차 기록 필요.

**How to apply:** `could not parse HEAD` 또는 `object file ... is empty` 에러 목격 시 이 문서 순서대로 진행. destructive 조치(fresh clone) 전에 비파괴 복구 먼저 시도.
