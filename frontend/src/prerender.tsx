import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

type PageMeta = { title: string; description: string };

const META_BY_URL: Record<string, PageMeta> = {
  '/': {
    title: '멜로미 - 발달장애 아동 치료사 커뮤니티',
    description:
      '발달장애 아동 치료사를 위한 커뮤니티. 치료사 간 정보 공유, 고민 나눔, 학습 자료까지 한 곳에서.',
  },
  '/privacy': {
    title: '개인정보처리방침 - 멜로미',
    description: '멜로미 개인정보처리방침. 수집하는 정보, 이용 목적, 보관 기간을 안내합니다.',
  },
  '/terms': {
    title: '이용약관 - 멜로미',
    description: '멜로미 서비스 이용약관. 서비스 이용 조건과 회원 권리·의무를 안내합니다.',
  },
};

const ROUTES: Record<string, ComponentType> = {
  '/': LandingPage,
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
