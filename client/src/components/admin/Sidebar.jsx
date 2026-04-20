import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Car,
    FolderTree,
    Percent,
    ClipboardList,
    Users,
    Newspaper,
    CarFront,
    BarChart3,
    Settings,
    ChevronLeft,
    LogOut,
    MessageCircle,
    CreditCard,
    Mail,
    Bot,
} from 'lucide-react';
import { requestLogout } from '../../config/UserRequest';
import { clearAuthSession } from '../../config/authSession';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Category Management', icon: FolderTree, path: '/admin/categories' },
        { name: 'Brand Management', icon: Car, path: '/admin/brands' },
        { name: 'Car Management', icon: Car, path: '/admin/cars' },
        { name: 'Consultation Chat', icon: MessageCircle, path: '/admin/chat' },
        { name: 'Car Deposits', icon: CreditCard, path: '/admin/deposits' },
        { name: 'Customers', icon: Users, path: '/admin/customers' },
        { name: 'Contact Management', icon: Mail, path: '/admin/contacts' },
        { name: 'News', icon: Newspaper, path: '/admin/news' },
        { name: 'Test Drive Requests', icon: CarFront, path: '/admin/test-drives' },
        { name: 'Dashboard Chatbot', icon: Bot, path: '/admin/chatbot-stats' },
    ];

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleLogout = async () => {
        try {
            await requestLogout();
        } catch (error) {
            console.error('Logout failed:', error);
        }

        clearAuthSession();
        navigate('/account/login', { replace: true });
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen bg-[#0F172A] border-r border-white/5 z-40 flex flex-col"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
                                <Car className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold text-sm tracking-wider">ADMIN</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isCollapsed && (
                    <div className="w-full flex justify-center">
                        <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
                            <Car className="w-4 h-4 text-white" />
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-4 px-2 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                        ${
                                            active
                                                ? 'bg-[#0066FF]/10 text-[#0066FF]'
                                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {/* Active indicator */}
                                    {active && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0066FF] rounded-r-full"
                                        />
                                    )}

                                    <item.icon
                                        className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#0066FF]' : 'group-hover:text-[#0066FF]'}`}
                                    />

                                    <AnimatePresence mode="wait">
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="text-sm font-medium whitespace-nowrap"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse Button & Logout */}
            <div className="p-2 border-t border-white/5">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronLeft className="w-5 h-5" />
                    </motion.div>
                    {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 mt-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
