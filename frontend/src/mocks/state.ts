// MSW 핸들러 간 공유 상태

// 현재 로그인된 사용자 이메일 추적 (GET /me 응답용)
export let currentUserEmail: string | null = null;
export function setCurrentUserEmail(email: string | null) {
  currentUserEmail = email;
}

// 회원가입으로 등록된 이메일 추적 (비밀번호 체크 스킵용)
export const signedUpEmails = new Set<string>();
