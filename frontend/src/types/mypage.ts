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

export interface MyComment {
  commentId: number;
  content: string;
  postId: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface MyScrappedPost {
  postId: number;
  contentPreview: string;
  authorNickname: string;
  therapyArea: string;
  ageGroup: string | null;
  viewCount: number;
  postCreatedAt: string;
  scrappedAt: string;
}

export interface PaginatedComments {
  items: MyComment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PaginatedScraps {
  items: MyScrappedPost[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
