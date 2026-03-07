import { useState } from 'react';
import { motion } from 'framer-motion';
import { message } from 'antd';
import { Lock, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';

import { requestChangePassword } from '../../config/UserRequest';

const ChangePasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const togglePassword = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            message.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (form.newPassword.length < 6) {
            message.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (form.currentPassword === form.newPassword) {
            message.error('Mật khẩu mới không được trùng mật khẩu hiện tại');
            return;
        }

        setLoading(true);
        try {
            await requestChangePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            message.success('Đổi mật khẩu thành công');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            message.error(err?.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const passwordFields = [
        {
            name: 'currentPassword',
            label: 'Mật khẩu hiện tại',
            placeholder: 'Nhập mật khẩu hiện tại',
            showKey: 'current',
        },
        {
            name: 'newPassword',
            label: 'Mật khẩu mới',
            placeholder: 'Nhập mật khẩu mới (ít nhất 6 ký tự)',
            showKey: 'new',
        },
        {
            name: 'confirmPassword',
            label: 'Xác nhận mật khẩu mới',
            placeholder: 'Nhập lại mật khẩu mới',
            showKey: 'confirm',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-xl font-bold text-white">Đổi mật khẩu</h1>
                <p className="text-white/40 text-sm mt-1">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
            </div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-[#0066FF]/[0.06] border border-[#0066FF]/[0.12] rounded-xl"
            >
                <Shield className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" />
                <div>
                    <p className="text-white/70 text-xs leading-relaxed">
                        Mật khẩu nên có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số để đảm bảo an toàn.
                    </p>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111827]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {passwordFields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-white/60 text-xs font-medium mb-2">{field.label}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type={showPasswords[field.showKey] ? 'text' : 'password'}
                                    name={field.name}
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full pl-10 pr-11 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 outline-none transition-all duration-200 focus:border-[#0066FF]/50 focus:bg-white/[0.06] hover:border-white/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword(field.showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPasswords[field.showKey] ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-50 rounded-xl text-white text-sm font-semibold transition-colors w-full sm:w-auto cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            <span>Đổi mật khẩu</span>
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ChangePasswordPage;
