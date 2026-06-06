import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
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
 * 랜딩 부활(2026-06-06) 후 `/` prerender 본체는 실제 LandingPage.
 *
 * 추가로 PM SEO 롱테일 키워드(핵심5·영역10·정보성11)를 sr-only 블록으로 함께 prerender한다.
 * LandingPage 본문이 커버하지 못하는 롱테일(활동지·구인구직 시설명·논문·번아웃 등)을 보존하기 위함.
 * 이 블록은 prerender HTML(봇이 읽는 정적 산출물)에만 존재하고, 클라이언트 SPA는 LandingPage만
 * 렌더하므로 실유저 DOM에는 노출되지 않는다(hidden-text 리스크 최소화).
 */
function SeoKeywords() {
  return (
    <div className="sr-only">
      <p>
        언어치료사·작업치료사·물리치료사·놀이치료사·특수교사를 비롯한 발달재활 치료사를 위한 커뮤니티
        Mellti. 활동지 공유, 보수교육 정보, 발달센터·병원·부설센터·사회복지관·장애인복지관 구인구직을 한
        곳에서 나눕니다.
      </p>
      <p>
        미술치료사·행동치료사·인지치료사·감각통합 전문가·임상심리사까지 다양한 직군의 발달재활 치료사들이
        무료 활동지 다운로드와 언어치료 교안 공유, 작업치료 인지 활동지, 감각통합 프로그램 추천을 함께
        모읍니다. 치료사 추천 논문과 최신 재활 기술 동향, 사례별 중재 전략, 발달장애 관련 뉴스를 정리하고,
        센터별 급여 정보와 번아웃·프리랜서 고민까지 발달재활 치료사들의 일상에 필요한 이야기를 나눕니다.
      </p>
    </div>
  );
}

/** `/` prerender = 실제 랜딩 본문 + SEO 키워드 블록. */
function LandingPrerender() {
  return (
    <>
      <LandingPage />
      <SeoKeywords />
    </>
  );
}

const ROUTES: Record<string, ComponentType> = {
  '/': LandingPrerender,
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
