import { apiClient } from './axiosClient';

export const requestGetMyTestDriveBookings = async () => {
    const res = await apiClient.get('/api/test-drive/my-bookings');
    return res.data;
};
