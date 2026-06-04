import axiosInstance from './axiosInstance';
import type {
    MessageResponse,
    MessageSendRequest,
    PagedResponseMessageResponse,
} from '../types/message';

export async function sendMessage(payload:MessageSendRequest): Promise<MessageResponse> {
    const res = await axiosInstance.post('/messages', payload);
    return res.data?.data ?? res.data;
}

// 받은 쪽지함 (page/size, 0-based). 정답지: api/notifications.ts fetchNotifications
export async function fetchReceivedMessages(
    page = 0,
    size = 20,
): Promise<PagedResponseMessageResponse> {
    const res = await axiosInstance.get('/me/messages/received', { params: { page, size } });
    return res.data?.data ?? res.data;
}

// 보낸 쪽지함 (page/size, 0-based)
export async function fetchSentMessages(
    page = 0,
    size = 20,
): Promise<PagedResponseMessageResponse> {
    const res = await axiosInstance.get('/me/messages/sent', { params: { page, size } });
    return res.data?.data ?? res.data;
}

// 쪽지 상세. 수신자가 조회하면 백엔드가 자동 읽음 처리(스펙 Q2 해소).
export async function fetchMessageDetail(messageId: number): Promise<MessageResponse> {
    const res = await axiosInstance.get(`/messages/${messageId}`);
    return res.data?.data ?? res.data;
}

export async function deleteMessage(messageId: number): Promise<void> {
    await axiosInstance.delete(`/messages/${messageId}`);
}