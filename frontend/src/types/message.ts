export interface MessageSendRequest{
    receiverId: number;
    content: string;
}

export interface MessageResponse{
    messageId: number;
    senderId: number;
    senderNickname: string;
    receiverId: number;
    receiverNickname: string;
    content: string;
    read: boolean;
    broadcast: boolean;
    createdAt: string;
}

export interface PagedResponseMessageResponse{
    items: MessageResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export interface UnreadCountResponse {
    unreadCount: number;
}