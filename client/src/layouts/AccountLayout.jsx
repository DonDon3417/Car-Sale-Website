import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Car, Lock, LogOut, ChevronRight } from 'lucide-react';
import cookies from 'js-cookie';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { useStore } from '../hooks/useStore';

const sidebarItems = [
    {
        label: 'Thông tin cá nhân',
        path: '/account/profile',
        icon: User,
    },
    {
        label: 'Đơn xe đã cọc',
        path: '/account/deposits',
        icon: Car,
    },
    {
        label: 'Đổi mật khẩu',
        path: '/account/change-password',
        icon: Lock,
    },
];

const AccountLayout = () => {
    const { dataUser } = useStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        cookies.remove('logged');
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
            <Header />

            <div className="max-w-[1100px] mx-auto px-4 pt-24 pb-16">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full lg:w-[280px] shrink-0"
                    >
                        <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden sticky top-20">
                            {/* User Info */}
                            <div className="p-5 border-b border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    {dataUser?.avatar ? (
                                        <img
                                            src={`${import.meta.env.VITE_URL_IMAGE}/uploads/avatars/${dataUser.avatar}`}
                                            alt="Avatar"
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0066FF]/30"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-[#0044cc] rounded-full flex items-center justify-center ring-2 ring-[#0066FF]/30">
                                            <span className="text-white text-lg font-bold">
                                                {dataUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-semibold truncate">
                                            {dataUser?.fullName || 'Người dùng'}
                                        </p>
                                        <p className="text-white/40 text-xs truncate">{dataUser?.email || ''}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Items */}
                            <nav className="p-2">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                                    isActive
                                                        ? 'bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20'
                                                        : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
                                                }`
                                            }
                                        >
                                            <Icon className="w-[18px] h-[18px] shrink-0" />
                                            <span className="flex-1">{item.label}</span>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                                        </NavLink>
                                    );
                                })}

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all duration-200 mt-1"
                                >
                                    <LogOut className="w-[18px] h-[18px] shrink-0" />
                                    <span className="flex-1 text-left">Đăng xuất</span>
                                </button>
                            </nav>
                        </div>
                    </motion.aside>

                    {/* Main Content */}
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex-1 min-w-0"
                    >
                        <Outlet />
                    </motion.main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AccountLayout;
