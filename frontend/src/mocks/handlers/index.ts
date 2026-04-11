// 모든 도메인 핸들러를 모아서 export
import { authHandlers } from './auth.handlers';
import { metaHandlers } from './meta.handlers';
import { userHandlers } from './user.handlers';
import { postsHandlers } from './posts.handlers';
import { attachmentsHandlers } from './attachments.handlers';
import { commentsHandlers } from './comments.handlers';
import { reactionsHandlers } from './reactions.handlers';
import { profileHandlers } from './profile.handlers';
import { scrapHandlers } from './scrap.handlers';

export const handlers = [
  ...authHandlers,
  ...metaHandlers,
  ...userHandlers,
  ...postsHandlers,
  ...attachmentsHandlers,
  ...commentsHandlers,
  ...reactionsHandlers,
  ...profileHandlers,
  ...scrapHandlers,
];
