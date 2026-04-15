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
            message.error('Please fill in all required information');
            return;
        }

        if (form.newPassword.length < 6) {
            message.error('New password must be at least 6 characters');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            message.error('Password confirmation does not match');
            return;
        }

        if (form.currentPassword === form.newPassword) {
            message.error('New password must be different from current password');
            return;
        }

        setLoading(true);
        try {
            await requestChangePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            message.success('Password changed successfully');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            message.error(err?.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const passwordFields = [
        {
            name: 'currentPassword',
            label: 'Current password',
            placeholder: 'Enter current password',
            showKey: 'current',
        },
        {
            name: 'newPassword',
            label: 'New password',
            placeholder: 'Enter new password (at least 6 characters)',
            showKey: 'new',
        },
        {
            name: 'confirmPassword',
            label: 'Confirm new password',
            placeholder: 'Re-enter new password',
            showKey: 'confirm',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-xl font-bold text-(--app-text)">Change Password</h1>
                <p className="text-(--app-text-muted) text-sm mt-1">Update your password to protect your account</p>
            </div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-xl"
            >
                <Shield className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" />
                <div>
                    <p className="text-(--app-text-muted) text-xs leading-relaxed">
                        Password should have at least 6 characters, including uppercase, lowercase, and numbers for
                        better security.
                    </p>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="customer-surface rounded-2xl p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {passwordFields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-(--app-text-muted) text-xs font-medium mb-2">
                                {field.label}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--app-text-muted)" />
                                <input
                                    type={showPasswords[field.showKey] ? 'text' : 'password'}
                                    name={field.name}
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full pl-10 pr-11 py-3 bg-(--app-input-bg) border border-(--app-border) rounded-xl text-(--app-text) text-sm placeholder:text-(--app-text-muted) outline-none transition-all duration-200 focus:border-[#0066FF]/50 hover:border-[#0066FF]/35"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword(field.showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-(--app-text-muted) hover:text-(--app-text) transition-colors"
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
                            <span>Change Password</span>
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ChangePasswordPage;
