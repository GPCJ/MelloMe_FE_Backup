import { useNavigate } from 'react-router-dom';
import PostWriteForm from '../../components/post/PostWriteForm';
import { useScreenExit } from '../../hooks/useScreenExit';

export default function PostCreatePage() {
  // 체류 시간 측정 — 글쓰기 화면 이탈 시 duration 발송.
  useScreenExit('post_write');

  const navigate = useNavigate();

  return (
    <PostWriteForm
      variant="page"
      onClose={() => navigate('/posts')}
      onSuccess={(postId) => navigate(`/posts/${postId}`)}
    />
  );
}
