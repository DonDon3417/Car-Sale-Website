import { apiClient } from './axiosClient';
import { request } from './request';

const apiBrand = '/api/brand';

export const requestGetAllBrands = async () => {
    const res = await request.get(`${apiBrand}`);
    return res.data;
};

export const requestCreateBrand = async (data) => {
    const res = await apiClient.post(`${apiBrand}/create`, data);
    return res.data;
};

export const requestUpdateBrand = async (id, data) => {
    const res = await apiClient.put(`${apiBrand}/${id}`, data);
    return res.data;
};

export const requestDeleteBrand = async (id) => {
    const res = await apiClient.delete(`${apiBrand}/${id}`);
    return res.data;
};
