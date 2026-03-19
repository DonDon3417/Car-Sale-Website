import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { message } from 'antd';
import { Camera, Save, User, Mail, Phone, MapPin, Calendar, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

import { useStore } from '../../hooks/useStore';
import { requestUpdateUser, requestUploadAvatar } from '../../config/UserRequest';

const ProfilePage = () => {
    const { dataUser, fetchAuth } = useStore();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        birthDay: '',
        avatar: '',
        email: '',
    });

    console.log(dataUser);

    useEffect(() => {
        if (dataUser?._id) {
            setForm({
                fullName: dataUser.fullName || '',
                phone: dataUser.phone || '',
                address: dataUser.address || '',
                birthDay: dataUser.birthDay ? dayjs(dataUser.birthDay).format('YYYY-MM-DD') : '',
                avatar: `${import.meta.env.VITE_URL_IMAGE}/uploads/avatars/${dataUser.avatar}` || '',
                email: dataUser.email || '',
            });
        }
    }, [dataUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName.trim()) {
            message.error('Please enter your full name');
            return;
        }
        setLoading(true);
        try {
            await requestUpdateUser({
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
                birthDay: form.birthDay || null,
            });
            message.success('Profile updated successfully');
            await fetchAuth();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            message.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            message.error('Maximum image size is 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setAvatarLoading(true);
        try {
            await requestUploadAvatar(formData);
            message.success('Avatar updated successfully');
            await fetchAuth();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Avatar upload failed');
        } finally {
            setAvatarLoading(false);
        }
    };

    const inputFields = [
        {
            name: 'fullName',
            label: 'Full name',
            icon: User,
            type: 'text',
            placeholder: 'Nhập họ and tên',
            required: true,
        },
        {
            name: 'email',
            label: 'Email',
            icon: Mail,
            type: 'email',
            value: dataUser?.email || '',
            readOnly: true,
        },
        {
            name: 'phone',
            label: 'Phone number',
            icon: Phone,
            type: 'tel',
            placeholder: 'Enter phone number',
        },
        {
            name: 'address',
            label: 'Address',
            icon: MapPin,
            type: 'text',
            placeholder: 'Enter address',
        },
        {
            name: 'birthDay',
            label: 'Days sinh',
            icon: Calendar,
            type: 'date',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-xl font-bold text-white">Profile</h1>
                <p className="text-white/40 text-sm mt-1">Manage your account information</p>
            </div>

            {/* Avatar Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6"
            >
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        {dataUser?.avatar ? (
                            <img
                                src={`${import.meta.env.VITE_URL_IMAGE}/uploads/avatars/${dataUser.avatar}`}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-[#0066FF] to-[#0044cc] rounded-full flex items-center justify-center ring-2 ring-white/10">
                                <span className="text-white text-2xl font-bold">
                                    {dataUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}

                        <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            {avatarLoading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5 text-white" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={avatarLoading}
                            />
                        </label>
                    </div>
                    <div>
                        <p className="text-white text-sm font-semibold">{dataUser?.fullName || 'User'}</p>
                        <p className="text-white/40 text-xs mt-0.5">{dataUser?.email || ''}</p>
                        <p className="text-white/30 text-[11px] mt-1">Nhấn vào ảnh để thay đổi • Tối đa 5MB</p>
                    </div>
                </div>
            </motion.div>

            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111827]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {inputFields.map((field) => {
                        const Icon = field.icon;
                        const value = field.readOnly ? field.value : form[field.name];
                        return (
                            <div key={field.name}>
                                <label className="block text-white/60 text-xs font-medium mb-2">
                                    {field.label}
                                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                                </label>
                                <div className="relative">
                                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={value}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        readOnly={field.readOnly}
                                        className={`w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 outline-none transition-all duration-200 ${
                                            field.readOnly
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'focus:border-[#0066FF]/50 focus:bg-white/[0.06] hover:border-white/15'
                                        }`}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <div className="pt-2">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-50 rounded-xl text-white text-sm font-semibold transition-colors w-full sm:w-auto cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>Save thay đổi</span>
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ProfilePage;

