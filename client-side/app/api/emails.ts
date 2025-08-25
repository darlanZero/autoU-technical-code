// app/api/emails.ts
import { apiClient } from './client';
import type { User } from './types';

export interface EmailResponse {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    subject: string;
    body: string;
    sender: string;
    recipient: string;
    sender_user_id: string;
    recipient_user_id: string;
    category: 'produtivo' | 'improdutivo';
    confidence_score: number;
    suggested_response: string;
    status: 'pending' | 'processed' | 'failed';
    is_read: boolean;
    processed_at?: string;
}

export interface EmailInboxResponse {
    total: number;
    unread_count: number;
    emails: EmailResponse[];
}

export interface EmailSendRequest {
    recipient_email: string;
    subject: string;
    body: string;
}

export interface EmailProcessRequest {
    text_content: string;
    subject?: string;
}

export interface EmailProcessResponse {
    category: 'produtivo' | 'improdutivo';
    confidence_score: number;
    suggested_response: string;
    processing_time: number;
}

export interface DashboardStats {
    totalEmails: number;
    unreadCount: number;
    productiveEmails: number;
    unproductiveEmails: number;
    processingAccuracy: number;
}

export class EmailService {
    async getInbox(userId: string, limit: number = 50, includeRead: boolean = true): Promise<EmailInboxResponse> {
        const response = await apiClient.get<EmailInboxResponse>(
        `/emails/inbox/${userId}?limit=${limit}&include_read=${includeRead}`
        );
        
        if (!response.data) {
        throw new Error('Erro ao buscar emails');
        }
        
        return response.data;
    }

    
    async getSentEmails(userId: string, limit: number = 50): Promise<EmailResponse[]> {
        const response = await apiClient.get<EmailResponse[]>(`/emails/sent/${userId}?limit=${limit}`);
        
        return response.data || [];
    }

    
    async getEmail(emailId: string): Promise<EmailResponse> {
        const response = await apiClient.get<EmailResponse>(`/emails/${emailId}`);
        
        if (!response.data) {
        throw new Error('Email não encontrado');
        }
        
        return response.data;
    }

    async sendEmail(senderUserId: string, emailData: EmailSendRequest): Promise<EmailResponse> {
        const response = await apiClient.post<EmailResponse>(
        `/emails/send?sender_user_id=${senderUserId}`,
        emailData
        );
        
        if (!response.data) {
        throw new Error('Erro ao enviar email');
        }
        
        return response.data;
    }

    async markAsRead(emailId: string, userId: string): Promise<void> {
        await apiClient.patch(`/emails/${emailId}/read?user_id=${userId}`);
    }

    async getConversation(user1Id: string, user2Id: string, limit: number = 50): Promise<EmailResponse[]> {
        const response = await apiClient.get<EmailResponse[]>(
        `/emails/conversation/${user1Id}/${user2Id}?limit=${limit}`
        );
        
        return response.data || [];
    }

    async processText(textContent: string, subject?: string): Promise<EmailProcessResponse> {
        const response = await apiClient.post<EmailProcessResponse>('/emails/process-text', {
        text_content: textContent,
        subject
        });
        
        if (!response.data) {
        throw new Error('Erro ao processar texto');
        }
        
        return response.data;
    }

    async getAllEmails(category?: string, status?: string, limit: number = 50): Promise<EmailResponse[]> {
        let endpoint = `/emails?limit=${limit}`;
        
        if (category) endpoint += `&category=${category}`;
        if (status) endpoint += `&status=${status}`;
        
        const response = await apiClient.get<EmailResponse[]>(endpoint);
        
        return response.data || [];
    }

    async getDashboardStats(userId: string): Promise<DashboardStats> {
        try {
        const inboxResponse = await this.getInbox(userId, 1000);
        const emails = inboxResponse.emails;
        
        const totalEmails = emails.length;
        const unreadCount = inboxResponse.unread_count;
        const productiveEmails = emails.filter(e => e.category === 'produtivo').length;
        const unproductiveEmails = emails.filter(e => e.category === 'improdutivo').length;
        
        const processedEmails = emails.filter(e => e.status === 'processed').length;
        const processingAccuracy = totalEmails > 0 ? (processedEmails / totalEmails) * 100 : 0;

        return {
            totalEmails,
            unreadCount,
            productiveEmails,
            unproductiveEmails,
            processingAccuracy: Math.round(processingAccuracy * 10) / 10 // 1 casa decimal
        };
        } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        return {
            totalEmails: 0,
            unreadCount: 0,
            productiveEmails: 0,
            unproductiveEmails: 0,
            processingAccuracy: 0
        };
        }
    }
}

export const emailService = new EmailService();