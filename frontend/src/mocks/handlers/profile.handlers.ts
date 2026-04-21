// 프로필 핸들러 — 내가 쓴 게시글, 활동 내역 (댓글단 글 + 스크랩)
import { http, HttpResponse } from 'msw';
import { mockPosts } from '../data/posts';
import { testAccounts } from '../data/users';
import { currentUserEmail } from '../state';

const API = import.meta.env.VITE_API_BASE_URL;

export const profileHandlers = [
  http.get(`${API}/me/posts`, () => {
    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const items = mockPosts
      .filter((p) => p.authorId === currentAccount?.id)
      .map((p) => ({
        id: p.id,
        postType: 'COMMUNITY' as const,
        contentPreview: p.contentPreview,
        authorNickname: p.authorNickname,
        therapyArea: p.therapyArea,
        visibility: 'PUBLIC' as const,
        viewCount: p.viewCount,
        createdAt: p.createdAt,
        scrapped: false,
      }));
    return HttpResponse.json({
      items,
      page: 0,
      size: 10,
      totalElements: items.length,
      totalPages: 1,
      hasNext: false,
    });
  }),

  http.get(`${API}/me/activity`, () =>
    HttpResponse.json({
      commentedPosts: [
        {
          post: {
            id: 4,
            contentPreview: '놀이치료에서 경계선 설정이 어려운 아이가 있는데...',
            therapyArea: 'PLAY',
            viewCount: 156,
            commentCount: 15,
            hasAttachment: false,
            isBlurred: false,
            authorNickname: '놀이치료사_하은',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'APPROVED',
            createdAt: '2026-04-01T10:00:00Z',
          },
          myCommentPreview: '저도 비슷한 경험이 있어요. First-Then 보드가 효과적이었습니다.',
          myCommentCreatedAt: '2026-04-01T11:30:00Z',
        },
        {
          post: {
            id: 5,
            contentPreview: '치료사 2년차인데 번아웃이 왔어요...',
            therapyArea: 'UNSPECIFIED',
            viewCount: 312,
            commentCount: 23,
            hasAttachment: false,
            isBlurred: false,
            authorNickname: '새내기치료사',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'NOT_REQUESTED',
            createdAt: '2026-03-31T22:00:00Z',
          },
          myCommentPreview:
            '힘내세요! 저도 3년차 때 가장 힘들었는데, 동료 치료사들과 정기적인 케이스 컨퍼런스를 시작하면서 많이 나아졌어요.',
          myCommentCreatedAt: '2026-04-01T08:00:00Z',
        },
      ],
      scrappedPosts: [
        {
          post: {
            id: 1,
            contentPreview: '감각통합 활동에 유용한 자료를 공유합니다...',
            therapyArea: 'OCCUPATIONAL',
            viewCount: 42,
            commentCount: 5,
            hasAttachment: true,
            isBlurred: false,
            authorNickname: '김작업치료사',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'APPROVED',
            createdAt: '2026-04-02T08:00:00Z',
          },
          scrappedAt: '2026-04-02T09:00:00Z',
        },
        {
          post: {
            id: 2,
            contentPreview: '오늘 치료 세션에서 아이가 처음으로 두 단어 조합 문장을 말했어요!...',
            therapyArea: 'SPEECH',
            viewCount: 234,
            commentCount: 12,
            hasAttachment: false,
            isBlurred: false,
            authorNickname: '언어치료사_민지',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'APPROVED',
            createdAt: '2026-04-02T06:30:00Z',
          },
          scrappedAt: '2026-04-02T07:30:00Z',
        },
      ],
    }),
  ),
];
