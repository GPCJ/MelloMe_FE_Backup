import axiosInstance from './axiosInstance';
import type { MessageResponse, MessageSendRequest } from '../types/message';

export async function sendMessage(payload:MessageSendRequest): Promise<MessageResponse> {
    const res = await axiosInstance.post('/messages', payload);
    return res.data?.data ?? res.data;
}