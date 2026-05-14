import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

type PageMeta = { title: string; description: string };

const META_BY_URL: Record<string, PageMeta> = {
  '/': {
    title: 'Mellti - 발달재활 치료사 커뮤니티 · 활동지 공유 · 보수교육',
    description:
      '언어치료사·작업치료사·놀이치료사·특수교사 등 발달재활 치료사를 위한 활동지 공유, 보수교육 정보, 구인구직 커뮤니티 Mellti.',
  },
  '/privacy': {
    title: '개인정보처리방침 - Mellti',
    description: 'Mellti 개인정보처리방침. 수집하는 정보, 이용 목적, 보관 기간을 안내합니다.',
  },
  '/terms': {
    title: '이용약관 - Mellti',
    description: 'Mellti 서비스 이용약관. 서비스 이용 조건과 회원 권리·의무를 안내합니다.',
  },
};

/**
 * 랜딩페이지 폐기 결정(2026-05-06)으로 `/`에 prerender할 콘텐츠가 없음.
 * 다만 vitePrerenderPlugin이 default entry `/`를 자동 prerender 시도하기 때문에
 * ROUTES 매핑이 비어 있으면 아래 prerender 함수가 throw로 빌드 실패함.
 *
 * 빈 컴포넌트로 매핑해서 prerender 산출물은 빈 div + 메타(title/description)만 유지함.
 * 브랜드 검색 SEO는 메타로 충족되고, 실제 진입은 클라이언트 hydrate
 * 후 RootRedirect가 비로그인→/signup, 로그인→/posts로 즉시 navigate함.
 */
function EmptyRoot() {
  return null;
}

const ROUTES: Record<string, ComponentType> = {
  '/': EmptyRoot,
  '/privacy': PrivacyPage,
  '/terms': TermsPage,
};

export async function prerender(data: { url: string }) {
  const Component = ROUTES[data.url];
  if (!Component) {
    throw new Error(`prerender: no component registered for url ${data.url}`);
  }

  const html = renderToString(
    <StaticRouter location={data.url}>
      <Component />
    </StaticRouter>,
  );

  const meta = META_BY_URL[data.url];
  return {
    html,
    head: {
      lang: 'ko',
      title: meta.title,
      elements: new Set<{ type: string; props: Record<string, string> }>([
        { type: 'meta', props: { name: 'description', content: meta.description } },
        {
          type: 'meta',
          props: { property: 'og:title', content: meta.title },
        },
        {
          type: 'meta',
          props: { property: 'og:description', content: meta.description },
        },
        {
          type: 'link',
          props: { rel: 'canonical', href: `https://www.melonnetherapists.com${data.url}` },
        },
      ]),
    },
  };
}
