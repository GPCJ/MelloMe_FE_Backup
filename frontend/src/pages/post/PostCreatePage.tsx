import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PostWriteForm from '../../components/post/PostWriteForm';
import ConcernForm from '../../components/post/ConcernForm';
import { useScreenExit } from '../../hooks/useScreenExit';

export default function PostCreatePage() {
  // 체류 시간 측정 — 글쓰기 화면 이탈 시 duration 발송.
  // TODO(analytics): mode === 'concern'에서는 별도 screen_name('concern_write')으로 분기 필요.
  // PM 합의(신규 screen_name 등록) 후 적용 — project_analytics_event_ownership 게이트.
  useScreenExit('post_write');

  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mode, setMode] = useState<'post' | 'concern'>('post');

  const common = {
    variant: 'page' as const,
    onClose: () => navigate('/posts'),
    // 모바일도 PC 모달과 일관되게 작성 완료 후 홈 피드(`/posts`)로 이동.
    // 새 글이 피드 상단에 노출되어 사용자가 본인 글의 컨텍스트(시각적 결과)를 즉시 확인 가능.
    // 단, /posts로 이동만 하면 React Query 피드 캐시는 stale 상태라 새 글이 안 보임 —
    // PostWriteModal.handleSuccess와 동일하게 `feed` 키 invalidate를 명시적으로 발사.
    onSuccess: (_postId: number) => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      navigate('/posts');
    },
    mode,
    onModeChange: setMode,
  };

  return mode === 'post' ? (
    <PostWriteForm {...common} />
  ) : (
    <ConcernForm {...common} />
  );
}
