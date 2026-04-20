---
name: GitHub credentials 갱신 방법
description: gh CLI 재인증 후 ~/.git-credentials도 함께 갱신해야 git push가 작동함
type: feedback
---

gh auth login만으로는 git push(HTTPS)가 안 됨 — ~/.git-credentials도 별도로 갱신해야 한다.

**Why:** gh CLI 인증과 git credential helper는 별개. push-mello 등 HTTPS 기반 스크립트는 ~/.git-credentials를 사용함.

**How to apply:** gh auth login 후 토큰이 바뀌면 아래 명령어로 credentials 갱신:

```
gh auth token | xargs -I{} sh -c 'echo "https://GPCJ:{}@github.com" > ~/.git-credentials'
```
