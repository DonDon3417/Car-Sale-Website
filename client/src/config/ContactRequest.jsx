import { apiClient } from './axiosClient';

const apiContact = '/api/contact';

// Send new contact message
export const requestCreateContact = async (data) => {
    const res = await apiClient.post(`${apiContact}`, data);
    return res.data;
};

// Get all contacts (Admin)
export const requestGetAllContacts = async (params = {}) => {
    const res = await apiClient.get(`${apiContact}`, { params });
    return res.data;
};

// Update contact status (Admin)
export const requestUpdateContactStatus = async (id, status) => {
    const res = await apiClient.put(`${apiContact}/${id}/status`, { status });
    return res.data;
};

// Delete contact (Admin)
export const requestDeleteContact = async (id) => {
    const res = await apiClient.delete(`${apiContact}/${id}`);
    return res.data;
};
