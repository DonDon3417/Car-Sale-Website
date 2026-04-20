import { apiClient } from './axiosClient';

// Create new deposit
export const requestCreateDeposit = async (data) => {
    const res = await apiClient.post('/api/deposit/create', data);
    return res.data;
};

// Get user's deposits
export const requestGetMyDeposits = async () => {
    const res = await apiClient.get('/api/deposit/my-deposits');
    return res.data;
};

// Get deposit by ID
export const requestGetDepositById = async (id) => {
    const res = await apiClient.get(`/api/deposit/detail/${id}`);
    return res.data;
};

// Cancel deposit
export const requestCancelDeposit = async (id, reason) => {
    const res = await apiClient.put(`/api/deposit/${id}/cancel`, { reason });
    return res.data;
};

// Admin: Get all deposits
export const requestGetAllDeposits = async (params = {}) => {
    const res = await apiClient.get('/api/deposit/admin/all', { params });
    return res.data;
};

// Admin: Export deposits CSV
export const requestExportDepositsCsv = async (params = {}) => {
    return apiClient.get('/api/deposit/admin/export-csv', {
        params,
        responseType: 'blob',
    });
};

// Admin: Update deposit status
export const requestUpdateDepositStatus = async (id, data) => {
    const res = await apiClient.put(`/api/deposit/admin/${id}/status`, data);
    return res.data;
};

// Admin: Get deposit stats
export const requestGetDepositStats = async () => {
    const res = await apiClient.get('/api/deposit/admin/stats');
    return res.data;
};
