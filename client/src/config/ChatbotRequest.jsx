import { apiClient } from './axiosClient';

// Tạo session chatbot mới
export const createChatbotSession = () => {
    return apiClient.post('/api/chatbot/session');
};

// Lấy danh sách sessions
export const getChatbotSessions = () => {
    return apiClient.get('/api/chatbot/sessions');
};

// Lấy chi tiết session
export const getChatbotSession = (id) => {
    return apiClient.get(`/api/chatbot/session/${id}`);
};

// Gửi tin nhắn
export const sendChatbotMessage = (id, content) => {
    return apiClient.post(`/api/chatbot/session/${id}/message`, { content });
};

// Xoá session
export const deleteChatbotSession = (id) => {
    return apiClient.delete(`/api/chatbot/session/${id}`);
};

// Lấy thống kê (admin)
export const getChatbotStats = () => {
    return apiClient.get('/api/chatbot/stats');
};
