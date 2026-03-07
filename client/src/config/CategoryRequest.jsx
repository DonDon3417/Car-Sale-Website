import { apiClient } from './axiosClient';
import { request } from './request';

const apiCategory = '/api/category';

export const requestGetAllCategories = async () => {
    const res = await request.get(`${apiCategory}/`);
    return res.data;
};

export const requestCreateCategory = async (data) => {
    const res = await apiClient.post(`${apiCategory}/create`, data);
    return res.data;
};

export const requestUpdateCategory = async (id, data) => {
    const res = await apiClient.put(`${apiCategory}/${id}`, data);
    return res.data;
};

export const requestDeleteCategory = async (id) => {
    const res = await apiClient.delete(`${apiCategory}/${id}`);
    return res.data;
};
