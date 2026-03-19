import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import cookies from 'js-cookie';

const Topbar = ({ isCollapsed }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { dataUser } = useStore();

    const handleLogout = () => {
        cookies.remove('logged');
        window.location.href = '/';
    };

    return (
        <header
            className="sticky top-0 z-30 h-16 bg-[#0F172A]/95 backdrop-blur-md border-b border-white/5"
            style={{ marginLeft: isCollapsed ? 72 : 260, transition: 'margin-left 0.3s ease-in-out' }}
        >
            <div className="h-full flex items-center justify-between px-6">
                {/* Search */}
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF]/50 focus:bg-white/[0.07] transition-all"
                    />
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#E10600] rounded-full" />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                        >
                            {dataUser?.avatar ? (
                                <img src={dataUser.avatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">
                                        {dataUser?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                    </span>
                                </div>
                            )}
                            <div className="hidden sm:block text-left">
                                <p className="text-white text-xs font-medium">{dataUser?.fullName || 'Admin'}</p>
                                <p className="text-white/50 text-[10px]">Administrator</p>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-white/50 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-[#1E293B] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                                >
                                    <div className="p-3 border-b border-white/5">
                                        <p className="text-white text-xs font-semibold truncate">
                                            {dataUser?.fullName || 'Admin'}
                                        </p>
                                        <p className="text-white/50 text-[10px] truncate">
                                            {dataUser?.email || 'admin@autoshow.vn'}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/admin/profile"
                                            className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 text-xs transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/admin/settings"
                                            className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 text-xs transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-white/5 py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
