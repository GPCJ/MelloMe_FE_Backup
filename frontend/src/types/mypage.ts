import type { PostSummary } from './post';

export interface MyDashboard {
  stats: {
    postCount: number;
    commentCount: number;
    receivedReactionCount: number;
    givenReactionCount: number;
    downloadCount: number;
    scrappedCount: number;
  };
  activity: {
    weeklyPostCount: number;
    weeklyCommentCount: number;
    joinedAt: string;
  };
}

export interface MyCommentedPost {
  post: PostSummary;
  myCommentPreview: string;
  myCommentCreatedAt: string;
}

export interface MyScrappedPost {
  post: PostSummary;
  scrappedAt: string;
}

export interface MyActivity {
  commentedPosts: MyCommentedPost[];
  scrappedPosts: MyScrappedPost[];
}
