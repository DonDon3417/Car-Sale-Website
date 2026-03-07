import { apiClient } from './axiosClient';

// Get dashboard stats
export const requestGetDashboardStats = async () => {
    const res = await apiClient.get('/api/dashboard/stats');
    return res.data;
};

// Get chart data
export const requestGetChartData = async () => {
    const res = await apiClient.get('/api/dashboard/chart');
    return res.data;
};

// Get recent activity
export const requestGetRecentActivity = async () => {
    const res = await apiClient.get('/api/dashboard/recent');
    return res.data;
};

// Get advanced stats
export const requestGetAdvancedStats = async () => {
    const res = await apiClient.get('/api/dashboard/advanced');
    return res.data;
};
