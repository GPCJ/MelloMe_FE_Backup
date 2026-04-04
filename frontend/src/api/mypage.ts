import axiosInstance from './axiosInstance';
import type { PaginatedComments, PaginatedScraps } from '../types/mypage';
import type { PaginatedPosts } from '../types/post';

// 백엔드 페이지네이션 응답의 리스트 프로퍼티명이 엔드포인트마다 다름
// (posts, comments, scraps 등). 프론트는 items로 통일해서 사용하되,
// API 함수에서 매핑하여 컴포넌트가 일관된 인터페이스를 쓸 수 있도록 함.
// 관련 이슈: 백엔드 응답 프로퍼티명 통일 요청 예정

export async function fetchMyPosts(page = 0, size = 10): Promise<PaginatedPosts> {
  const res = await axiosInstance.get('/me/posts', { params: { page, size } });
  return { ...res.data, items: res.data.posts ?? res.data.items ?? [] };
}

export async function fetchMyComments(page = 0, size = 10): Promise<PaginatedComments> {
  const res = await axiosInstance.get('/me/comments', { params: { page, size } });
  return { ...res.data, items: res.data.comments ?? res.data.items ?? [] };
}

export async function fetchMyScraps(page = 0, size = 10): Promise<PaginatedScraps> {
  const res = await axiosInstance.get('/me/scraps', { params: { page, size } });
  return { ...res.data, items: res.data.scraps ?? res.data.items ?? [] };
}
