import axiosInstance from './axiosInstance';
import type { FollowCount, PagedFollowUsers, FollowStatus } from '../types/follow';

// 응답 인터셉터(axiosInstance.ts:35-40)가 {success,data}를 data로 언랩하지만,
// 최신 형제 모듈(api/messages.ts)과 동일하게 방어적으로 한 번 더 언랩한다.
export async function fetchFollowCounts(): Promise<FollowCount> {
  const res = await axiosInstance.get('/me/follow-counts');
  return res.data?.data ?? res.data;
}

export async function fetchFollowings(page = 0, size = 10): Promise<PagedFollowUsers> {
  const res = await axiosInstance.get('/me/followings', { params: { page, size } });
  return res.data?.data ?? res.data;
}

export async function fetchFollowers(page = 0, size = 10): Promise<PagedFollowUsers> {
  const res = await axiosInstance.get('/me/followers', { params: { page, size } });
  return res.data?.data ?? res.data;
}

export async function followUser(userId: number): Promise<FollowStatus> {
  const res = await axiosInstance.post(`/users/${userId}/follow`);
  return res.data?.data ?? res.data;
}

export async function unfollowUser(userId: number): Promise<FollowStatus> {
  const res = await axiosInstance.delete(`/users/${userId}/follow`);
  return res.data?.data ?? res.data;
}
