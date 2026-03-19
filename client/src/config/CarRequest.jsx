import { apiClient } from './axiosClient';
import { request } from './request';

const apiCar = '/api/car';

export const requestGetAllCars = async (params = {}) => {
    // Add cache-busting timestamp to ensure fresh data
    const res = await request.get(`${apiCar}`, {
        params: {
            ...params,
            t: Date.now(),
        },
    });
    return res.data;
};

export const requestGetCarById = async (id) => {
    // Add cache-busting timestamp to ensure fresh data
    const res = await request.get(`${apiCar}/${id}?t=${Date.now()}`);
    return res.data;
};

export const requestGetCarBySlug = async (slug) => {
    // Add cache-busting timestamp to ensure fresh data
    const res = await request.get(`${apiCar}/slug/${slug}?t=${Date.now()}`);
    return res.data;
};

export const requestCreateCar = async (formData) => {
    const res = await apiClient.post(`${apiCar}/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const requestUpdateCar = async (id, formData) => {
    const res = await apiClient.put(`${apiCar}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const requestDeleteCar = async (id) => {
    const res = await apiClient.delete(`${apiCar}/${id}`);
    return res.data;
};

export const requestDeleteCarImage = async (id, imagePath) => {
    const res = await apiClient.post(`${apiCar}/${id}/delete-image`, { imagePath });
    return res.data;
};
